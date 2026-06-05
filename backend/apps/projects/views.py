import threading
import uuid

from django.db.models import Q, Sum, Count
from django.utils.text import slugify
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Project, ProjectMember, ProjectActivity, ProjectGoal, ProjectArtifact
from .serializers import (
    ProjectSerializer,
    ProjectMemberSerializer,
    ProjectActivitySerializer,
    ProjectGoalSerializer,
    ProjectArtifactSerializer,
)


class OwnerQuerysetMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(owner=self.request.user) | Q(memberships__user=self.request.user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all().prefetch_related("memberships", "activities", "goals", "artifacts")
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        name = serializer.validated_data.get("name") or serializer.initial_data.get("name")
        base_slug = serializer.validated_data.get("slug") or slugify(name or "project")
        slug = base_slug
        suffix = 1
        while Project.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        project = serializer.save(owner=self.request.user, slug=slug)
        ProjectMember.objects.create(project=project, user=self.request.user, role=ProjectMember.Role.OWNER)
        ProjectActivity.objects.create(
            project=project,
            actor=self.request.user,
            kind="project.created",
            summary=f"Created project {project.name}",
        )

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        project = self.get_object()
        if not request.user.is_staff and project.owner_id != request.user.id:
            return Response({"error": "Only the project owner can archive this project"}, status=status.HTTP_403_FORBIDDEN)
        project.archive()
        ProjectActivity.objects.create(
            project=project,
            actor=request.user,
            kind="project.archived",
            summary=f"Archived project {project.name}",
        )
        return Response(ProjectSerializer(project).data)

    @action(detail=True, methods=["post"])
    def add_member(self, request, pk=None):
        project = self.get_object()
        if not request.user.is_staff and project.owner_id != request.user.id:
            return Response({"error": "Only the project owner can add members"}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get("user_id")
        role = request.data.get("role") or ProjectMember.Role.MEMBER
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        member, created = ProjectMember.objects.get_or_create(
            project=project,
            user_id=user_id,
            defaults={"role": role},
        )
        if not created:
            member.role = role
            member.save(update_fields=["role"])
        return Response(ProjectMemberSerializer(member).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=["get", "post"])
    def activity(self, request, pk=None):
        project = self.get_object()
        if request.method.lower() == "post":
            activity = ProjectActivity.objects.create(
                project=project,
                actor=request.user,
                kind=request.data.get("kind") or "note",
                summary=request.data.get("summary") or "Activity",
                body=request.data.get("body") or "",
                metadata=request.data.get("metadata") or {},
            )
            return Response(ProjectActivitySerializer(activity).data, status=status.HTTP_201_CREATED)
        activities = project.activities.select_related("actor")[:100]
        return Response(ProjectActivitySerializer(activities, many=True).data)

    @action(detail=True, methods=["get"])
    def overview(self, request, pk=None):
        project = self.get_object()
        from apps.swarm_bridge.models import SwarmExecutionContext
        from apps.billing.models import UsageRecord

        recent_runs = SwarmExecutionContext.objects.filter(project=project).order_by("-created_at")[:5]
        total_spend = UsageRecord.objects.filter(project=project).aggregate(total=Sum("cost"))["total"] or 0

        return Response({
            "project": ProjectSerializer(project).data,
            "members": ProjectMemberSerializer(project.memberships.select_related("user"), many=True).data,
            "activities": ProjectActivitySerializer(project.activities.select_related("actor")[:25], many=True).data,
            "goals": ProjectGoalSerializer(project.goals.all()[:25], many=True).data,
            "artifacts": ProjectArtifactSerializer(project.artifacts.all()[:25], many=True).data,
            "recent_runs": [
                {
                    "id": str(r.id),
                    "agent": r.swarm_agent_name,
                    "status": r.status,
                    "summary": r.task_summary[:120],
                    "created_at": r.created_at.isoformat(),
                    "replay_url": f"/api/swarm/executions/{r.id}/replay/",
                }
                for r in recent_runs
            ],
            "finance_summary": {
                "total_spend": round(float(total_spend), 6),
                "currency": project.currency,
                "monthly_budget": float(project.monthly_budget or 0),
            },
        })

    @action(detail=True, methods=["get"])
    def runs(self, request, pk=None):
        """Aggregated workflow run history: WorkflowTask + SwarmExecutionContext + Conversation."""
        project = self.get_object()
        from apps.agent_intelligence.models import WorkflowTask, Conversation
        from apps.swarm_bridge.models import SwarmExecutionContext

        tasks = (
            WorkflowTask.objects.filter(project=project)
            .select_related("agent")
            .order_by("-created_at")[:50]
        )
        executions = SwarmExecutionContext.objects.filter(project=project).order_by("-created_at")[:50]
        conversations = (
            Conversation.objects.filter(project=project)
            .select_related("agent")
            .order_by("-updated_at")[:50]
        )

        tasks_data = [
            {
                "kind": "workflow_task",
                "id": str(t.id),
                "status": t.status,
                "summary": t.description[:120],
                "agent": t.agent.name if t.agent else None,
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat(),
                "input_data": t.input_data,
                "output_data": t.output_data,
                "replay_url": None,
            }
            for t in tasks
        ]
        executions_data = [
            {
                "kind": "swarm_execution",
                "id": str(e.id),
                "status": e.status,
                "summary": e.task_summary[:120],
                "agent": e.swarm_agent_name,
                "engine": e.engine,
                "cost_usd": str(e.cost_usd),
                "created_at": e.created_at.isoformat(),
                "updated_at": e.completed_at.isoformat() if e.completed_at else e.created_at.isoformat(),
                "replay_url": f"/api/swarm/executions/{e.id}/replay/",
            }
            for e in executions
        ]
        conversations_data = [
            {
                "kind": "conversation",
                "id": str(c.id),
                "status": c.status,
                "summary": c.title[:120],
                "agent": c.agent.name if c.agent else None,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat(),
                "replay_url": None,
            }
            for c in conversations
        ]

        all_runs = tasks_data + executions_data + conversations_data
        all_runs.sort(key=lambda r: r["created_at"], reverse=True)

        return Response({
            "project_id": str(project.id),
            "runs": all_runs[:100],
            "counts": {
                "workflow_tasks": len(tasks_data),
                "swarm_executions": len(executions_data),
                "conversations": len(conversations_data),
            },
        })

    @action(detail=True, methods=["get"])
    def finance(self, request, pk=None):
        """Project-scoped finance summary: usage totals + per-agent breakdown + budget status."""
        project = self.get_object()
        from apps.billing.models import UsageRecord, AgentBudget

        usage_qs = UsageRecord.objects.filter(project=project)
        totals = usage_qs.aggregate(
            total_cost=Sum("cost"),
            total_tokens_input=Sum("tokens_input"),
            total_tokens_output=Sum("tokens_output"),
            total_compute_ms=Sum("compute_time_ms"),
        )
        agent_breakdown = list(
            usage_qs.values("agent__name")
            .annotate(cost=Sum("cost"), runs=Count("id"), tokens_in=Sum("tokens_input"), tokens_out=Sum("tokens_output"))
            .order_by("-cost")[:10]
        )
        budgets = AgentBudget.objects.filter(project=project, is_active=True).select_related("agent", "department")
        budget_data = []
        for b in budgets:
            limit = float(b.monthly_limit)
            spend = float(b.current_month_spend)
            budget_data.append({
                "id": str(b.id),
                "owner": b.agent.name if b.agent else (b.department.name if b.department else "Project"),
                "monthly_limit": limit,
                "current_spend": spend,
                "remaining": max(0, limit - spend),
                "percent_used": round(spend / max(limit, 0.01) * 100, 1),
                "over_alert": spend >= limit * b.alert_threshold_percentage / 100,
                "over_limit": spend >= limit,
            })

        project_budget = float(project.monthly_budget or 0)
        project_spend = float(totals["total_cost"] or 0)

        return Response({
            "project_id": str(project.id),
            "project_budget": project_budget,
            "currency": project.currency,
            "total_cost": round(project_spend, 6),
            "total_tokens_input": totals["total_tokens_input"] or 0,
            "total_tokens_output": totals["total_tokens_output"] or 0,
            "total_compute_ms": totals["total_compute_ms"] or 0,
            "budget_remaining": round(max(0, project_budget - project_spend), 2) if project_budget else None,
            "budget_percent_used": round(project_spend / max(project_budget, 0.01) * 100, 1) if project_budget else None,
            "agent_breakdown": [
                {
                    "agent": r["agent__name"],
                    "cost": round(float(r["cost"] or 0), 6),
                    "runs": r["runs"],
                    "tokens_in": r["tokens_in"] or 0,
                    "tokens_out": r["tokens_out"] or 0,
                }
                for r in agent_breakdown
            ],
            "budgets": budget_data,
        })

    @action(detail=True, methods=["post"])
    def launch_workflow(self, request, pk=None):
        """
        Launch a workflow run scoped to this project.
        Body: { "goal": "...", "agent_id": "...", "run_immediately": true }
        Creates a WorkflowTask and optionally starts a swarm execution.
        """
        project = self.get_object()
        from apps.agent_intelligence.models import WorkflowTask
        from apps.agent_registry.models import Agent

        goal = (request.data.get("goal") or "").strip()
        if not goal:
            return Response({"error": "goal is required"}, status=status.HTTP_400_BAD_REQUEST)

        agent_id = request.data.get("agent_id")
        run_immediately = bool(request.data.get("run_immediately", False))

        agent = None
        if agent_id:
            try:
                agent = Agent.objects.get(id=agent_id, owner=request.user)
            except Agent.DoesNotExist:
                return Response({"error": "Agent not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            agent = Agent.objects.filter(owner=request.user).first()

        if not agent:
            return Response(
                {"error": "No agent available. Create an agent first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = WorkflowTask.objects.create(
            project=project,
            agent=agent,
            description=goal,
            status="PENDING",
            input_data={"goal": goal, "project_id": str(project.id)},
        )

        ProjectActivity.objects.create(
            project=project,
            actor=request.user,
            kind="workflow.launched",
            summary=f"Launched workflow: {goal[:80]}",
            metadata={"task_id": str(task.id), "agent": agent.name},
        )

        run_id = None
        if run_immediately:
            try:
                from apps.swarm_bridge.models import SwarmExecutionContext, SwarmEngine
                from apps.swarm_bridge.views import _RUNS, _native_graph_runner
                from django.utils import timezone as tz

                run_id = str(uuid.uuid4())
                SwarmExecutionContext.objects.create(
                    id=run_id,
                    aos_agent=agent,
                    project=project,
                    swarm_agent_name="project-workflow",
                    engine=SwarmEngine.GENERIC,
                    task_summary=goal[:500],
                    status="running",
                    started_at=tz.now(),
                    run_lines=[],
                )

                task.status = "IN_PROGRESS"
                task.output_data = {"execution_id": run_id}
                task.save(update_fields=["status", "output_data", "updated_at"])

                run_state = {
                    "lines": [],
                    "done": False,
                    "exit_code": None,
                    "goal": goal,
                    "engine": "native",
                    "model": "",
                    "ctx_id": run_id,
                }
                _RUNS[run_id] = run_state

                def _run_and_update():
                    _native_graph_runner(run_id, run_state, goal)
                    try:
                        task.refresh_from_db()
                        task.status = "COMPLETED" if run_state.get("exit_code") == 0 else "FAILED"
                        task.output_data = {**task.output_data, "exit_code": run_state.get("exit_code")}
                        task.save(update_fields=["status", "output_data", "updated_at"])
                    except Exception:
                        pass

                threading.Thread(target=_run_and_update, daemon=True).start()

            except Exception as exc:
                task.status = "FAILED"
                task.output_data = {"error": str(exc)}
                task.save(update_fields=["status", "output_data", "updated_at"])
                run_id = None

        return Response(
            {
                "task_id": str(task.id),
                "run_id": run_id,
                "project_id": str(project.id),
                "goal": goal,
                "agent": agent.name,
                "status": task.status,
                "poll_url": f"/api/swarm/run/{run_id}/poll/" if run_id else None,
                "stream_url": f"/api/swarm/run/{run_id}/stream/" if run_id else None,
                "replay_url": f"/api/swarm/executions/{run_id}/replay/" if run_id else None,
            },
            status=status.HTTP_201_CREATED,
        )


    @action(detail=True, methods=["get"])
    def timeline(self, request, pk=None):
        """
        Chronological event feed for a project: activity, queue events,
        touchpoints, pending approvals, and workflow/swarm runs merged and
        sorted by time. Provides the operator view of "what the system did."
        """
        project = self.get_object()
        from apps.ops.models import Touchpoint, QueueItem as OpsQueueItem
        from apps.ops_core.models import QueueItem as CoreQueueItem
        from apps.agent_intelligence.models import WorkflowTask, PendingAction
        from apps.swarm_bridge.models import SwarmExecutionContext

        events = []

        # Project activities
        for a in project.activities.select_related("actor").order_by("-created_at")[:100]:
            events.append({
                "kind": "activity",
                "subkind": a.kind,
                "id": str(a.id),
                "summary": a.summary,
                "actor": a.actor.email if a.actor else "system",
                "meta": a.metadata,
                "ts": a.created_at.isoformat(),
            })

        # Ops queue items
        for q in OpsQueueItem.objects.filter(project=project).order_by("-created_at")[:60]:
            events.append({
                "kind": "queue",
                "subkind": q.kind,
                "id": str(q.id),
                "summary": f"{q.kind} → {q.status}",
                "actor": "queue",
                "meta": {"status": q.status, "attempts": q.attempts, "error": q.last_error[:120] if q.last_error else ""},
                "ts": q.updated_at.isoformat(),
            })

        # Ops-core queue items
        for q in CoreQueueItem.objects.filter(project=project).order_by("-created_at")[:40]:
            events.append({
                "kind": "queue",
                "subkind": q.item_type,
                "id": str(q.id),
                "summary": f"{q.item_type} → {q.status}",
                "actor": "queue",
                "meta": {"status": q.status, "retries": q.retry_count, "error": q.error_message[:120] if q.error_message else ""},
                "ts": q.updated_at.isoformat(),
            })

        # Touchpoints (sales/support interactions)
        for t in Touchpoint.objects.filter(project=project).select_related("account", "lead").order_by("-created_at")[:60]:
            events.append({
                "kind": "touchpoint",
                "subkind": t.kind.lower(),
                "id": str(t.id),
                "summary": t.summary,
                "actor": t.direction.lower(),
                "meta": {
                    "account": t.account.name if t.account else None,
                    "lead": t.lead.name if t.lead else None,
                },
                "ts": t.created_at.isoformat(),
            })

        # Pending actions / approvals
        for p in PendingAction.objects.filter(project=project).select_related("agent").order_by("-created_at")[:40]:
            events.append({
                "kind": "approval",
                "subkind": p.status.lower(),
                "id": str(p.id),
                "summary": f"{p.action_type} on {p.resource} — {p.status}",
                "actor": p.agent.name if p.agent else "agent",
                "meta": {
                    "status": p.status,
                    "decided_by": p.decided_by.email if p.decided_by else None,
                },
                "ts": p.created_at.isoformat(),
            })

        # Workflow tasks (runs)
        for w in WorkflowTask.objects.filter(project=project).select_related("agent").order_by("-created_at")[:50]:
            events.append({
                "kind": "run",
                "subkind": "workflow_task",
                "id": str(w.id),
                "summary": w.description[:120],
                "actor": w.agent.name if w.agent else "agent",
                "meta": {"status": w.status},
                "ts": w.updated_at.isoformat(),
            })

        # Swarm executions
        for s in SwarmExecutionContext.objects.filter(project=project).order_by("-created_at")[:50]:
            events.append({
                "kind": "run",
                "subkind": "swarm",
                "id": str(s.id),
                "summary": s.task_summary[:120],
                "actor": s.swarm_agent_name or "swarm",
                "meta": {"status": s.status},
                "ts": s.created_at.isoformat(),
            })

        events.sort(key=lambda e: e["ts"], reverse=True)

        return Response({
            "project_id": str(project.id),
            "events": events[:200],
            "total": len(events),
        })

    @action(detail=True, methods=["get"])
    def readiness(self, request, pk=None):
        """
        Autonomy readiness score for a project. Returns a 0-100 score,
        per-capability flags, risky-action warnings, and a health summary.
        """
        project = self.get_object()
        from apps.ops.models import Lead, Ticket, QueueItem as OpsQueueItem
        from apps.ops_core.models import Lead as CoreLead, Ticket as CoreTicket
        from apps.agent_intelligence.models import WorkflowTask, PendingAction
        from apps.swarm_bridge.models import SwarmExecutionContext
        from apps.policy_engine.models import Policy
        from apps.billing.models import AgentBudget
        from apps.marketing.models import Campaign
        from apps.agent_registry.models import Agent

        # ── gather raw counts ──────────────────────────────────────────────
        goals = project.goals.all()
        goals_count = goals.count()
        goals_active = goals.filter(status__in=["PLANNED", "IN_PROGRESS"]).count()

        agents = Agent.objects.filter(owner=project.owner)
        agent_count = agents.count()

        has_budget = bool(project.monthly_budget and project.monthly_budget > 0)
        budget_obj = AgentBudget.objects.filter(project=project, is_active=True).first()

        crm_connected = (
            CoreLead.objects.filter(project=project).exclude(hubspot_id="").exists()
            or CoreLead.objects.filter(project=project).exclude(salesforce_id="").exists()
            or Lead.objects.filter(project=project).exclude(external_id="").filter(external_provider__in=["hubspot", "salesforce"]).exists()
        )
        support_connected = (
            CoreTicket.objects.filter(project=project).exclude(zendesk_id="").exists()
            or CoreTicket.objects.filter(project=project).exclude(intercom_id="").exists()
            or Ticket.objects.filter(project=project).exclude(external_id="").filter(external_provider__in=["zendesk", "intercom"]).exists()
        )

        policies_count = Policy.objects.filter(project=project, is_active=True).count()

        queue_total = OpsQueueItem.objects.filter(project=project).count()
        queue_failed = OpsQueueItem.objects.filter(project=project, status__in=["FAILED", "failed"]).count()
        queue_health_ok = queue_total == 0 or (queue_failed / queue_total) < 0.2

        workflows_run = WorkflowTask.objects.filter(project=project).exists() or SwarmExecutionContext.objects.filter(project=project).exists()

        pending_approvals = PendingAction.objects.filter(project=project, status="PENDING").count()

        campaigns_count = Campaign.objects.filter(project=project).count()

        # ── score components (weights sum to 100) ─────────────────────────
        components = [
            {"key": "goals",      "label": "Goals defined",          "weight": 15, "ok": goals_count > 0},
            {"key": "budget",     "label": "Budget configured",       "weight": 10, "ok": has_budget},
            {"key": "agents",     "label": "Agents available",        "weight": 15, "ok": agent_count > 0},
            {"key": "crm",        "label": "CRM connector active",    "weight": 10, "ok": crm_connected},
            {"key": "support",    "label": "Support connector active","weight": 10, "ok": support_connected},
            {"key": "policies",   "label": "Policies configured",     "weight": 10, "ok": policies_count > 0},
            {"key": "queue",      "label": "Queue health OK",         "weight": 10, "ok": queue_health_ok},
            {"key": "workflows",  "label": "Workflows launched",      "weight": 10, "ok": workflows_run},
            {"key": "marketing",  "label": "Marketing campaigns",     "weight": 10, "ok": campaigns_count > 0},
        ]

        score = sum(c["weight"] for c in components if c["ok"])

        # ── capability flags ───────────────────────────────────────────────
        flags = []
        for c in components:
            flags.append({
                "key": c["key"],
                "label": c["label"],
                "ok": c["ok"],
                "weight": c["weight"],
            })

        # ── risky-action warnings ──────────────────────────────────────────
        warnings = []
        if pending_approvals > 0:
            warnings.append({"level": "high", "message": f"{pending_approvals} action(s) paused, waiting for approval"})
        if queue_total > 0 and not queue_health_ok:
            pct = round(queue_failed / queue_total * 100)
            warnings.append({"level": "high", "message": f"Queue failure rate is {pct}% — check sync health"})
        if not has_budget:
            warnings.append({"level": "medium", "message": "No monthly budget set — spend is uncapped"})
        if policies_count == 0:
            warnings.append({"level": "medium", "message": "No policies configured — all agent actions are ungated"})
        if not crm_connected:
            warnings.append({"level": "low", "message": "CRM not connected — lead sync is manual"})
        if not support_connected:
            warnings.append({"level": "low", "message": "Support platform not connected — ticket sync is manual"})

        return Response({
            "project_id": str(project.id),
            "score": score,
            "score_label": "High" if score >= 70 else "Medium" if score >= 40 else "Low",
            "flags": flags,
            "warnings": warnings,
            "summary": {
                "goals": goals_count,
                "goals_active": goals_active,
                "agents": agent_count,
                "policies": policies_count,
                "campaigns": campaigns_count,
                "queue_total": queue_total,
                "queue_failed": queue_failed,
                "pending_approvals": pending_approvals,
                "crm_connected": crm_connected,
                "support_connected": support_connected,
                "has_budget": has_budget,
                "workflows_run": workflows_run,
            },
        })


class ProjectMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectMember.objects.select_related("project", "user")
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(project__owner=self.request.user) | Q(project__memberships__user=self.request.user)).distinct()


class ProjectActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectActivity.objects.select_related("project", "actor")
    serializer_class = ProjectActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(project__owner=self.request.user) | Q(project__memberships__user=self.request.user)).distinct()


class ProjectGoalViewSet(viewsets.ModelViewSet):
    queryset = ProjectGoal.objects.select_related("project", "workflow_task")
    serializer_class = ProjectGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(project__owner=self.request.user) | Q(project__memberships__user=self.request.user)).distinct()

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if project and not self.request.user.is_staff and not (
            project.owner_id == self.request.user.id or project.memberships.filter(user=self.request.user).exists()
        ):
            raise PermissionDenied("You do not have access to this project")
        serializer.save()


class ProjectArtifactViewSet(viewsets.ModelViewSet):
    queryset = ProjectArtifact.objects.select_related("project")
    serializer_class = ProjectArtifactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(project__owner=self.request.user) | Q(project__memberships__user=self.request.user)).distinct()

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if project and not self.request.user.is_staff and not (
            project.owner_id == self.request.user.id or project.memberships.filter(user=self.request.user).exists()
        ):
            raise PermissionDenied("You do not have access to this project")
        serializer.save()
