import os
from dataclasses import dataclass

import requests
from django.core.mail import send_mail


class ConnectorError(RuntimeError):
    pass


@dataclass
class ConnectorResult:
    provider: str
    external_id: str = ""
    delivered: bool = False
    payload: dict | None = None
    message: str = ""


class BaseCRMConnector:
    provider = "internal"

    def available(self) -> bool:
        return False

    def create_lead(self, lead):
        raise NotImplementedError

    def create_account(self, account):
        raise NotImplementedError

    def create_opportunity(self, opportunity):
        raise NotImplementedError


class HubSpotCRMConnector(BaseCRMConnector):
    provider = "hubspot"

    def __init__(self):
        self.token = os.environ.get("HUBSPOT_PRIVATE_APP_TOKEN", "")
        self.base_url = os.environ.get("HUBSPOT_API_BASE", "https://api.hubapi.com")

    def available(self) -> bool:
        return bool(self.token)

    def _post(self, path, body):
        response = requests.post(
            f"{self.base_url.rstrip('/')}{path}",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
            json=body,
            timeout=20,
        )
        response.raise_for_status()
        return response.json()

    def create_account(self, account):
        data = {
            "properties": {
                "name": account.name,
                "domain": account.domain,
                "industry": account.industry,
            }
        }
        return self._post("/crm/v3/objects/companies", data)

    def create_lead(self, lead):
        data = {
            "properties": {
                "firstname": (lead.name.split(" ", 1)[0] if lead.name else ""),
                "lastname": (lead.name.split(" ", 1)[1] if " " in lead.name else lead.name or "Lead"),
                "email": lead.email,
                "company": lead.company,
                "lifecyclestage": "lead",
            }
        }
        return self._post("/crm/v3/objects/contacts", data)

    def create_opportunity(self, opportunity):
        data = {
            "properties": {
                "dealname": opportunity.title,
                "amount": str(opportunity.amount),
                "closedate": opportunity.expected_close_date.isoformat() if opportunity.expected_close_date else "",
                "dealstage": "appointmentscheduled",
            }
        }
        return self._post("/crm/v3/objects/deals", data)


class SalesforceCRMConnector(BaseCRMConnector):
    provider = "salesforce"

    def __init__(self):
        self.instance_url = os.environ.get("SALESFORCE_INSTANCE_URL", "")
        self.token = os.environ.get("SALESFORCE_ACCESS_TOKEN", "")
        self.api_version = os.environ.get("SALESFORCE_API_VERSION", "v60.0")

    def available(self) -> bool:
        return bool(self.instance_url and self.token)

    def _post(self, path, body):
        response = requests.post(
            f"{self.instance_url.rstrip('/')}/services/data/{self.api_version}{path}",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
            json=body,
            timeout=20,
        )
        response.raise_for_status()
        return response.json()

    def create_account(self, account):
        return self._post("/sobjects/Account", {
            "Name": account.name,
            "Industry": account.industry,
        })

    def create_lead(self, lead):
        name_parts = (lead.name or "Lead").split(" ", 1)
        last_name = name_parts[1] if len(name_parts) > 1 else name_parts[0]
        return self._post("/sobjects/Lead", {
            "FirstName": name_parts[0] if len(name_parts) > 1 else "",
            "LastName": last_name,
            "Company": lead.company or "Unknown",
            "Email": lead.email,
            "LeadSource": lead.source or "manual",
            "Status": "Open - Not Contacted",
        })

    def create_opportunity(self, opportunity):
        return self._post("/sobjects/Opportunity", {
            "Name": opportunity.title,
            "StageName": opportunity.stage.title().replace("_", " "),
            "CloseDate": opportunity.expected_close_date.isoformat() if opportunity.expected_close_date else None,
            "Amount": float(opportunity.amount or 0),
        })


class BaseSupportConnector:
    provider = "internal"

    def available(self) -> bool:
        return False

    def create_ticket(self, ticket):
        raise NotImplementedError

    def reply_to_ticket(self, ticket, message):
        raise NotImplementedError


