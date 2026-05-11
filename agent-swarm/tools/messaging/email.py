"""
Email tool — supports both SMTP and SendGrid.

SMTP env vars (used when SENDGRID_API_KEY is not set):
  SMTP_HOST       — e.g. smtp.gmail.com
  SMTP_PORT       — e.g. 587
  SMTP_USER       — sender address
  SMTP_PASSWORD   — app password / OAuth token
  SMTP_FROM_NAME  — display name (optional)

SendGrid env vars (preferred when set):
  SENDGRID_API_KEY
  SENDGRID_FROM_EMAIL
  SENDGRID_FROM_NAME  (optional)
"""
from __future__ import annotations

import json
import os
import smtplib
import ssl
import urllib.request
import urllib.error
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from tools.base import ToolResult, require_env


# ---------------------------------------------------------------------------
# SendGrid path
# ---------------------------------------------------------------------------

def _sendgrid_send(to: str | list[str], subject: str,
                   body_html: str, body_text: str = "") -> ToolResult:
    cfg = require_env("SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL")
    recipients = [to] if isinstance(to, str) else to
    payload = {
        "personalizations": [{"to": [{"email": r} for r in recipients]}],
        "from": {
            "email": cfg["SENDGRID_FROM_EMAIL"],
            "name": os.environ.get("SENDGRID_FROM_NAME", "AOS Agent"),
        },
        "subject": subject,
        "content": [{"type": "text/html", "value": body_html}],
    }
    if body_text:
        payload["content"].insert(0, {"type": "text/plain", "value": body_text})

    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        "https://api.sendgrid.com/v3/mail/send",
        data=data,
        headers={
            "Authorization": f"Bearer {cfg['SENDGRID_API_KEY']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return ToolResult(ok=True, data={"status": resp.status})
    except urllib.error.HTTPError as exc:
        return ToolResult(ok=False, error=f"SendGrid HTTP {exc.code}: {exc.read().decode(errors='replace')[:300]}")
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ---------------------------------------------------------------------------
# SMTP path
# ---------------------------------------------------------------------------

def _smtp_send(to: str | list[str], subject: str,
               body_html: str, body_text: str = "") -> ToolResult:
    cfg = require_env("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD")
    recipients = [to] if isinstance(to, str) else to
    from_addr = cfg["SMTP_USER"]
    from_name = os.environ.get("SMTP_FROM_NAME", "AOS Agent")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_addr}>"
    msg["To"] = ", ".join(recipients)
    if body_text:
        msg.attach(MIMEText(body_text, "plain"))
    msg.attach(MIMEText(body_html, "html"))

    port = int(cfg["SMTP_PORT"])
    try:
        context = ssl.create_default_context()
        if port == 465:
            with smtplib.SMTP_SSL(cfg["SMTP_HOST"], port, context=context, timeout=15) as server:
                server.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
                server.sendmail(from_addr, recipients, msg.as_string())
        else:
            with smtplib.SMTP(cfg["SMTP_HOST"], port, timeout=15) as server:
                server.ehlo()
                server.starttls(context=context)
                server.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
                server.sendmail(from_addr, recipients, msg.as_string())
        return ToolResult(ok=True, data={"recipients": recipients})
    except Exception as exc:
        return ToolResult(ok=False, error=str(exc))


# ---------------------------------------------------------------------------
# Public API — auto-selects backend
# ---------------------------------------------------------------------------

def send_email(to: str | list[str], subject: str,
               body_html: str, body_text: str = "") -> ToolResult:
    """
    Send an email via SendGrid (preferred) or SMTP fallback.

    to:         single address string or list of addresses.
    body_html:  HTML body (required).
    body_text:  plain-text fallback (optional but recommended).
    """
    if os.environ.get("SENDGRID_API_KEY"):
        return _sendgrid_send(to, subject, body_html, body_text)
    return _smtp_send(to, subject, body_html, body_text)


def send_plain(to: str | list[str], subject: str, body: str) -> ToolResult:
    """Convenience wrapper — sends plain text wrapped in minimal HTML."""
    html = f"<pre style='font-family:sans-serif'>{body}</pre>"
    return send_email(to, subject, html, body_text=body)


def send_report(to: str | list[str], title: str,
                sections: list[dict], footer: str = "") -> ToolResult:
    """
    Send a structured HTML report email.

    sections: list of {"heading": str, "body": str}
    """
    section_html = "".join(
        f"<h2 style='color:#333'>{s['heading']}</h2><p>{s['body']}</p>"
        for s in sections
    )
    footer_html = f"<hr><p style='color:#888;font-size:12px'>{footer}</p>" if footer else ""
    html = f"""
    <html><body style='font-family:sans-serif;max-width:680px;margin:auto'>
    <h1 style='background:#1a73e8;color:white;padding:16px;border-radius:4px'>{title}</h1>
    {section_html}
    {footer_html}
    </body></html>
    """
    return send_email(to, title, html)
