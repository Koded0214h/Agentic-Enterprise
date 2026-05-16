"""
AOS Notification Service

A single send() function abstracts whichever email transport is configured.
Supports (in priority order):
  1. Resend (preferred — best DX, free 100/day)        — env: RESEND_API_KEY
  2. Postmark (transactional)                          — env: POSTMARK_SERVER_TOKEN
  3. SendGrid                                          — env: SENDGRID_API_KEY
  4. SMTP fallback (any host)                          — env: SMTP_HOST + creds
  5. Console (dev fallback)                            — no env, just prints

Also wires up:
  - Discord webhooks for admin notifications  — env: DISCORD_WEBHOOK_URL
  - In-app notifications (DB-backed)          — always on

Usage:
    from apps.agent_gateway.notifications import send_email, notify_admin
    send_email(to="user@x.com", subject="...", body="...", template="approval")
    notify_admin("New beta signup", payload={"email": "..."})
"""
from __future__ import annotations

import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Literal

EmailTemplate = Literal[
    "verify_email", "password_reset", "approval_request",
    "budget_alert", "workspace_invite", "agent_failure", "generic",
]


def _resend_send(to: str, subject: str, body: str, from_addr: str) -> bool:
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        return False
    try:
        import urllib.request
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps({
                "from": from_addr,
                "to": [to],
                "subject": subject,
                "html": body,
            }).encode(),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status < 400
    except Exception as exc:
        print(f"[notifications] Resend error: {exc}")
        return False


def _postmark_send(to: str, subject: str, body: str, from_addr: str) -> bool:
    token = os.environ.get("POSTMARK_SERVER_TOKEN")
    if not token:
        return False
    try:
        import urllib.request
        req = urllib.request.Request(
            "https://api.postmarkapp.com/email",
            data=json.dumps({
                "From": from_addr,
                "To": to,
                "Subject": subject,
                "HtmlBody": body,
                "MessageStream": "outbound",
            }).encode(),
            headers={
                "X-Postmark-Server-Token": token,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status < 400
    except Exception as exc:
        print(f"[notifications] Postmark error: {exc}")
        return False


def _sendgrid_send(to: str, subject: str, body: str, from_addr: str) -> bool:
    api_key = os.environ.get("SENDGRID_API_KEY")
    if not api_key:
        return False
    try:
        import urllib.request
        req = urllib.request.Request(
            "https://api.sendgrid.com/v3/mail/send",
            data=json.dumps({
                "personalizations": [{"to": [{"email": to}]}],
                "from": {"email": from_addr},
                "subject": subject,
                "content": [{"type": "text/html", "value": body}],
            }).encode(),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status < 400
    except Exception as exc:
        print(f"[notifications] SendGrid error: {exc}")
        return False


def _smtp_send(to: str, subject: str, body: str, from_addr: str) -> bool:
    host = os.environ.get("SMTP_HOST")
    if not host:
        return False
    port = int(os.environ.get("SMTP_PORT", 587))
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_addr
        msg["To"] = to
        msg.attach(MIMEText(body, "html"))
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            if user:
                server.login(user, password)
            server.sendmail(from_addr, [to], msg.as_string())
        return True
    except Exception as exc:
        print(f"[notifications] SMTP error: {exc}")
        return False


# Minimal HTML templates — extend or use a real template engine in production
_TEMPLATES: dict[str, tuple[str, str]] = {
    "verify_email": (
        "Verify your AOS email",
        "<p>Hi,</p><p>Confirm your email by entering this token in AOS: <code>{token}</code></p>"
        "<p>It expires in 24 hours.</p>",
    ),
    "password_reset": (
        "Reset your AOS password",
        "<p>Use this code to reset your password: <code>{token}</code></p>"
        "<p>It expires in 1 hour.</p>",
    ),
    "approval_request": (
        "Action needs your approval — AOS",
        "<p>An agent is waiting for your approval:</p><p><b>{action}</b></p>"
        "<p>Open AOS to approve or reject.</p>",
    ),
    "budget_alert": (
        "Budget alert — AOS",
        "<p>Your workspace has used <b>{percent}%</b> of its monthly budget.</p>"
        "<p>Open AOS Finance to adjust.</p>",
    ),
    "workspace_invite": (
        "You've been invited to an AOS workspace",
        "<p>{inviter} invited you to <b>{workspace}</b>.</p>"
        "<p>Open AOS to accept.</p>",
    ),
    "agent_failure": (
        "An AOS agent failed",
        "<p>Agent <b>{agent}</b> failed:</p><pre>{error}</pre>",
    ),
}


def send_email(
    *,
    to: str,
    subject: str = "",
    body: str = "",
    template: EmailTemplate = "generic",
    context: dict | None = None,
    from_addr: str | None = None,
) -> bool:
    """
    Send an email using whichever transport is configured.
    Returns True if any provider accepted the message.
    """
    if template != "generic" and template in _TEMPLATES:
        tpl_subject, tpl_body = _TEMPLATES[template]
        subject = subject or tpl_subject
        body = body or tpl_body
        if context:
            try:
                body = body.format(**context)
            except (KeyError, IndexError):
                pass

    sender = from_addr or os.environ.get("EMAIL_FROM", "no-reply@aos-swarm.com")

    # Try transports in priority order
    for transport in (_resend_send, _postmark_send, _sendgrid_send, _smtp_send):
        if transport(to, subject, body, sender):
            return True

    # Console fallback so flows still work in dev
    print(
        f"\n[notifications] No email transport configured. Logging instead:\n"
        f"  TO:      {to}\n"
        f"  SUBJECT: {subject}\n"
        f"  BODY:    {body[:300]}\n",
        flush=True,
    )
    return False


def notify_admin(title: str, payload: dict | None = None) -> bool:
    """
    Send an admin notification via Discord webhook (if configured) and console.
    Useful for: new signups, critical failures, beta feedback, etc.
    """
    webhook = os.environ.get("DISCORD_WEBHOOK_URL")
    body = f"**{title}**"
    if payload:
        body += "\n```json\n" + json.dumps(payload, indent=2, default=str)[:1500] + "\n```"

    if webhook:
        try:
            import urllib.request
            req = urllib.request.Request(
                webhook,
                data=json.dumps({"content": body}).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status < 400:
                    return True
        except Exception as exc:
            print(f"[notifications] Discord error: {exc}")

    print(f"\n[admin] {title}\n{json.dumps(payload, default=str) if payload else ''}\n", flush=True)
    return False