class ZendeskSupportConnector(BaseSupportConnector):
    provider = "zendesk"

    def __init__(self):
        self.subdomain = os.environ.get("ZENDESK_SUBDOMAIN", "")
        self.email = os.environ.get("ZENDESK_EMAIL", "")
        self.api_token = os.environ.get("ZENDESK_API_TOKEN", "")

    def available(self) -> bool:
        return bool(self.subdomain and self.email and self.api_token)

    def _auth(self):
        return (f"{self.email}/token", self.api_token)

    def _post(self, path, body):
        response = requests.post(
            f"https://{self.subdomain}.zendesk.com{path}",
            auth=self._auth(),
            headers={"Content-Type": "application/json"},
            json=body,
            timeout=20,
        )
        response.raise_for_status()
        return response.json()

    def _put(self, path, body):
        response = requests.put(
            f"https://{self.subdomain}.zendesk.com{path}",
            auth=self._auth(),
            headers={"Content-Type": "application/json"},
            json=body,
            timeout=20,
        )
        response.raise_for_status()
        return response.json()

    def create_ticket(self, ticket):
        payload = {
            "ticket": {
                "subject": ticket.subject,
                "comment": {"body": ticket.body or ticket.subject},
                "priority": ticket.priority.lower(),
                "status": "new",
                "requester": {
                    "name": ticket.requester_name,
                    "email": ticket.requester_email or None,
                },
            }
        }
        return self._post("/api/v2/tickets.json", payload)

    def reply_to_ticket(self, ticket, message):
        return self._put(f"/api/v2/tickets/{ticket.external_id}.json", {
            "ticket": {
                "comment": {"body": message},
            }
        })


class IntercomSupportConnector(BaseSupportConnector):
    provider = "intercom"

    def __init__(self):
        self.token = os.environ.get("INTERCOM_ACCESS_TOKEN", "")
        self.base_url = os.environ.get("INTERCOM_API_BASE", "https://api.intercom.io")

    def available(self) -> bool:
        return bool(self.token)

    def _post(self, path, body):
        response = requests.post(
            f"{self.base_url.rstrip('/')}{path}",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            json=body,
            timeout=20,
        )
        response.raise_for_status()
        return response.json()

    def create_ticket(self, ticket):
        payload = {
            "from": {
                "type": "user",
                "name": ticket.requester_name,
                "email": ticket.requester_email or None,
            },
            "body": ticket.body or ticket.subject,
        }
        return self._post("/conversations", payload)

    def reply_to_ticket(self, ticket, message):
        return self._post(f"/conversations/{ticket.external_id}/reply", {
            "message_type": "comment",
            "body": message,
        })


class FallbackBridge:
    def __init__(self):
        self.webhook_url = os.environ.get("OPS_FALLBACK_WEBHOOK_URL", "")
        self.webhook_secret = os.environ.get("OPS_FALLBACK_WEBHOOK_SECRET", "")
        self.email_to = os.environ.get("OPS_FALLBACK_EMAIL_TO", "")
        self.from_email = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@example.com")

    def available(self) -> bool:
        return bool(self.webhook_url or self.email_to)

    def dispatch(self, queue_item, payload):
        results = []
        if self.webhook_url:
            response = requests.post(
                self.webhook_url,
                json={
                    "queue_item_id": str(queue_item.id),
                    "kind": queue_item.kind,
                    "owner_id": str(queue_item.owner_id),
                    "payload": payload,
                    "secret": self.webhook_secret or None,
                },
                timeout=20,
            )
            response.raise_for_status()
            results.append({
                "channel": "webhook",
                "status_code": response.status_code,
            })

        if self.email_to:
            send_mail(
                subject=f"AOS ops dispatch: {queue_item.kind}",
                message=f"Queue item {queue_item.id}\n\n{payload}",
                from_email=self.from_email,
                recipient_list=[self.email_to],
                fail_silently=False,
            )
            results.append({"channel": "email", "status": "sent"})

        if results:
            return ConnectorResult(
                provider="fallback",
                delivered=True,
                payload={"results": results},
                message="Fallback bridge dispatched",
            )

        return ConnectorResult(
            provider="fallback",
            delivered=False,
            payload={"results": []},
            message="No vendor credentials and no fallback bridge configured",
        )
