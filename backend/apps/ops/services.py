from __future__ import annotations

import os
from dataclasses import asdict
from decimal import Decimal
from datetime import timedelta
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .connectors import (
    ConnectorError,
    ConnectorResult,
    FallbackBridge,
    HubSpotCRMConnector,
    SalesforceCRMConnector,
    ZendeskSupportConnector,
    IntercomSupportConnector,
)
from .models import Account, Lead, Opportunity, Ticket, Touchpoint, QueueItem


def _crm_provider_name() -> str:
    return os.environ.get("OPS_CRM_PROVIDER", "hubspot").strip().lower()


def _support_provider_name() -> str:
    return os.environ.get("OPS_SUPPORT_PROVIDER", "zendesk").strip().lower()


def get_crm_connector():
    provider = _crm_provider_name()
    if provider == "salesforce":
        return SalesforceCRMConnector()
    if provider == "hubspot":
        return HubSpotCRMConnector()
    return HubSpotCRMConnector()


def get_support_connector():
    provider = _support_provider_name()
    if provider == "intercom":
        return IntercomSupportConnector()
    if provider == "zendesk":
        return ZendeskSupportConnector()
    return ZendeskSupportConnector()


def connector_status():
    crm = get_crm_connector()
    support = get_support_connector()
    bridge = FallbackBridge()
    return {
        "crm": {
            "provider": crm.provider,
            "available": crm.available(),
            "configured": crm.available(),
        },
        "support": {
            "provider": support.provider,
            "available": support.available(),
            "configured": support.available(),
        },
        "bridge": {
            "available": bridge.available(),
            "webhook_configured": bool(bridge.webhook_url),
            "email_configured": bool(bridge.email_to),
        },
        "routing": {
            "crm_mode": _crm_provider_name(),
            "support_mode": _support_provider_name(),
        },
    }


def _guess_domain(email: str) -> str:
    if "@" not in (email or ""):
        return ""
    return email.split("@", 1)[1].strip().lower()


def _get_or_create_account(owner, *, name: str = "", domain: str = "", industry: str = "") -> Account | None:
    candidate_name = name.strip()
    candidate_domain = domain.strip().lower()
    if not candidate_name and not candidate_domain:
        return None

    query = Q(owner=owner)
    if candidate_domain:
        query &= Q(domain__iexact=candidate_domain)
    elif candidate_name:
        query &= Q(name__iexact=candidate_name)

    account = Account.objects.filter(query).first()
    if account:
        updates = {}
        if candidate_name and account.name != candidate_name:
            updates["name"] = candidate_name
        if candidate_domain and account.domain != candidate_domain:
            updates["domain"] = candidate_domain
        if industry and not account.industry:
            updates["industry"] = industry
        if updates:
            for key, value in updates.items():
                setattr(account, key, value)
            account.save(update_fields=list(updates.keys()) + ["updated_at"])
        return account

    return Account.objects.create(
        owner=owner,
        name=candidate_name or candidate_domain,
        domain=candidate_domain,
        industry=industry,
    )


def _serialize_result(result):
    if isinstance(result, ConnectorResult):
        return asdict(result)
    if isinstance(result, dict):
        return result
    return {"result": str(result)}


