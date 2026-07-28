"""Tests for the delivery app — token storage, connect flows, and the deliver()
orchestration. All external HTTP is mocked; no live tokens required."""
import tempfile
from pathlib import Path
from unittest import mock

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from . import services
from .models import DeliveryRecord, IntegrationConnection


class TokenStorageTest(TestCase):
    def test_token_encrypts_and_round_trips(self):
        user = User.objects.create_user("u1", password="x")
        conn = IntegrationConnection(user=user, provider="github")
        conn.set_token("ghp_secret123")
        conn.save()
        self.assertNotIn("ghp_secret123", conn.access_token_encrypted)
        self.assertEqual(conn.access_token, "ghp_secret123")


class DeliverOrchestrationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("dev", password="x")
        self.tmp = tempfile.TemporaryDirectory()
        self.workspace = Path(self.tmp.name)
        (self.workspace / "index.html").write_text("<h1>hi</h1>")

    def tearDown(self):
        self.tmp.cleanup()

    def _connect(self, provider, token="t"):
        conn = IntegrationConnection(user=self.user, provider=provider, account_login="me")
        conn.set_token(token)
        conn.save()
        return conn

    def test_skips_when_no_files(self):
        empty = tempfile.TemporaryDirectory()
        rec = services.deliver(user=self.user, run_id="r1",
                               workspace=Path(empty.name), goal="thing")
        self.assertEqual(rec.status, "skipped")
        empty.cleanup()

    def test_skips_when_github_not_connected(self):
        rec = services.deliver(user=self.user, run_id="r2",
                               workspace=self.workspace, goal="landing page")
        self.assertEqual(rec.status, "skipped")
        self.assertIn("GitHub", rec.detail)

    def test_delivers_to_github_only(self):
        self._connect("github")
        with mock.patch.object(services, "create_github_repo",
                               return_value={"html_url": "https://github.com/me/x",
                                             "name": "x", "owner": {"login": "me"}}) as cr, \
             mock.patch.object(services, "push_files_to_github") as pf:
            rec = services.deliver(user=self.user, run_id="r3",
                                   workspace=self.workspace, goal="landing page")
        cr.assert_called_once()
        pf.assert_called_once()
        self.assertEqual(rec.status, "partial")  # no vercel
        self.assertEqual(rec.repo_url, "https://github.com/me/x")
        self.assertIn("Vercel not connected", rec.detail)

    def test_delivers_to_github_and_vercel(self):
        self._connect("github")
        self._connect("vercel")
        with mock.patch.object(services, "create_github_repo",
                               return_value={"html_url": "https://github.com/me/x",
                                             "name": "x", "owner": {"login": "me"}}), \
             mock.patch.object(services, "push_files_to_github"), \
             mock.patch.object(services, "deploy_to_vercel",
                               return_value={"url": "x-abc.vercel.app"}):
            rec = services.deliver(user=self.user, run_id="r4",
                                   workspace=self.workspace, goal="landing page")
        self.assertEqual(rec.status, "delivered")
        self.assertEqual(rec.repo_url, "https://github.com/me/x")
        self.assertEqual(rec.live_url, "https://x-abc.vercel.app")

    def test_github_failure_is_recorded_not_raised(self):
        self._connect("github")
        with mock.patch.object(services, "create_github_repo",
                               side_effect=RuntimeError("boom")):
            rec = services.deliver(user=self.user, run_id="r5",
                                   workspace=self.workspace, goal="x")
        self.assertEqual(rec.status, "failed")
        self.assertIn("boom", rec.detail)


class ConnectFlowTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("api", password="x")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_connections_endpoint_reports_status(self):
        resp = self.client.get("/api/delivery/connections/")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.json()["github"]["connected"])

    def test_github_connect_stores_token(self):
        fake_token = mock.Mock(ok=True)
        fake_token.raise_for_status = lambda: None
        fake_token.json = lambda: {"access_token": "ghp_x"}
        fake_user = mock.Mock(ok=True)
        fake_user.json = lambda: {"login": "octocat"}
        with mock.patch.object(services.requests, "post", return_value=fake_token), \
             mock.patch.object(services.requests, "get", return_value=fake_user):
            resp = self.client.post("/api/delivery/github/connect/", {"code": "abc"})
        self.assertEqual(resp.status_code, 201)
        conn = IntegrationConnection.objects.get(user=self.user, provider="github")
        self.assertEqual(conn.account_login, "octocat")
        self.assertEqual(conn.access_token, "ghp_x")

    def test_vercel_connect_requires_token(self):
        resp = self.client.post("/api/delivery/vercel/connect/", {})
        self.assertEqual(resp.status_code, 400)
