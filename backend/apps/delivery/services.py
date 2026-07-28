"""
Delivery services — turn a finished swarm run's workspace into a live product.

Flow:
  1. Push the generated files to a NEW repo in the user's own GitHub account
     (using their OAuth token, `repo` scope).
  2. Deploy the same files to Vercel (inline-files deployment) for a live URL.

Both steps are best-effort and independent: GitHub gives ownership, Vercel gives
a live URL. If the user hasn't connected a provider, that step is skipped
cleanly rather than failing the run.

External API calls are isolated in small functions so they are easy to mock in
tests (no live tokens needed to exercise the orchestration).
"""
from __future__ import annotations

import base64
import os
import re
import uuid
from pathlib import Path

import requests

from django.contrib.auth.models import User

from .models import DeliveryRecord, IntegrationConnection

GITHUB_API = "https://api.github.com"
VERCEL_API = "https://api.vercel.com"

# Files we never ship.
_IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".next", "dist", ".vercel"}
_MAX_FILE_BYTES = 5 * 1024 * 1024  # skip anything huge


# ---------------------------------------------------------------------------
# Connections
# ---------------------------------------------------------------------------

def get_connection(user, provider: str) -> IntegrationConnection | None:
    return IntegrationConnection.objects.filter(user=user, provider=provider).first()


def connect_github(user, code: str, redirect_uri: str = "") -> IntegrationConnection:
    """Exchange an OAuth `code` (from a `repo`-scoped authorize) for a token and
    store it against the user."""
    client_id = os.environ.get("GITHUB_CLIENT_ID", "")
    client_secret = os.environ.get("GITHUB_CLIENT_SECRET", "")
    resp = requests.post(
        "https://github.com/login/oauth/access_token",
        json={"client_id": client_id, "client_secret": client_secret,
              "code": code, "redirect_uri": redirect_uri},
        headers={"Accept": "application/json"},
        timeout=15,
    )
    resp.raise_for_status()
    token = resp.json().get("access_token")
    if not token:
        raise ValueError(resp.json().get("error_description", "no access_token from GitHub"))

    login = ""
    who = requests.get(f"{GITHUB_API}/user",
                       headers={"Authorization": f"Bearer {token}",
                                "Accept": "application/vnd.github+json"}, timeout=15)
    if who.ok:
        login = who.json().get("login", "")

    conn, _ = IntegrationConnection.objects.get_or_create(user=user, provider="github")
    conn.set_token(token)
    conn.account_login = login
    conn.save()
    return conn


def connect_vercel(user, token: str) -> IntegrationConnection:
    """Store a Vercel token after validating it against /v2/user."""
    who = requests.get(f"{VERCEL_API}/v2/user",
                       headers={"Authorization": f"Bearer {token}"}, timeout=15)
    who.raise_for_status()
    username = (who.json().get("user") or {}).get("username", "")

    conn, _ = IntegrationConnection.objects.get_or_create(user=user, provider="vercel")
    conn.set_token(token)
    conn.account_login = username
    conn.save()
    return conn


# ---------------------------------------------------------------------------
# Workspace
# ---------------------------------------------------------------------------

def collect_files(workspace: Path) -> list[tuple[str, bytes]]:
    """Return (relative_path, bytes) for every deliverable file in the workspace."""
    files: list[tuple[str, bytes]] = []
    for root, dirs, names in os.walk(workspace):
        dirs[:] = [d for d in dirs if d not in _IGNORE_DIRS and not d.startswith(".")]
        for name in names:
            if name.startswith("."):
                continue
            full = Path(root) / name
            try:
                if full.stat().st_size > _MAX_FILE_BYTES:
                    continue
                data = full.read_bytes()
            except OSError:
                continue
            rel = str(full.relative_to(workspace))
            files.append((rel, data))
    return files


def slugify_repo_name(goal: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", goal.lower()).strip("-")[:40] or "aos-project"
    return f"{base}-{uuid.uuid4().hex[:6]}"


# ---------------------------------------------------------------------------
# GitHub
# ---------------------------------------------------------------------------

def _gh_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json"}


def create_github_repo(token: str, name: str, private: bool = False) -> dict:
    """Create a repo in the authenticated user's account (auto-inits main)."""
    resp = requests.post(
        f"{GITHUB_API}/user/repos",
        headers=_gh_headers(token),
        json={"name": name, "private": private, "auto_init": True,
              "description": "Built by AOS"},
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json()


def push_files_to_github(token: str, owner: str, repo: str,
                         files: list[tuple[str, bytes]], branch: str = "main") -> None:
    """Write each file via the Contents API. The repo is auto-init'd so `branch`
    already exists; new paths need no sha."""
    for rel, data in files:
        path = rel.replace(os.sep, "/")
        requests.put(
            f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
            headers=_gh_headers(token),
            json={"message": f"Add {path}",
                  "content": base64.b64encode(data).decode(),
                  "branch": branch},
            timeout=30,
        ).raise_for_status()


# ---------------------------------------------------------------------------
# Vercel
# ---------------------------------------------------------------------------

def deploy_to_vercel(token: str, project_name: str,
                     files: list[tuple[str, bytes]]) -> dict:
    """Create a production deployment from inline files. Returns the deployment
    JSON (contains `url`)."""
    inline = [{"file": rel.replace(os.sep, "/"),
               "data": base64.b64encode(data).decode(),
               "encoding": "base64"}
              for rel, data in files]
    resp = requests.post(
        f"{VERCEL_API}/v13/deployments",
        headers={"Authorization": f"Bearer {token}",
                 "Content-Type": "application/json"},
        json={"name": project_name, "files": inline, "target": "production",
              "projectSettings": {"framework": None}},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def deliver(*, user: User, run_id: str, workspace: Path, goal: str) -> DeliveryRecord:
    """Deliver a finished run's workspace to GitHub + Vercel. Best-effort:
    always returns a DeliveryRecord describing what happened."""
    record = DeliveryRecord(user=user, run_id=run_id, status="pending")

    files = collect_files(Path(workspace))
    if not files:
        record.status = "skipped"
        record.detail = "no files were generated to deliver"
        record.save()
        return record

    gh = get_connection(user, "github")
    if not gh:
        record.status = "skipped"
        record.detail = "GitHub not connected — connect it to publish the build"
        record.save()
        return record

    name = slugify_repo_name(goal)
    try:
        repo = create_github_repo(gh.access_token, name)
        owner = repo["owner"]["login"]
        push_files_to_github(gh.access_token, owner, repo["name"], files)
        record.repo_url = repo.get("html_url", "")
        record.status = "delivered"
    except Exception as exc:  # noqa: BLE001
        record.status = "failed"
        record.detail = f"GitHub push failed: {exc}"
        record.save()
        return record

    vc = get_connection(user, "vercel")
    if vc:
        try:
            dep = deploy_to_vercel(vc.access_token, name, files)
            url = dep.get("url", "")
            record.live_url = f"https://{url}" if url and not url.startswith("http") else url
        except Exception as exc:  # noqa: BLE001
            record.status = "partial"
            record.detail = f"repo pushed; Vercel deploy failed: {exc}"
    else:
        record.status = "partial"
        record.detail = "repo pushed; Vercel not connected (no live URL)"

    record.save()
    return record
