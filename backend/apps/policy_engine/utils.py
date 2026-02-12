import re
from typing import Dict, Any, List, Tuple, Optional

from django.utils import timezone

from .models import Policy, PolicyAuditLog, PolicyEffect
from apps.agent_registry.models import Agent


class PolicyEvaluator:
    """
    Core policy evaluation engine.
    Evaluates requests against all applicable policies.
    """

    def __init__(self, agent: Agent):
        self.agent = agent
        self.applicable_policies = self._get_applicable_policies()

    def _get_applicable_policies(self) -> List[Policy]:
        """
        Return every active Policy that applies to this agent, ordered by
        descending priority.

        A policy is considered applicable if ANY of the following is true:
          1. It explicitly names this agent in its agents M2M.
          2. It names one of the agent's roles in its roles M2M.
          3. It is a *global* policy — i.e. it has **no** agents and **no**
             roles assigned at all (applies to everyone).

        Bug fix: the previous implementation used
          ``Q(agents__isnull=True, roles__isnull=True)``
        on ManyToManyFields.  On an M2M, ``__isnull=True`` does NOT mean
        "no related objects exist" — it means "the join table contains a row
        with a NULL FK", which never happens.  A policy with zero agents
        assigned produces *no* rows in the join table, so the isnull filter
        never matched any global policy, causing every request to hit the
        hard-coded DENY default with reason "No applicable policy found".

        The correct idiom is to exclude policies that have *any* explicit
        agent or role assignment, which is done here by filtering the global
        set separately and combining with a union.
        """
        from django.db.models import Q

        role_ids = self.agent.roles.values_list("id", flat=True)

        # Policies aimed directly at this agent or its roles.
        targeted = Policy.objects.filter(
            Q(is_active=True),
            Q(agents=self.agent) | Q(roles__in=role_ids),
        )

        # Policies with no agent or role assignments — truly global policies.
        global_policies = Policy.objects.filter(is_active=True).exclude(
            agents__isnull=False
        ).exclude(
            roles__isnull=False
        )

        policies = (
            (targeted | global_policies)
            .distinct()
            .order_by("-priority")
        )

        return [p for p in policies if p.is_valid_now()]

    def evaluate(
        self,
        resource: str,
        action: str,
        context: Dict[str, Any] = None,
    ) -> Tuple[str, Optional[Policy], str]:
        """
        Evaluate whether the agent may access *resource* via *action*.

        Parameters
        ----------
        resource : str
            The resource being accessed, e.g. ``"agent:execute"``.
        action : str
            The action being performed, e.g. ``"task"`` or ``"chat"``.
        context : dict, optional
            Arbitrary key/value pairs used for condition evaluation and stored
            in ``PolicyAuditLog.request_data``.  This dict is **never** passed
            as a keyword argument to ``PolicyAuditLog.objects.create()``
            directly — doing so caused the ``TypeError: unexpected keyword
            arguments: 'context'`` crash because the model has no such field.

        Returns
        -------
        Tuple[decision, policy, reason]
        """
        context = context or {}
        start_time = timezone.now()

        decision: str = PolicyEffect.DENY
        applying_policy: Optional[Policy] = None
        reason = "No applicable policy found"

        for policy in self.applicable_policies:
            if not self._resource_matches(policy.resources, resource):
                continue

            if not self._evaluate_conditions(policy, context):
                continue

            applying_policy = policy
            decision = policy.effect
            reason = f"Policy '{policy.name}' applied with effect {policy.effect}"

            # Explicit DENY wins immediately.
            if policy.effect == PolicyEffect.DENY:
                break

        elapsed_ms = int(
            (timezone.now() - start_time).microseconds / 1000
        )  # microseconds → ms, cast to int (field is IntegerField)

        self._log_decision(
            resource=resource,
            action=action,
            decision=decision,
            policy=applying_policy,
            reason=reason,
            request_data=context,       # stored in request_data, not context
            execution_time_ms=elapsed_ms,
        )

        if applying_policy and decision in (PolicyEffect.ALLOW, PolicyEffect.DENY):
            applying_policy.increment_calls()

        return decision, applying_policy, reason

    # ------------------------------------------------------------------
    # Matching helpers
    # ------------------------------------------------------------------

    def _resource_matches(self, policy_resources: List[str], requested_resource: str) -> bool:
        for pattern in policy_resources:
            if pattern == requested_resource:
                return True
            if pattern.endswith(":*") and requested_resource.startswith(pattern[:-2]):
                return True
            if any(c in pattern for c in ("*", "?", "[")):
                regex_pattern = pattern.replace("*", ".*").replace("?", ".")
                if re.match(f"^{regex_pattern}$", requested_resource):
                    return True
        return False

    def _evaluate_conditions(self, policy: Policy, context: Dict[str, Any]) -> bool:
        if not policy.conditions.exists():
            return True
        for condition in policy.conditions.all():
            value = self._get_nested_value(context, condition.field)
            if value is None:
                return False
            if not self._evaluate_operator(condition.operator, value, condition.value):
                return False
        return True

    def _get_nested_value(self, data: Dict, path: str) -> Any:
        keys = path.split(".")
        value = data
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return None
        return value

    def _evaluate_operator(self, operator: str, left: Any, right: Any) -> bool:
        try:
            if operator == "eq":
                return left == right
            elif operator == "neq":
                return left != right
            elif operator == "gt":
                return float(left) > float(right)
            elif operator == "lt":
                return float(left) < float(right)
            elif operator == "contains":
                return right in left if isinstance(left, (str, list)) else False
            elif operator == "not_contains":
                return right not in left if isinstance(left, (str, list)) else True
            elif operator == "in":
                return left in right if isinstance(right, list) else False
            elif operator == "not_in":
                return left not in right if isinstance(right, list) else True
            elif operator == "between":
                return (
                    right[0] <= left <= right[1]
                    if isinstance(right, list) and len(right) == 2
                    else False
                )
            elif operator == "regex":
                return bool(re.match(right, str(left)))
        except (ValueError, TypeError):
            return False
        return False

    def _log_decision(
        self,
        resource: str,
        action: str,
        decision: str,
        reason: str,
        execution_time_ms: int,
        policy: Optional[Policy] = None,
        request_data: Dict[str, Any] = None,
    ) -> None:
        """
        Persist a ``PolicyAuditLog`` row.

        Only fields that exist on the model are written.  The old code passed
        ``context=`` as a kwarg which has no corresponding DB column, raising:
        ``TypeError: PolicyAuditLog() got unexpected keyword arguments: 'context'``
        The context dict is now stored in ``request_data`` (a JSONField that
        *is* on the model) so the evaluation context is still auditable.
        """
        PolicyAuditLog.objects.create(
            agent=self.agent,
            policy=policy,
            resource=resource,
            action=action,
            decision=decision,
            reason=reason,
            request_data=request_data or {},
            execution_time_ms=execution_time_ms,
        )


# ---------------------------------------------------------------------------
# View decorator
# ---------------------------------------------------------------------------

def enforce_policy(resource=None, action=None):
    """
    Decorator to enforce policies on view functions.

    Usage::

        @enforce_policy(resource="tool:crm", action="read")
        def my_view(request):
            ...
    """
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if hasattr(request, "auth") and isinstance(request.auth, Agent):
                agent = request.auth
            elif hasattr(request, "user") and isinstance(request.user, Agent):
                agent = request.user
            else:
                # No agent identity on this request — skip policy check.
                return view_func(request, *args, **kwargs)

            evaluator = PolicyEvaluator(agent)
            decision, policy, reason = evaluator.evaluate(
                resource=resource or request.path,
                action=action or request.method.lower(),
                context={
                    "request": {
                        "method": request.method,
                        "path": request.path,
                        "query_params": dict(request.GET.items()),
                    },
                    "view": view_func.__name__,
                },
            )

            if decision == PolicyEffect.DENY:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(f"Policy denied: {reason}")

            # ESCALATE: approval workflow not yet implemented.
            # Fall through for ALLOW / AUDIT.
            return view_func(request, *args, **kwargs)

        return wrapper
    return decorator