class OpsService:
    @classmethod
    def create_lead(cls, *, owner, data: dict) -> tuple[Lead, QueueItem]:
        company = (data.get("company") or "").strip()
        email = (data.get("email") or "").strip()
        account = _get_or_create_account(
            owner,
            name=company or data.get("account_name", ""),
            domain=data.get("domain") or _guess_domain(email),
            industry=data.get("industry", ""),
        )
        lead = Lead.objects.create(
            owner=owner,
            account=account,
            name=data.get("name") or company or email or "Unnamed lead",
            email=email,
            company=company,
            source=data.get("source") or "manual",
            status=data.get("status") or Lead.Status.NEW,
            score=int(data.get("score") or 0),
            metadata=data.get("metadata") or {},
        )
        queue_item = cls.enqueue(
            owner=owner,
            kind=QueueItem.Kind.LEAD_SYNC,
            payload={"lead_id": str(lead.id), **data},
            lead=lead,
            external_provider="",
        )
        return lead, queue_item

    @classmethod
    def create_opportunity(cls, *, owner, data: dict, lead: Lead | None = None) -> tuple[Opportunity, QueueItem]:
        account = lead.account if lead and lead.account else None
        if not account and data.get("account_name"):
            account = _get_or_create_account(
                owner,
                name=data.get("account_name") or "",
                domain=data.get("domain") or "",
                industry=data.get("industry", ""),
            )
        opportunity = Opportunity.objects.create(
            owner=owner,
            account=account,
            lead=lead,
            title=data.get("title") or (lead.name if lead else "Untitled opportunity"),
            stage=data.get("stage") or Opportunity.Stage.DISCOVERY,
            amount=Decimal(str(data.get("amount") or 0)),
            currency=(data.get("currency") or "USD")[:3].upper(),
            expected_close_date=data.get("expected_close_date") or None,
            metadata=data.get("metadata") or {},
        )
        queue_item = cls.enqueue(
            owner=owner,
            kind=QueueItem.Kind.OPPORTUNITY_SYNC,
            payload={"opportunity_id": str(opportunity.id), **data},
            opportunity=opportunity,
        )
        if lead and lead.status != Lead.Status.CONVERTED:
            lead.status = Lead.Status.CONVERTED
            lead.converted_opportunity = opportunity
            lead.save(update_fields=["status", "converted_opportunity", "updated_at"])
        return opportunity, queue_item

    @classmethod
    def create_ticket(cls, *, owner, data: dict) -> tuple[Ticket, QueueItem]:
        account = _get_or_create_account(
            owner,
            name=data.get("account_name") or data.get("company", ""),
            domain=data.get("domain") or _guess_domain(data.get("requester_email", "")),
            industry=data.get("industry", ""),
        )
        ticket = Ticket.objects.create(
            owner=owner,
            account=account,
            requester_name=data.get("requester_name") or data.get("name") or "Requester",
            requester_email=data.get("requester_email") or data.get("email") or "",
            subject=data.get("subject") or "Support request",
            body=data.get("body") or "",
            channel=data.get("channel") or "internal",
            status=data.get("status") or Ticket.Status.NEW,
            priority=data.get("priority") or Ticket.Priority.NORMAL,
            assignee=data.get("assignee"),
            metadata=data.get("metadata") or {},
        )
        queue_item = cls.enqueue(
            owner=owner,
            kind=QueueItem.Kind.TICKET_SYNC,
            payload={"ticket_id": str(ticket.id), **data},
            ticket=ticket,
        )
        return ticket, queue_item

    @classmethod
    def log_touchpoint(cls, *, owner, data: dict) -> Touchpoint:
        account = None
        lead = None
        opportunity = None
        ticket = None
        if data.get("lead_id"):
            lead = Lead.objects.filter(id=data["lead_id"], owner=owner).first()
            account = lead.account if lead else None
        if data.get("opportunity_id"):
            opportunity = Opportunity.objects.filter(id=data["opportunity_id"], owner=owner).first()
            account = account or (opportunity.account if opportunity else None)
        if data.get("ticket_id"):
            ticket = Ticket.objects.filter(id=data["ticket_id"], owner=owner).first()
            account = account or (ticket.account if ticket else None)

        touchpoint = Touchpoint.objects.create(
            owner=owner,
            account=account,
            lead=lead,
            opportunity=opportunity,
            ticket=ticket,
            kind=data.get("kind") or Touchpoint.Kind.NOTE,
            direction=data.get("direction") or Touchpoint.Direction.INTERNAL,
            summary=data.get("summary") or "Touchpoint",
            body=data.get("body") or "",
            metadata=data.get("metadata") or {},
        )
        cls.enqueue(
            owner=owner,
            kind=QueueItem.Kind.TOUCHPOINT_SYNC,
            payload={"touchpoint_id": str(touchpoint.id), **data},
            touchpoint=touchpoint,
        )
        return touchpoint

    @classmethod
    def enqueue(
        cls,
        *,
        owner,
        kind: str,
        payload: dict,
        lead: Lead | None = None,
        opportunity: Opportunity | None = None,
        ticket: Ticket | None = None,
        touchpoint: Touchpoint | None = None,
        external_provider: str = "",
    ) -> QueueItem:
        return QueueItem.objects.create(
            owner=owner,
            kind=kind,
            payload=payload or {},
            lead=lead,
            opportunity=opportunity,
            ticket=ticket,
            touchpoint=touchpoint,
            external_provider=external_provider,
        )

    @classmethod
    def _mark_related(cls, item: QueueItem, provider: str, result: dict):
        if item.lead and result.get("external_id"):
            item.lead.external_provider = provider
            item.lead.external_id = str(result.get("external_id"))
            item.lead.save(update_fields=["external_provider", "external_id", "updated_at"])
        if item.opportunity and result.get("external_id"):
            item.opportunity.external_provider = provider
            item.opportunity.external_id = str(result.get("external_id"))
            item.opportunity.save(update_fields=["external_provider", "external_id", "updated_at"])
        if item.ticket and result.get("external_id"):
            item.ticket.external_provider = provider
            item.ticket.external_id = str(result.get("external_id"))
            item.ticket.save(update_fields=["external_provider", "external_id", "updated_at"])
        if item.touchpoint and result.get("external_id"):
            item.touchpoint.external_provider = provider
            item.touchpoint.external_id = str(result.get("external_id"))
            item.touchpoint.save(update_fields=["external_provider", "external_id"])

    @classmethod
    def process_queue_item(cls, item: QueueItem) -> QueueItem:
        if item.status in {QueueItem.Status.COMPLETED, QueueItem.Status.PROCESSING}:
            return item

        crm = get_crm_connector()
        support = get_support_connector()
        fallback = FallbackBridge()
        payload = item.payload or {}
        item.status = QueueItem.Status.PROCESSING
        item.attempts += 1
        item.last_error = ""
        item.save(update_fields=["status", "attempts", "last_error", "updated_at"])

        try:
            if item.kind == QueueItem.Kind.LEAD_SYNC:
                if crm.available():
                    result = crm.create_lead(item.lead)
                    item.external_provider = crm.provider
                    item.external_id = str(result.get("id") or result.get("external_id") or "")
                    item.last_result = _serialize_result(result)
                    cls._mark_related(item, crm.provider, result)
                    item.status = QueueItem.Status.COMPLETED
                else:
                    result = fallback.dispatch(item, payload)
                    item.last_result = _serialize_result(result)
                    item.status = QueueItem.Status.COMPLETED if result.delivered else QueueItem.Status.WAITING_BRIDGE
                    item.last_error = "" if result.delivered else result.message
            elif item.kind == QueueItem.Kind.OPPORTUNITY_SYNC:
                if crm.available():
                    result = crm.create_opportunity(item.opportunity)
                    item.external_provider = crm.provider
                    item.external_id = str(result.get("id") or result.get("external_id") or "")
                    item.last_result = _serialize_result(result)
                    cls._mark_related(item, crm.provider, result)
                    item.status = QueueItem.Status.COMPLETED
                else:
                    result = fallback.dispatch(item, payload)
                    item.last_result = _serialize_result(result)
                    item.status = QueueItem.Status.COMPLETED if result.delivered else QueueItem.Status.WAITING_BRIDGE
                    item.last_error = "" if result.delivered else result.message
            elif item.kind in {QueueItem.Kind.TICKET_SYNC, QueueItem.Kind.TICKET_REPLY, QueueItem.Kind.ESCALATION}:
                if support.available():
                    if item.kind == QueueItem.Kind.TICKET_SYNC:
                        result = support.create_ticket(item.ticket)
                    else:
                        result = support.reply_to_ticket(item.ticket, payload.get("message") or payload.get("body") or "")
                    item.external_provider = support.provider
                    item.external_id = str(result.get("id") or result.get("external_id") or "")
                    item.last_result = _serialize_result(result)
                    cls._mark_related(item, support.provider, result)
                    item.status = QueueItem.Status.COMPLETED
                else:
                    result = fallback.dispatch(item, payload)
                    item.last_result = _serialize_result(result)
                    item.status = QueueItem.Status.COMPLETED if result.delivered else QueueItem.Status.WAITING_BRIDGE
                    item.last_error = "" if result.delivered else result.message
            elif item.kind == QueueItem.Kind.TOUCHPOINT_SYNC:
                result = fallback.dispatch(item, payload)
                item.last_result = _serialize_result(result)
                item.status = QueueItem.Status.COMPLETED if result.delivered else QueueItem.Status.WAITING_BRIDGE
                item.last_error = "" if result.delivered else result.message
            else:
                raise ConnectorError(f"Unsupported queue item kind: {item.kind}")
        except Exception as exc:  # noqa: BLE001
            item.status = QueueItem.Status.RETRYING if item.attempts < item.max_attempts else QueueItem.Status.FAILED
            item.last_error = str(exc)
            item.next_attempt_at = timezone.now() + timedelta(minutes=min(item.attempts * 5, 30)) if item.status == QueueItem.Status.RETRYING else None
            item.last_result = {"error": str(exc)}
        finally:
            if item.status == QueueItem.Status.WAITING_BRIDGE and not item.next_attempt_at:
                item.next_attempt_at = timezone.now() + timedelta(minutes=15)
            item.save()

        return item

    @classmethod
    def process_pending(cls, *, owner=None, limit: int = 25):
        qs = QueueItem.objects.filter(
            Q(status=QueueItem.Status.PENDING) | Q(status=QueueItem.Status.RETRYING) | Q(status=QueueItem.Status.WAITING_BRIDGE),
        )
        if owner is not None:
            qs = qs.filter(owner=owner)
        now = timezone.now()
        qs = qs.filter(Q(next_attempt_at__isnull=True) | Q(next_attempt_at__lte=now))
        qs = qs.order_by("created_at")[:limit]
        processed = []
        for item in qs:
            processed.append(cls.process_queue_item(item))
        return processed

    @classmethod
    def overview(cls, *, owner=None) -> dict:
        account_qs = Account.objects.all()
        lead_qs = Lead.objects.all()
        opp_qs = Opportunity.objects.all()
        ticket_qs = Ticket.objects.all()
        touchpoint_qs = Touchpoint.objects.all()
        queue_qs = QueueItem.objects.all()
        if owner is not None:
            account_qs = account_qs.filter(owner=owner)
            lead_qs = lead_qs.filter(owner=owner)
            opp_qs = opp_qs.filter(owner=owner)
            ticket_qs = ticket_qs.filter(owner=owner)
            touchpoint_qs = touchpoint_qs.filter(owner=owner)
            queue_qs = queue_qs.filter(owner=owner)

        crm = get_crm_connector()
        support = get_support_connector()
        bridge = FallbackBridge()
        now = timezone.now()
        return {
            "counts": {
                "accounts": account_qs.count(),
                "leads": lead_qs.count(),
                "opportunities": opp_qs.count(),
                "open_opportunities": opp_qs.exclude(stage__in=[Opportunity.Stage.WON, Opportunity.Stage.LOST]).count(),
                "tickets": ticket_qs.count(),
                "open_tickets": ticket_qs.exclude(status__in=[Ticket.Status.RESOLVED, Ticket.Status.CLOSED]).count(),
                "touchpoints": touchpoint_qs.count(),
                "queue_pending": queue_qs.filter(status__in=[QueueItem.Status.PENDING, QueueItem.Status.RETRYING, QueueItem.Status.WAITING_BRIDGE]).count(),
                "queue_failed": queue_qs.filter(status=QueueItem.Status.FAILED).count(),
                "queue_due_now": queue_qs.filter(Q(next_attempt_at__isnull=True) | Q(next_attempt_at__lte=now)).filter(status__in=[QueueItem.Status.PENDING, QueueItem.Status.RETRYING, QueueItem.Status.WAITING_BRIDGE]).count(),
            },
            "providers": {
                "crm": {
                    "provider": crm.provider,
                    "available": crm.available(),
                },
                "support": {
                    "provider": support.provider,
                    "available": support.available(),
                },
                "bridge": {
                    "available": bridge.available(),
                },
            },
        }
