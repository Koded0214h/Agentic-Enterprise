"""
Tests for HubSpot CRM adapter.
"""
import pytest
from unittest.mock import Mock, patch
from django.utils import timezone
from apps.ops_core.services.crm_adapters import HubSpotAdapter


class TestHubSpotAdapter:
    """Test suite for HubSpot adapter."""
    
    @pytest.fixture
    def adapter(self):
        """Create HubSpot adapter instance."""
        return HubSpotAdapter(api_key="test_key_123")
    
    @pytest.fixture
    def account_data(self):
        """Sample account data."""
        return {
            "name": "Acme Corp",
            "domain": "acme.com",
            "industry": "Technology",
            "website": "https://acme.com",
        }
    
    @pytest.fixture
    def lead_data(self):
        """Sample lead data."""
        return {
            "email": "john@acme.com",
            "first_name": "John",
            "last_name": "Doe",
            "title": "CTO",
            "company": "Acme Corp",
            "phone": "+1234567890",
            "status": "new",
        }
    
    @pytest.fixture
    def opportunity_data(self):
        """Sample opportunity data."""
        return {
            "name": "Acme Enterprise Deal",
            "stage": "qualification",
            "value": 50000,
            "close_date": "2026-06-30",
        }
    
    def test_adapter_initialization(self, adapter):
        """Test adapter initializes correctly."""
        assert adapter.api_key == "test_key_123"
        assert adapter.base_url == "https://api.hubapi.com"
    
    def test_sync_account_create(self, adapter, account_data):
        """Test creating new account in HubSpot."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_12345", "status": "success"}
            
            result = adapter.sync_account(account_data)
            
            assert result["external_id"] == "hs_12345"
            assert result["sync_status"] == "synced"
            assert result["last_synced_at"] is not None
            mock_request.assert_called_once()
    
    def test_sync_account_update(self, adapter, account_data):
        """Test updating existing account in HubSpot."""
        account_data["hubspot_id"] = "hs_existing_123"
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_existing_123", "status": "success"}
            
            result = adapter.sync_account(account_data)
            
            assert result["external_id"] == "hs_existing_123"
            assert result["sync_status"] == "synced"
    
    def test_sync_account_failure(self, adapter, account_data):
        """Test account sync failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("API Error")
            
            result = adapter.sync_account(account_data)
            
            assert result["external_id"] is None
            assert result["sync_status"] == "failed"
            assert "API Error" in result["error"]
    
    def test_sync_lead_create(self, adapter, lead_data):
        """Test creating new lead in HubSpot."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_contact_456", "status": "success"}
            
            result = adapter.sync_lead(lead_data)
            
            assert result["external_id"] == "hs_contact_456"
            assert result["sync_status"] == "synced"
            assert result["last_synced_at"] is not None
    
    def test_sync_lead_update(self, adapter, lead_data):
        """Test updating existing lead in HubSpot."""
        lead_data["hubspot_id"] = "hs_contact_existing"
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_contact_existing", "status": "success"}
            
            result = adapter.sync_lead(lead_data)
            
            assert result["external_id"] == "hs_contact_existing"
            assert result["sync_status"] == "synced"
    
    def test_sync_lead_failure(self, adapter, lead_data):
        """Test lead sync failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Network timeout")
            
            result = adapter.sync_lead(lead_data)
            
            assert result["external_id"] is None
            assert result["sync_status"] == "failed"
            assert "Network timeout" in result["error"]
    
    def test_sync_opportunity_create(self, adapter, opportunity_data):
        """Test creating new opportunity in HubSpot."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_deal_789", "status": "success"}
            
            result = adapter.sync_opportunity(opportunity_data)
            
            assert result["external_id"] == "hs_deal_789"
            assert result["sync_status"] == "synced"
            assert result["last_synced_at"] is not None
    
    def test_sync_opportunity_update(self, adapter, opportunity_data):
        """Test updating existing opportunity in HubSpot."""
        opportunity_data["hubspot_id"] = "hs_deal_existing"
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_deal_existing", "status": "success"}
            
            result = adapter.sync_opportunity(opportunity_data)
            
            assert result["external_id"] == "hs_deal_existing"
            assert result["sync_status"] == "synced"
    
    def test_sync_opportunity_failure(self, adapter, opportunity_data):
        """Test opportunity sync failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Invalid stage")
            
            result = adapter.sync_opportunity(opportunity_data)
            
            assert result["external_id"] is None
            assert result["sync_status"] == "failed"
            assert "Invalid stage" in result["error"]
    
    def test_get_account(self, adapter):
        """Test fetching account from HubSpot."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_12345", "properties": {"name": "Acme"}}
            
            result = adapter.get_account("hs_12345")
            
            assert result is not None
            assert result["id"] == "hs_12345"
    
    def test_get_account_not_found(self, adapter):
        """Test fetching non-existent account."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Not found")
            
            result = adapter.get_account("hs_nonexistent")
            
            assert result is None
    
    def test_get_lead(self, adapter):
        """Test fetching lead from HubSpot."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_contact_456", "properties": {"email": "john@acme.com"}}
            
            result = adapter.get_lead("hs_contact_456")
            
            assert result is not None
            assert result["id"] == "hs_contact_456"
    
    def test_get_lead_not_found(self, adapter):
        """Test fetching non-existent lead."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Not found")
            
            result = adapter.get_lead("hs_nonexistent")
            
            assert result is None
    
    def test_get_opportunity(self, adapter):
        """Test fetching opportunity from HubSpot."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_deal_789", "properties": {"dealname": "Big Deal"}}
            
            result = adapter.get_opportunity("hs_deal_789")
            
            assert result is not None
            assert result["id"] == "hs_deal_789"
    
    def test_get_opportunity_not_found(self, adapter):
        """Test fetching non-existent opportunity."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Not found")
            
            result = adapter.get_opportunity("hs_nonexistent")
            
            assert result is None
    
    def test_external_id_persistence(self, adapter, account_data):
        """Test that external IDs are properly persisted."""
        with patch.object(adapter, '_make_request') as mock_request:
            # First sync - create
            mock_request.return_value = {"id": "hs_new_123", "status": "success"}
            result1 = adapter.sync_account(account_data)
            external_id = result1["external_id"]
            
            # Second sync - update with external ID
            account_data["hubspot_id"] = external_id
            mock_request.return_value = {"id": external_id, "status": "success"}
            result2 = adapter.sync_account(account_data)
            
            assert result2["external_id"] == external_id
            assert result2["sync_status"] == "synced"
    
    def test_sync_with_minimal_data(self, adapter):
        """Test sync with minimal required data."""
        minimal_lead = {"email": "minimal@test.com"}
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "hs_minimal", "status": "success"}
            
            result = adapter.sync_lead(minimal_lead)
            
            assert result["sync_status"] == "synced"
            assert result["external_id"] == "hs_minimal"
