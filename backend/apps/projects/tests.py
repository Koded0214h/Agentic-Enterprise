from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Project, ProjectMember

User = get_user_model()


def _make_user(username="project-user"):
    return User.objects.create_user(username=username, email=f"{username}@example.com", password="pass12345")


def _make_project(user, slug="koded-project"):
    project = Project.objects.create(
        owner=user,
        name="Koded Project",
        slug=slug,
        stage="IDEA",
        status="ACTIVE",
        monthly_budget="500.00",
        currency="USD",
    )
    ProjectMember.objects.create(project=project, user=user, role=ProjectMember.Role.OWNER)
    return project


class ProjectApiTest(TestCase):
    def setUp(self):
        self.user = _make_user()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_create_and_list_projects(self):
        resp = self.client.post(
            "/api/projects/projects/",
            {
                "name": "Koded SaaS",
                "slug": "koded-saas",
                "description": "Startup project",
                "vision": "Autonomous company",
                "target_market": "Founders",
                "stage": "IDEA",
                "status": "ACTIVE",
                "monthly_budget": "1000.00",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Project.objects.count(), 1)
        self.assertEqual(ProjectMember.objects.count(), 1)
        list_resp = self.client.get("/api/projects/projects/")
        self.assertEqual(list_resp.status_code, 200)

    def test_overview_and_archive(self):
        project = _make_project(self.user, slug="koded-project-1")
        overview_resp = self.client.get(f"/api/projects/projects/{project.id}/overview/")
        self.assertEqual(overview_resp.status_code, 200)
        data = overview_resp.json()
        self.assertIn("project", data)
        self.assertIn("recent_runs", data)
        self.assertIn("finance_summary", data)
        archive_resp = self.client.post(f"/api/projects/projects/{project.id}/archive/")
        self.assertEqual(archive_resp.status_code, 200)
        project.refresh_from_db()
        self.assertEqual(project.status, Project.Status.ARCHIVED)

    def test_runs_endpoint_empty(self):
        project = _make_project(self.user, slug="runs-project")
        resp = self.client.get(f"/api/projects/projects/{project.id}/runs/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("runs", data)
        self.assertIn("counts", data)
        self.assertEqual(data["counts"]["workflow_tasks"], 0)
        self.assertEqual(data["counts"]["swarm_executions"], 0)
        self.assertEqual(data["counts"]["conversations"], 0)
        self.assertEqual(data["project_id"], str(project.id))

    def test_runs_endpoint_with_workflow_task(self):
        from apps.agent_registry.models import Agent, AgentType, AgentStatus
        from apps.agent_intelligence.models import WorkflowTask

        project = _make_project(self.user, slug="runs-project-wf")
        agent = Agent.objects.create(
            name="Test Agent",
            agent_type=AgentType.FUNCTIONAL,
            owner=self.user,
            identity_key="test-agent-key",
            status=AgentStatus.RUNNING,
        )
        WorkflowTask.objects.create(
            project=project,
            agent=agent,
            description="Build the landing page",
            status="PENDING",
            input_data={"goal": "Build the landing page"},
        )

        resp = self.client.get(f"/api/projects/projects/{project.id}/runs/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["counts"]["workflow_tasks"], 1)
        self.assertEqual(len(data["runs"]), 1)
        run = data["runs"][0]
        self.assertEqual(run["kind"], "workflow_task")
        self.assertEqual(run["status"], "PENDING")
        self.assertEqual(run["agent"], "Test Agent")

    def test_runs_endpoint_with_swarm_execution(self):
        from apps.swarm_bridge.models import SwarmExecutionContext

        project = _make_project(self.user, slug="runs-project-se")
        SwarmExecutionContext.objects.create(
            project=project,
            swarm_agent_name="sales-account-strategist",
            task_summary="Close 10 enterprise deals",
            status="completed",
        )

        resp = self.client.get(f"/api/projects/projects/{project.id}/runs/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["counts"]["swarm_executions"], 1)
        run = next(r for r in data["runs"] if r["kind"] == "swarm_execution")
        self.assertIn("replay_url", run)
        self.assertEqual(run["agent"], "sales-account-strategist")

    def test_finance_endpoint_empty(self):
        project = _make_project(self.user, slug="finance-project")
        resp = self.client.get(f"/api/projects/projects/{project.id}/finance/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("total_cost", data)
        self.assertIn("project_budget", data)
        self.assertIn("agent_breakdown", data)
        self.assertIn("budgets", data)
        self.assertEqual(data["project_budget"], 500.0)
        self.assertEqual(data["total_cost"], 0.0)
        self.assertEqual(data["budget_remaining"], 500.0)
        self.assertEqual(data["budgets"], [])  # no AgentBudget records

    def test_finance_endpoint_with_usage(self):
        from apps.agent_registry.models import Agent, AgentType, AgentStatus
        from apps.billing.models import UsageRecord

        project = _make_project(self.user, slug="finance-project-usage")
        agent = Agent.objects.create(
            name="Finance Agent",
            agent_type=AgentType.FUNCTIONAL,
            owner=self.user,
            identity_key="finance-agent-key",
            status=AgentStatus.RUNNING,
        )
        UsageRecord.objects.create(
            agent=agent,
            project=project,
            tokens_input=1000,
            tokens_output=500,
            cost="0.005000",
        )

        resp = self.client.get(f"/api/projects/projects/{project.id}/finance/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertAlmostEqual(data["total_cost"], 0.005, places=3)
        self.assertEqual(data["total_tokens_input"], 1000)
        self.assertEqual(len(data["agent_breakdown"]), 1)
        self.assertEqual(data["agent_breakdown"][0]["agent"], "Finance Agent")

    def test_launch_workflow_no_goal(self):
        project = _make_project(self.user, slug="launch-project-bad")
        resp = self.client.post(f"/api/projects/projects/{project.id}/launch_workflow/", {}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("error", resp.json())

    def test_launch_workflow_no_agent(self):
        project = _make_project(self.user, slug="launch-project-no-agent")
        resp = self.client.post(
            f"/api/projects/projects/{project.id}/launch_workflow/",
            {"goal": "Build an MVP", "run_immediately": False},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("No agent available", resp.json()["error"])

    def test_launch_workflow_creates_task(self):
        from apps.agent_registry.models import Agent, AgentType, AgentStatus
        from apps.agent_intelligence.models import WorkflowTask

        project = _make_project(self.user, slug="launch-project-ok")
        agent = Agent.objects.create(
            name="Launch Agent",
            agent_type=AgentType.FUNCTIONAL,
            owner=self.user,
            identity_key="launch-agent-key",
            status=AgentStatus.RUNNING,
        )

        resp = self.client.post(
            f"/api/projects/projects/{project.id}/launch_workflow/",
            {"goal": "Build the MVP", "run_immediately": False},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn("task_id", data)
        self.assertIsNone(data["run_id"])  # run_immediately=False
        self.assertEqual(data["goal"], "Build the MVP")
        self.assertEqual(data["agent"], "Launch Agent")
        self.assertEqual(data["status"], "PENDING")

        task = WorkflowTask.objects.get(id=data["task_id"])
        self.assertEqual(task.project, project)
        self.assertEqual(task.agent, agent)
        self.assertEqual(task.description, "Build the MVP")

        # Activity log should have the launch event
        activity = project.activities.filter(kind="workflow.launched").first()
        self.assertIsNotNone(activity)

    def test_launch_workflow_specific_agent(self):
        from apps.agent_registry.models import Agent, AgentType, AgentStatus
        from apps.agent_intelligence.models import WorkflowTask

        project = _make_project(self.user, slug="launch-project-specific")
        agent = Agent.objects.create(
            name="Specific Agent",
            agent_type=AgentType.FUNCTIONAL,
            owner=self.user,
            identity_key="specific-agent-key",
            status=AgentStatus.RUNNING,
        )

        resp = self.client.post(
            f"/api/projects/projects/{project.id}/launch_workflow/",
            {"goal": "Write unit tests", "agent_id": str(agent.id), "run_immediately": False},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        task = WorkflowTask.objects.get(id=data["task_id"])
        self.assertEqual(task.agent, agent)

    def test_serializer_includes_run_counts(self):
        from apps.agent_registry.models import Agent, AgentType, AgentStatus
        from apps.agent_intelligence.models import WorkflowTask
        from apps.swarm_bridge.models import SwarmExecutionContext

        project = _make_project(self.user, slug="counts-project")
        agent = Agent.objects.create(
            name="Count Agent",
            agent_type=AgentType.FUNCTIONAL,
            owner=self.user,
            identity_key="count-agent-key",
            status=AgentStatus.RUNNING,
        )
        WorkflowTask.objects.create(project=project, agent=agent, description="task 1")
        WorkflowTask.objects.create(project=project, agent=agent, description="task 2")
        SwarmExecutionContext.objects.create(project=project, swarm_agent_name="test-agent", task_summary="run 1")

        resp = self.client.get(f"/api/projects/projects/{project.id}/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["workflow_task_count"], 2)
        self.assertEqual(data["swarm_execution_count"], 1)
