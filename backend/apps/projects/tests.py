from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Project, ProjectMember

User = get_user_model()


class ProjectApiTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="project-user", email="project@example.com", password="pass12345")
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
        project = Project.objects.create(
            owner=self.user,
            name="Koded Project",
            slug="koded-project",
            stage="IDEA",
            status="ACTIVE",
        )
        ProjectMember.objects.create(project=project, user=self.user, role=ProjectMember.Role.OWNER)
        overview_resp = self.client.get(f"/api/projects/projects/{project.id}/overview/")
        self.assertEqual(overview_resp.status_code, 200)
        archive_resp = self.client.post(f"/api/projects/projects/{project.id}/archive/")
        self.assertEqual(archive_resp.status_code, 200)
        project.refresh_from_db()
        self.assertEqual(project.status, Project.Status.ARCHIVED)
