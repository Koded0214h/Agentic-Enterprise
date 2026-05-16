"""
AOS Notification Service — Gmail SMTP default

Sends transactional email via Gmail SMTP. Two env vars are all you need:

    GMAIL_USER=you@gmail.com
    GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx    # NOT your real password — see below

Where to get the App Password:
  1. https://myaccount.google.com/security  → enable 2-Step Verification
  2. https://myaccount.google.com/apppasswords
  3. Generate a password for "Mail" / "AOS backend" → copy the 16-char string
     (spaces are fine; keep or strip them)

If GMAIL_APP_PASSWORD is empty, emails fall back to console logging so flows
still work in dev without any setup.

(Optional override: set SMTP_HOST/PORT/USER/PASSWORD to use a different provider.
 Discord webhook for admin pings stays at DISCORD_WEBHOOK_URL.)
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


# Minimal HTML templates — extend or use a real template engine in production
_TEMPLATES: dict[str, tuple[str, str]] = {
    "verify_email": (
        "Verify your AOS email",
        "<p>Hi,</p><p>Confirm your email by entering this token in AOS: "
        "<code style='font-size:18px;background:#f4f4f5;padding:6px 10px;border-radius:6px'>{token}</code></p>"
        "<p>It expires in 24 hours.</p>",
    ),
    "password_reset": (
        "Reset your AOS password",
        "<p>Use this code to reset your password: "
        "<code style='font-size:18px;background:#f4f4f5;padding:6px 10px;border-radius:6px'>{token}</code></p>"
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


def _gmail_smtp_send(to: str, subject: str, body: str, from_addr: str) -> bool:
    """
    Send via Gmail SMTP.
    Uses GMAIL_USER + GMAIL_APP_PASSWORD (or falls back to APP_PASSWORD,
    matching the legacy variable name some setups use).
    """
    user = os.environ.get("GMAIL_USER") or os.environ.get("EMAIL_USER")
    app_password = (
        os.environ.get("GMAIL_APP_PASSWORD")
        or os.environ.get("APP_PASSWORD")
        or ""
    ).replace(" ", "")  # Google shows the password with spaces; strip them.

    if not app_password:
        return False

    sender = user or from_addr
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = to
        msg.attach(MIMEText(body, "html"))
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as server:
            server.starttls()
            server.login(sender, app_password)
            server.sendmail(sender, [to], msg.as_string())
        return True
    except Exception as exc:
        print(f"[notifications] Gmail SMTP error: {exc}")
        return False


def _custom_smtp_send(to: str, subject: str, body: str, from_addr: str) -> bool:
    """Generic SMTP override (Mailgun, AWS SES, Postmark SMTP, etc.)."""
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
    Send an email. Tries Gmail SMTP first, then any configured SMTP override,
    then falls back to console logging so dev flows still work.
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

    sender = (
        from_addr
        or os.environ.get("EMAIL_FROM")
        or os.environ.get("GMAIL_USER")
        or os.environ.get("EMAIL_USER")
        or "no-reply@aos-swarm.com"
    )

    if _gmail_smtp_send(to, subject, body, sender):
        return True
    if _custom_smtp_send(to, subject, body, sender):
        return True

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
    Admin notification via Discord webhook (if DISCORD_WEBHOOK_URL set),
    else console log.
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
