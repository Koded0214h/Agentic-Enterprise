"""Delivery API — connect GitHub/Vercel and inspect delivery outcomes."""
from pathlib import Path

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .models import DeliveryRecord, IntegrationConnection

_WORKSPACE_ROOT = Path("/tmp/aos-workspace")


def _conn_summary(conn: IntegrationConnection) -> dict:
    return {
        "provider": conn.provider,
        "account_login": conn.account_login,
        "connected": True,
        "updated_at": conn.updated_at,
    }


class ConnectionsView(APIView):
    """GET /api/delivery/connections/ — which providers the user has connected."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conns = {c.provider: _conn_summary(c)
                 for c in IntegrationConnection.objects.filter(user=request.user)}
        return Response({
            "github": conns.get("github", {"provider": "github", "connected": False}),
            "vercel": conns.get("vercel", {"provider": "vercel", "connected": False}),
        })


class GitHubConnectView(APIView):
    """POST /api/delivery/github/connect/  Body: { code, redirect_uri }

    Exchanges a `repo`-scoped OAuth code for a token and stores it. The frontend
    sends the user through GitHub authorize with scope=repo, then posts the code."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = (request.data.get("code") or "").strip()
        if not code:
            return Response({"error": "code is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            conn = services.connect_github(
                request.user, code, request.data.get("redirect_uri", ""))
        except Exception as exc:  # noqa: BLE001
            return Response({"error": f"GitHub connect failed: {exc}"},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(_conn_summary(conn), status=status.HTTP_201_CREATED)


class VercelConnectView(APIView):
    """POST /api/delivery/vercel/connect/  Body: { token }"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = (request.data.get("token") or "").strip()
        if not token:
            return Response({"error": "token is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            conn = services.connect_vercel(request.user, token)
        except Exception as exc:  # noqa: BLE001
            return Response({"error": f"Vercel connect failed: {exc}"},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(_conn_summary(conn), status=status.HTTP_201_CREATED)


class DisconnectView(APIView):
    """DELETE /api/delivery/connections/<provider>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, provider):
        IntegrationConnection.objects.filter(user=request.user, provider=provider).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _record_json(rec: DeliveryRecord) -> dict:
    return {
        "run_id": rec.run_id, "status": rec.status,
        "repo_url": rec.repo_url, "live_url": rec.live_url,
        "detail": rec.detail, "created_at": rec.created_at,
    }


class RunDeliveryView(APIView):
    """GET  /api/delivery/runs/<run_id>/           — latest delivery outcome
    POST /api/delivery/runs/<run_id>/deliver/     — (re)deliver from workspace"""
    permission_classes = [IsAuthenticated]

    def get(self, request, run_id):
        rec = (DeliveryRecord.objects
               .filter(user=request.user, run_id=run_id).first())
        if not rec:
            return Response({"run_id": run_id, "status": "none"})
        return Response(_record_json(rec))

    def post(self, request, run_id):
        workspace = _WORKSPACE_ROOT / run_id
        if not workspace.is_dir():
            return Response(
                {"error": "workspace no longer available for this run"},
                status=status.HTTP_410_GONE)
        rec = services.deliver(
            user=request.user, run_id=run_id, workspace=workspace,
            goal=(request.data.get("goal") or run_id))
        return Response(_record_json(rec), status=status.HTTP_201_CREATED)
