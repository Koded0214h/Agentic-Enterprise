"""
CRM adapter base classes and implementations for HubSpot and Salesforce.
Handles sync operations with external ID persistence and failure handling.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime


class CRMAdapter(ABC):
    """Base adapter for CRM integrations."""
    
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.config = kwargs
    
    @abstractmethod
    def sync_account(self, account_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync account to CRM. Returns external_id and sync status."""
        pass
    
    @abstractmethod
    def sync_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync lead to CRM. Returns external_id and sync status."""
        pass
    
    @abstractmethod
    def sync_opportunity(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync opportunity to CRM. Returns external_id and sync status."""
        pass
    
    @abstractmethod
    def get_account(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch account from CRM by external ID."""
        pass
    
    @abstractmethod
    def get_lead(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch lead from CRM by external ID."""
        pass
    
    @abstractmethod
    def get_opportunity(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch opportunity from CRM by external ID."""
        pass


class HubSpotAdapter(CRMAdapter):
    """HubSpot CRM adapter implementation."""
    
    def __init__(self, api_key: str, **kwargs):
        super().__init__(api_key, **kwargs)
        self.base_url = "https://api.hubapi.com"
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Simulate API request to HubSpot."""
        # In production, use requests library
        # For now, simulate success
        if method == "POST":
            return {"id": f"hs_{abs(hash(str(data)))}", "status": "success"}
        elif method == "PATCH":
            return {"id": endpoint.split("/")[-1], "status": "success"}
        elif method == "GET":
            return {"id": endpoint.split("/")[-1], "properties": {}}
        return {}
    
    def sync_account(self, account_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync account to HubSpot as a Company."""
        try:
            payload = {
                "properties": {
                    "name": account_data.get("name"),
                    "domain": account_data.get("domain", ""),
                    "industry": account_data.get("industry", ""),
                    "website": account_data.get("website", ""),
                }
            }
            
            if account_data.get("hubspot_id"):
                # Update existing
                response = self._make_request("PATCH", f"/crm/v3/objects/companies/{account_data['hubspot_id']}", payload)
            else:
                # Create new
                response = self._make_request("POST", "/crm/v3/objects/companies", payload)
            
            return {
                "external_id": response.get("id"),
                "sync_status": "synced",
                "last_synced_at": datetime.now(),
            }
        except Exception as e:
            return {
                "external_id": None,
                "sync_status": "failed",
                "error": str(e),
            }
    
    def sync_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync lead to HubSpot as a Contact."""
        try:
            payload = {
                "properties": {
                    "email": lead_data.get("email"),
                    "firstname": lead_data.get("first_name", ""),
                    "lastname": lead_data.get("last_name", ""),
                    "jobtitle": lead_data.get("title", ""),
                    "company": lead_data.get("company", ""),
                    "phone": lead_data.get("phone", ""),
                    "hs_lead_status": lead_data.get("status", "NEW"),
                }
            }
            
            if lead_data.get("hubspot_id"):
                response = self._make_request("PATCH", f"/crm/v3/objects/contacts/{lead_data['hubspot_id']}", payload)
            else:
                response = self._make_request("POST", "/crm/v3/objects/contacts", payload)
            
            return {
                "external_id": response.get("id"),
                "sync_status": "synced",
                "last_synced_at": datetime.now(),
            }
        except Exception as e:
            return {
                "external_id": None,
                "sync_status": "failed",
                "error": str(e),
            }
    
    def sync_opportunity(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync opportunity to HubSpot as a Deal."""
        try:
            payload = {
                "properties": {
                    "dealname": opportunity_data.get("name"),
                    "dealstage": opportunity_data.get("stage", "prospecting"),
                    "amount": str(opportunity_data.get("value", 0)),
                    "closedate": opportunity_data.get("close_date", ""),
                    "pipeline": "default",
                }
            }
            
            if opportunity_data.get("hubspot_id"):
                response = self._make_request("PATCH", f"/crm/v3/objects/deals/{opportunity_data['hubspot_id']}", payload)
            else:
                response = self._make_request("POST", "/crm/v3/objects/deals", payload)
            
            return {
                "external_id": response.get("id"),
                "sync_status": "synced",
                "last_synced_at": datetime.now(),
            }
        except Exception as e:
            return {
                "external_id": None,
                "sync_status": "failed",
                "error": str(e),
            }
    
    def get_account(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch company from HubSpot."""
        try:
            response = self._make_request("GET", f"/crm/v3/objects/companies/{external_id}")
            return response
        except Exception:
            return None
    
    def get_lead(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch contact from HubSpot."""
        try:
            response = self._make_request("GET", f"/crm/v3/objects/contacts/{external_id}")
            return response
        except Exception:
            return None
    
    def get_opportunity(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch deal from HubSpot."""
        try:
            response = self._make_request("GET", f"/crm/v3/objects/deals/{external_id}")
            return response
        except Exception:
            return None


class SalesforceAdapter(CRMAdapter):
    """Salesforce CRM adapter implementation."""
    
    def __init__(self, api_key: str, instance_url: str = None, **kwargs):
        super().__init__(api_key, **kwargs)
        self.instance_url = instance_url or "https://na1.salesforce.com"
    
    def _make_request(self, method: str, sobject: str, data: Optional[Dict] = None, record_id: Optional[str] = None) -> Dict[str, Any]:
        """Simulate API request to Salesforce."""
        # In production, use simple_salesforce or requests
        if method == "POST":
            return {"id": f"sf_{abs(hash(str(data)))}", "success": True}
        elif method == "PATCH":
            return {"id": record_id, "success": True}
        elif method == "GET":
            return {"Id": record_id, "attributes": {"type": sobject}}
        return {}
    
    def sync_account(self, account_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync account to Salesforce as an Account."""
        try:
            payload = {
                "Name": account_data.get("name"),
                "Website": account_data.get("website", ""),
                "Industry": account_data.get("industry", ""),
            }
            
            if account_data.get("salesforce_id"):
                response = self._make_request("PATCH", "Account", payload, account_data["salesforce_id"])
            else:
                response = self._make_request("POST", "Account", payload)
            
            return {
                "external_id": response.get("id"),
                "sync_status": "synced",
                "last_synced_at": datetime.now(),
            }
        except Exception as e:
            return {
                "external_id": None,
                "sync_status": "failed",
                "error": str(e),
            }
    
    def sync_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync lead to Salesforce as a Lead."""
        try:
            payload = {
                "Email": lead_data.get("email"),
                "FirstName": lead_data.get("first_name", ""),
                "LastName": lead_data.get("last_name", "Unknown"),
                "Title": lead_data.get("title", ""),
                "Company": lead_data.get("company", "Unknown"),
                "Phone": lead_data.get("phone", ""),
                "Status": lead_data.get("status", "Open - Not Contacted"),
            }
            
            if lead_data.get("salesforce_id"):
                response = self._make_request("PATCH", "Lead", payload, lead_data["salesforce_id"])
            else:
                response = self._make_request("POST", "Lead", payload)
            
            return {
                "external_id": response.get("id"),
                "sync_status": "synced",
                "last_synced_at": datetime.now(),
            }
        except Exception as e:
            return {
                "external_id": None,
                "sync_status": "failed",
                "error": str(e),
            }
    
    def sync_opportunity(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync opportunity to Salesforce as an Opportunity."""
        try:
            payload = {
                "Name": opportunity_data.get("name"),
                "StageName": opportunity_data.get("stage", "Prospecting"),
                "Amount": float(opportunity_data.get("value", 0)),
                "CloseDate": opportunity_data.get("close_date", datetime.now().date().isoformat()),
                "Probability": opportunity_data.get("probability", 0),
            }
            
            if opportunity_data.get("salesforce_id"):
                response = self._make_request("PATCH", "Opportunity", payload, opportunity_data["salesforce_id"])
            else:
                response = self._make_request("POST", "Opportunity", payload)
            
            return {
                "external_id": response.get("id"),
                "sync_status": "synced",
                "last_synced_at": datetime.now(),
            }
        except Exception as e:
            return {
                "external_id": None,
                "sync_status": "failed",
                "error": str(e),
            }
    
    def get_account(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch Account from Salesforce."""
        try:
            response = self._make_request("GET", "Account", record_id=external_id)
            return response
        except Exception:
            return None
    
    def get_lead(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch Lead from Salesforce."""
        try:
            response = self._make_request("GET", "Lead", record_id=external_id)
            return response
        except Exception:
            return None
    
    def get_opportunity(self, external_id: str) -> Optional[Dict[str, Any]]:
        """Fetch Opportunity from Salesforce."""
        try:
            response = self._make_request("GET", "Opportunity", record_id=external_id)
            return response
        except Exception:
            return None
