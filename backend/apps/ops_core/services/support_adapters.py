"""
Support adapter base classes and implementations for Zendesk and Intercom.
Handles ticket sync, reply flow, and escalation flow with external ID persistence.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime


class SupportAdapter(ABC):
    """Base adapter for support platform integrations."""
    
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.config = kwargs
    
    @abstractmethod
    def sync_ticket(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync ticket to support platform. Returns external_id and sync status."""
        pass
    
    @abstractmethod
    def get_ticket(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch ticket from support platform by external ID."""
        pass
    
    @abstractmethod
    def reply_to_ticket(self, external_id: str, reply_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add reply/comment to ticket. Returns success status."""
        pass
    
    @abstractmethod
    def update_ticket_status(self, external_id: str, status: str) -> Dict[str, Any]:
        """Update ticket status. Returns success status."""
        pass
    
    @abstractmethod
    def escalate_ticket(self, external_id: str, escalation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Escalate ticket (change priority, assign, notify). Returns success status."""
        pass


class ZendeskAdapter(SupportAdapter):
    """Zendesk support adapter implementation."""
    
    def __init__(self, api_key: str, subdomain: str = None, **kwargs):
        super().__init__(api_key, **kwargs)
        self.subdomain = subdomain or "default"
        self.base_url = f"https://{self.subdomain}.zendesk.com/api/v2"
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Simulate API request to Zendesk."""
        # In production, use requests library with proper auth
        if method == "POST":
            if "comments" in endpoint:
                return {"comment": {"id": f"zd_comment_{abs(hash(str(data)))}", "body": data.get("body") if data else ""}}
            return {"ticket": {"id": f"zd_{abs(hash(str(data)))}", "status": "open"}}
        elif method == "PUT":
            ticket_id = endpoint.split("/")[-1]
            return {"ticket": {"id": ticket_id, "status": data.get("status", "open") if data else "open"}}
        elif method == "GET":
            ticket_id = endpoint.split("/")[-1]
            return {"ticket": {"id": ticket_id, "status": "open", "priority": "normal"}}
        return {}
    
    def sync_ticket(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync ticket to Zendesk."""
        try:
            payload = {
                "ticket": {
                    "subject": ticket_data.get("subject"),
                    "comment": {"body": ticket_data.get("body", "")},
                    "priority": ticket_data.get("priority", "normal"),
                    "status": ticket_data.get("status", "open"),
                    "tags": ticket_data.get("tags", []),
                }
            }
            
            if ticket_data.get("zendesk_id"):
                # Update existing
                response = self._make_request("PUT", f"/tickets/{ticket_data['zendesk_id']}", payload)
            else:
                # Create new
                response = self._make_request("POST", "/tickets", payload)
            
            ticket = response.get("ticket", {})
            return {
                "external_id": str(ticket.get("id")),
                "sync_status": "synced",
                "last_synced_at": datetime.now(),
            }
        except Exception as e:
            return {
                "external_id": None,
                "sync_status": "failed",
                "error": str(e),
            }
    
    def get_ticket(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch ticket from Zendesk."""
        try:
            response = self._make_request("GET", f"/tickets/{external_id}")
            return response.get("ticket")
        except Exception:
            return None
    
    def reply_to_ticket(self, external_id: str, reply_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add reply to Zendesk ticket."""
        try:
            payload = {
                "ticket": {
                    "comment": {
                        "body": reply_data.get("body"),
                        "public": reply_data.get("public", True),
                        "author_id": reply_data.get("author_id"),
                    }
                }
            }
            
            response = self._make_request("PUT", f"/tickets/{external_id}", payload)
            
            return {
                "success": True,
                "comment_id": response.get("comment", {}).get("id"),
                "timestamp": datetime.now(),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def update_ticket_status(self, external_id: str, status: str) -> Dict[str, Any]:
        """Update Zendesk ticket status."""
        try:
            payload = {"ticket": {"status": status}}
            response = self._make_request("PUT", f"/tickets/{external_id}", payload)
            
            return {
                "success": True,
                "status": status,
                "timestamp": datetime.now(),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def escalate_ticket(self, external_id: str, escalation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Escalate Zendesk ticket."""
        try:
            payload = {
                "ticket": {
                    "priority": escalation_data.get("priority", "high"),
                    "status": escalation_data.get("status", "open"),
                    "assignee_id": escalation_data.get("assignee_id"),
                    "tags": escalation_data.get("tags", ["escalated"]),
                }
            }
            
            if escalation_data.get("notify_message"):
                payload["ticket"]["comment"] = {
                    "body": escalation_data["notify_message"],
                    "public": False,
                }
            
            response = self._make_request("PUT", f"/tickets/{external_id}", payload)
            
            return {
                "success": True,
                "escalated": True,
                "priority": escalation_data.get("priority"),
                "timestamp": datetime.now(),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }


class IntercomAdapter(SupportAdapter):
    """Intercom support adapter implementation."""
    
    def __init__(self, api_key: str, **kwargs):
        super().__init__(api_key, **kwargs)
        self.base_url = "https://api.intercom.io"
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Simulate API request to Intercom."""
        # In production, use requests library with proper auth headers
        if method == "POST":
            if "reply" in endpoint:
                return {"id": f"ic_reply_{abs(hash(str(data)))}", "type": "comment"}
            return {"id": f"ic_{abs(hash(str(data)))}", "type": "conversation", "state": "open"}
        elif method == "PUT":
            conv_id = endpoint.split("/")[-1]
            return {"id": conv_id, "type": "conversation", "state": data.get("state", "open") if data else "open"}
        elif method == "GET":
            conv_id = endpoint.split("/")[-1]
            return {"id": conv_id, "type": "conversation", "state": "open", "priority": "normal"}
        return {}
    
    def sync_ticket(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync ticket to Intercom as a conversation."""
        try:
            payload = {
                "from": {
                    "type": "user",
                    "email": ticket_data.get("requester_email", "unknown@example.com"),
                },
                "body": ticket_data.get("body", ""),
                "subject": ticket_data.get("subject", ""),
            }
            
            if ticket_data.get("intercom_id"):
                # Update existing conversation
                update_payload = {
                    "state": ticket_data.get("status", "open"),
                    "priority": ticket_data.get("priority", "not_priority"),
                }
                response = self._make_request("PUT", f"/conversations/{ticket_data['intercom_id']}", update_payload)
            else:
                # Create new conversation
                response = self._make_request("POST", "/conversations", payload)
            
            return {
                "external_id": str(response.get("id")),
                "sync_status": "synced",
                "last_synced_at": datetime.now(),
            }
        except Exception as e:
            return {
                "external_id": None,
                "sync_status": "failed",
                "error": str(e),
            }
    
    def get_ticket(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch conversation from Intercom."""
        try:
            response = self._make_request("GET", f"/conversations/{external_id}")
            return response
        except Exception:
            return None
    
    def reply_to_ticket(self, external_id: str, reply_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add reply to Intercom conversation."""
        try:
            payload = {
                "message_type": reply_data.get("message_type", "comment"),
                "type": "admin",
                "admin_id": reply_data.get("admin_id"),
                "body": reply_data.get("body"),
            }
            
            response = self._make_request("POST", f"/conversations/{external_id}/reply", payload)
            
            return {
                "success": True,
                "reply_id": response.get("id"),
                "timestamp": datetime.now(),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def update_ticket_status(self, external_id: str, status: str) -> Dict[str, Any]:
        """Update Intercom conversation state."""
        try:
            # Map generic status to Intercom states
            state_map = {
                "open": "open",
                "pending": "open",
                "in_progress": "open",
                "resolved": "closed",
                "closed": "closed",
            }
            intercom_state = state_map.get(status, "open")
            
            payload = {"state": intercom_state}
            response = self._make_request("PUT", f"/conversations/{external_id}", payload)
            
            return {
                "success": True,
                "state": intercom_state,
                "timestamp": datetime.now(),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def escalate_ticket(self, external_id: str, escalation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Escalate Intercom conversation."""
        try:
            # Update priority and assign
            payload = {
                "priority": "priority" if escalation_data.get("priority") in ["high", "critical"] else "not_priority",
                "state": "open",
            }
            
            if escalation_data.get("assignee_id"):
                payload["assignee_id"] = escalation_data["assignee_id"]
            
            response = self._make_request("PUT", f"/conversations/{external_id}", payload)
            
            # Add internal note if provided
            if escalation_data.get("notify_message"):
                note_payload = {
                    "message_type": "note",
                    "type": "admin",
                    "admin_id": escalation_data.get("admin_id"),
                    "body": escalation_data["notify_message"],
                }
                self._make_request("POST", f"/conversations/{external_id}/reply", note_payload)
            
            return {
                "success": True,
                "escalated": True,
                "priority": payload["priority"],
                "timestamp": datetime.now(),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
