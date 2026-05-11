import uuid
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.agent_registry.models import Agent, AgentType, Role
from .models import Policy, PolicyAuditLog, PolicyCondition, PolicyEffect
from .utils import PolicyEvaluator

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_agent(user, name="TestAgent"):
    return Agent.objects.create(
        name=name,
        owner=user,
        agent_type=AgentType.FUNCTIONAL,
        identity_key=str(uuid.uuid4()),
    )


def make_policy(name="Default", effect=PolicyEffect.ALLOW, resources=None, priority=0):
    return Policy.objects.create(
        name=name,
        effect=effect,
        resources=resources or ["agent:execute"],
        priority=priority,
    )


# ---------------------------------------------------------------------------
# Model Tests
# ---------------------------------------------------------------------------

class PolicyConditionModelTest(APITestCase):
    def test_str(self):
        c = PolicyCondition.objects.create(field="request.method", operator="eq", value="POST")
        self.assertIn("request.method", str(c))
        self.assertIn("eq", str(c))

    def test_all_operators_present(self):
        ops = {op for op, _ in PolicyCondition.OPERATOR_CHOICES}
        expected = {"eq", "neq", "gt", "lt", "contains", "not_contains", "in", "not_in", "between", "regex"}
        self.assertEqual(ops, expected)


class PolicyModelTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="pass")

    def test_str(self):
        p = make_policy()
        self.assertIn("Default", str(p))
        self.assertIn("ALLOW", str(p))

    def test_is_valid_now_no_constraints(self):
        p = make_policy()
        self.assertTrue(p.is_valid_now())

    def test_is_valid_now_before_valid_from(self):
        p = Policy.objects.create(
            name="Future",
            effect=PolicyEffect.ALLOW,
            resources=["agent:execute"],
            valid_from=timezone.now() + timedelta(hours=1),
        )
        self.assertFalse(p.is_valid_now())

    def test_is_valid_now_after_valid_until(self):
        p = Policy.objects.create(
            name="Expired",
            effect=PolicyEffect.ALLOW,
            resources=["agent:execute"],
            valid_until=timezone.now() - timedelta(hours=1),
        )
        self.assertFalse(p.is_valid_now())

    def test_is_valid_now_max_calls_reached(self):
        p = Policy.objects.create(
            name="Exhausted",
            effect=PolicyEffect.ALLOW,
            resources=["agent:execute"],
            max_calls=3,
            calls_made=3,
        )
        self.assertFalse(p.is_valid_now())

    def test_increment_calls(self):
        p = make_policy()
        self.assertEqual(p.calls_made, 0)
        p.increment_calls()
        p.refresh_from_db()
        self.assertEqual(p.calls_made, 1)


# ---------------------------------------------------------------------------
# PolicyEvaluator Tests
# ---------------------------------------------------------------------------

class PolicyEvaluatorTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="pass")
        self.agent = make_agent(self.user)

    # -- Default behaviour --------------------------------------------------

    def test_deny_when_no_policy_matches(self):
        evaluator = PolicyEvaluator(self.agent)
        decision, policy, reason = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.DENY)
        self.assertIsNone(policy)

    def test_audit_log_created_on_every_evaluation(self):
        evaluator = PolicyEvaluator(self.agent)
        evaluator.evaluate("agent:execute", "task")
        self.assertEqual(PolicyAuditLog.objects.filter(agent=self.agent).count(), 1)

    # -- Global policies ----------------------------------------------------

    def test_global_allow_policy_applies(self):
        make_policy(name="Global Allow", effect=PolicyEffect.ALLOW)
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_global_deny_policy_applies(self):
        make_policy(name="Global Deny", effect=PolicyEffect.DENY)
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.DENY)

    # -- Targeted (agent / role) policies -----------------------------------

    def test_agent_targeted_policy_applies(self):
        policy = make_policy(name="Agent-targeted", effect=PolicyEffect.ALLOW)
        policy.agents.add(self.agent)
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_role_targeted_policy_applies(self):
        role = Role.objects.create(name="DevRole", permissions=[])
        self.agent.roles.add(role)
        policy = make_policy(name="Role-targeted", effect=PolicyEffect.ALLOW)
        policy.roles.add(role)
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_policy_for_other_agent_does_not_apply(self):
        other = make_agent(self.user, name="OtherAgent")
        policy = make_policy(name="Other-targeted", effect=PolicyEffect.ALLOW)
        policy.agents.add(other)
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.DENY)

    # -- DENY wins ----------------------------------------------------------

    def test_deny_wins_over_allow_by_priority(self):
        make_policy(name="Low Allow", effect=PolicyEffect.ALLOW, priority=0)
        make_policy(name="High Deny", effect=PolicyEffect.DENY, priority=10)
        evaluator = PolicyEvaluator(self.agent)
        decision, policy, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.DENY)
        self.assertEqual(policy.name, "High Deny")

    # -- Resource matching --------------------------------------------------

    def test_exact_resource_match(self):
        make_policy(name="Exact", effect=PolicyEffect.ALLOW, resources=["tool:crm"])
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("tool:crm", "read")
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_wildcard_resource_match(self):
        make_policy(name="Wildcard", effect=PolicyEffect.ALLOW, resources=["tool:*"])
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("tool:crm", "read")
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_resource_no_match(self):
        make_policy(name="CRM only", effect=PolicyEffect.ALLOW, resources=["tool:crm"])
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("tool:email", "send")
        self.assertEqual(decision, PolicyEffect.DENY)

    # -- Condition evaluation -----------------------------------------------

    def _policy_with_condition(self, field, operator, value, effect=PolicyEffect.ALLOW):
        policy = make_policy(name=f"cond-{operator}", effect=effect)
        condition = PolicyCondition.objects.create(field=field, operator=operator, value=value)
        policy.conditions.add(condition)
        return policy

    def test_condition_eq_matches(self):
        self._policy_with_condition("env", "eq", "prod")
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"env": "prod"})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_eq_no_match(self):
        self._policy_with_condition("env", "eq", "prod")
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"env": "dev"})
        self.assertEqual(decision, PolicyEffect.DENY)

    def test_condition_neq(self):
        self._policy_with_condition("env", "neq", "prod")
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"env": "dev"})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_gt(self):
        self._policy_with_condition("tokens", "gt", 100)
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"tokens": 200})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_lt(self):
        self._policy_with_condition("tokens", "lt", 500)
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"tokens": 100})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_contains(self):
        self._policy_with_condition("tag", "contains", "crm")
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"tag": "use-crm-tool"})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_not_contains(self):
        self._policy_with_condition("tag", "not_contains", "danger")
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"tag": "safe"})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_in(self):
        self._policy_with_condition("region", "in", ["us-east", "us-west"])
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"region": "us-east"})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_not_in(self):
        self._policy_with_condition("region", "not_in", ["eu-central"])
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"region": "us-east"})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_between(self):
        self._policy_with_condition("score", "between", [10, 90])
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"score": 50})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_between_out_of_range(self):
        self._policy_with_condition("score", "between", [10, 90])
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"score": 100})
        self.assertEqual(decision, PolicyEffect.DENY)

    def test_condition_regex(self):
        self._policy_with_condition("path", "regex", r"^/api/v\d+/")
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={"path": "/api/v2/agents"})
        self.assertEqual(decision, PolicyEffect.ALLOW)

    def test_condition_missing_field_denies(self):
        self._policy_with_condition("required_field", "eq", "present")
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task", context={})
        self.assertEqual(decision, PolicyEffect.DENY)

    def test_nested_context_field(self):
        self._policy_with_condition("request.method", "eq", "POST")
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate(
            "agent:execute", "task", context={"request": {"method": "POST"}}
        )
        self.assertEqual(decision, PolicyEffect.ALLOW)

    # -- Time / expiry ------------------------------------------------------

    def test_expired_policy_not_applied(self):
        policy = Policy.objects.create(
            name="Expired Allow",
            effect=PolicyEffect.ALLOW,
            resources=["agent:execute"],
            valid_until=timezone.now() - timedelta(seconds=1),
        )
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.DENY)

    def test_future_policy_not_applied(self):
        Policy.objects.create(
            name="Future Allow",
            effect=PolicyEffect.ALLOW,
            resources=["agent:execute"],
            valid_from=timezone.now() + timedelta(hours=1),
        )
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.DENY)

    def test_max_calls_exhausted_policy_not_applied(self):
        Policy.objects.create(
            name="Exhausted Allow",
            effect=PolicyEffect.ALLOW,
            resources=["agent:execute"],
            max_calls=2,
            calls_made=2,
        )
        evaluator = PolicyEvaluator(self.agent)
        decision, _, _ = evaluator.evaluate("agent:execute", "task")
        self.assertEqual(decision, PolicyEffect.DENY)

    # -- Audit log details --------------------------------------------------

    def test_audit_log_records_decision_and_resource(self):
        make_policy(name="Allow All", effect=PolicyEffect.ALLOW)
        evaluator = PolicyEvaluator(self.agent)
        evaluator.evaluate("agent:execute", "task")
        log = PolicyAuditLog.objects.get(agent=self.agent)
        self.assertEqual(log.resource, "agent:execute")
        self.assertEqual(log.action, "task")
        self.assertEqual(log.decision, PolicyEffect.ALLOW)

    def test_audit_log_stores_context_in_request_data(self):
        make_policy(name="Allow All", effect=PolicyEffect.ALLOW)
        evaluator = PolicyEvaluator(self.agent)
        evaluator.evaluate("agent:execute", "task", context={"key": "value"})
        log = PolicyAuditLog.objects.get(agent=self.agent)
        self.assertEqual(log.request_data, {"key": "value"})


# ---------------------------------------------------------------------------
# PolicyViewSet API Tests
# ---------------------------------------------------------------------------

class PolicyViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="apiuser", password="pass")
        self.client.force_authenticate(user=self.user)

    def test_create_policy(self):
        url = reverse("policy-list")
        data = {
            "name": "API Test Policy",
            "effect": "ALLOW",
            "resources": ["agent:execute"],
            "priority": 5,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Policy.objects.count(), 1)
        self.assertEqual(Policy.objects.first().created_by, self.user)

    def test_list_policies(self):
        make_policy()
        url = reverse("policy-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_policy(self):
        policy = make_policy()
        url = reverse("policy-detail", args=[policy.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Default")

    def test_update_policy(self):
        policy = make_policy()
        url = reverse("policy-detail", args=[policy.id])
        response = self.client.patch(url, {"priority": 99}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        policy.refresh_from_db()
        self.assertEqual(policy.priority, 99)

    def test_delete_policy(self):
        policy = make_policy()
        url = reverse("policy-detail", args=[policy.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Policy.objects.count(), 0)

    def test_duplicate_policy(self):
        policy = make_policy(name="Original")
        url = reverse("policy-duplicate", args=[policy.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Policy.objects.count(), 2)
        copy = Policy.objects.exclude(id=policy.id).first()
        self.assertEqual(copy.name, "Original (Copy)")
        self.assertEqual(copy.calls_made, 0)

    def test_duplicate_preserves_resources(self):
        policy = make_policy(name="Source", resources=["tool:crm", "tool:email"])
        url = reverse("policy-duplicate", args=[policy.id])
        self.client.post(url)
        copy = Policy.objects.exclude(id=policy.id).first()
        self.assertEqual(copy.resources, ["tool:crm", "tool:email"])

    def test_filter_by_effect(self):
        make_policy(name="Allow", effect=PolicyEffect.ALLOW)
        make_policy(name="Deny", effect=PolicyEffect.DENY)
        url = reverse("policy-list") + "?effect=ALLOW"
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Allow")

    def test_unauthenticated_request_rejected(self):
        self.client.force_authenticate(user=None)
        url = reverse("policy-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PolicyEvaluateActionTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="evaluser", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = make_agent(self.user)

    def test_evaluate_allow(self):
        policy = make_policy(name="Eval Allow", effect=PolicyEffect.ALLOW)
        url = reverse("policy-evaluate", args=[policy.id])
        data = {
            "agent_id": str(self.agent.id),
            "resource": "agent:execute",
            "action": "task",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["decision"], PolicyEffect.ALLOW)

    def test_evaluate_deny(self):
        policy = make_policy(name="Eval Deny", effect=PolicyEffect.DENY)
        url = reverse("policy-evaluate", args=[policy.id])
        data = {
            "agent_id": str(self.agent.id),
            "resource": "agent:execute",
            "action": "task",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["decision"], PolicyEffect.DENY)

    def test_evaluate_unknown_agent_returns_404(self):
        policy = make_policy()
        url = reverse("policy-evaluate", args=[policy.id])
        data = {
            "agent_id": str(uuid.uuid4()),
            "resource": "agent:execute",
            "action": "task",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# PolicyCheckView Tests
# ---------------------------------------------------------------------------

class PolicyCheckViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="checkuser", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = make_agent(self.user)
        self.url = reverse("policy-check")

    def test_allow_decision_returned(self):
        make_policy(name="Check Allow", effect=PolicyEffect.ALLOW)
        data = {
            "agent_id": str(self.agent.id),
            "resource": "agent:execute",
            "action": "task",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["decision"], PolicyEffect.ALLOW)
        self.assertIn("timestamp", response.data)

    def test_deny_decision_returned(self):
        data = {
            "agent_id": str(self.agent.id),
            "resource": "agent:execute",
            "action": "task",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["decision"], PolicyEffect.DENY)

    def test_agent_not_owned_by_user_returns_404(self):
        other_user = User.objects.create_user(username="other", password="pass")
        other_agent = make_agent(other_user, name="OtherAgent")
        data = {
            "agent_id": str(other_agent.id),
            "resource": "agent:execute",
            "action": "task",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_request_rejected(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# PolicyAuditLogViewSet Tests
# ---------------------------------------------------------------------------

class PolicyAuditLogViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="loguser", password="pass")
        self.client.force_authenticate(user=self.user)
        self.agent = make_agent(self.user)

    def _create_log(self, decision="ALLOW"):
        return PolicyAuditLog.objects.create(
            agent=self.agent,
            resource="agent:execute",
            action="task",
            decision=decision,
            reason="test",
        )

    def test_list_logs_for_own_agents(self):
        self._create_log()
        url = reverse("policyauditlog-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_other_users_logs_not_visible(self):
        self._create_log()
        other_user = User.objects.create_user(username="spy", password="pass")
        self.client.force_authenticate(user=other_user)
        url = reverse("policyauditlog-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_audit_logs_are_read_only(self):
        log = self._create_log()
        url = reverse("policyauditlog-detail", args=[log.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
