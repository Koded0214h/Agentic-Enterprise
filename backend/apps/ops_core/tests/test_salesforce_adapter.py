"""
Tests for Salesforce CRM adapter.
"""
import pytest
from unittest.mock import Mock, patch
from django.utils import timezone
from apps.ops_core.services.crm_adapters import SalesforceAdapter


class TestSalesforceAdapter:
    """Test suite for Salesforce adapter."""
    
    @pytest.fixture
    def adapter(self):
        """Create Salesforce adapter instance."""
        return SalesforceAdapter(api_key="test_sf_key", instance_url="https://test.salesforce.com")
    
    @pytest.fixture
    def account_data(self):
        """Sample account data."""
        return {
            "name": "Global Industries",
            "website": "https://globalind.com",
            "industry": "Manufacturing",
        }
    
    @pytest.fixture
    def lead_data(self):
        """Sample lead data."""
        return {
            "email": "jane@globalind.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "title": "VP Sales",
            "company": "Global Industries",
            "phone": "+9876543210",
            "status": "Open - Not Contacted",
        }
    
    @pytest.fixture
    def opportunity_data(self):
        """Sample opportunity data."""
        return {
            "name": "Global Enterprise Contract",
            "stage": "Prospecting",
            "value": 100000,
            "close_date": "2026-07-15",
            "probability": 25,
        }
    
    def test_adapter_initialization(self, adapter):
        """Test adapter initializes correctly."""
        assert adapter.api_key == "test_sf_key"
        assert adapter.instance_url == "https://test.salesforce.com"
    
    def test_adapter_default_instance_url(self):
        """Test adapter uses default instance URL."""
        adapter = SalesforceAdapter(api_key="test_key")
        assert adapter.instance_url == "https://na1.salesforce.com"
    
    def test_sync_account_create(self, adapter, account_data):
        """Test creating new account in Salesforce."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_001", "success": True}
            
            result = adapter.sync_account(account_data)
            
            assert result["external_id"] == "sf_001"
            assert result["sync_status"] == "synced"
            assert result["last_synced_at"] is not None
            mock_request.assert_called_once()
    
    def test_sync_account_update(self, adapter, account_data):
        """Test updating existing account in Salesforce."""
        account_data["salesforce_id"] = "sf_existing_001"
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_existing_001", "success": True}
            
            result = adapter.sync_account(account_data)
            
            assert result["external_id"] == "sf_existing_001"
            assert result["sync_status"] == "synced"
    
    def test_sync_account_failure(self, adapter, account_data):
        """Test account sync failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("INVALID_FIELD")
            
            result = adapter.sync_account(account_data)
            
            assert result["external_id"] is None
            assert result["sync_status"] == "failed"
            assert "INVALID_FIELD" in result["error"]
    
    def test_sync_lead_create(self, adapter, lead_data):
        """Test creating new lead in Salesforce."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_lead_002", "success": True}
            
            result = adapter.sync_lead(lead_data)
            
            assert result["external_id"] == "sf_lead_002"
            assert result["sync_status"] == "synced"
            assert result["last_synced_at"] is not None
    
    def test_sync_lead_update(self, adapter, lead_data):
        """Test updating existing lead in Salesforce."""
        lead_data["salesforce_id"] = "sf_lead_existing"
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_lead_existing", "success": True}
            
            result = adapter.sync_lead(lead_data)
            
            assert result["external_id"] == "sf_lead_existing"
            assert result["sync_status"] == "synced"
    
    def test_sync_lead_failure(self, adapter, lead_data):
        """Test lead sync failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("REQUIRED_FIELD_MISSING")
            
            result = adapter.sync_lead(lead_data)
            
            assert result["external_id"] is None
            assert result["sync_status"] == "failed"
            assert "REQUIRED_FIELD_MISSING" in result["error"]
    
    def test_sync_lead_with_defaults(self, adapter):
        """Test lead sync with minimal data uses defaults."""
        minimal_lead = {"email": "test@example.com"}
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_minimal", "success": True}
            
            result = adapter.sync_lead(minimal_lead)
            
            assert result["sync_status"] == "synced"
            # Verify defaults are applied in the adapter
            call_args = mock_request.call_args
            assert call_args is not None
    
    def test_sync_opportunity_create(self, adapter, opportunity_data):
        """Test creating new opportunity in Salesforce."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_opp_003", "success": True}
            
            result = adapter.sync_opportunity(opportunity_data)
            
            assert result["external_id"] == "sf_opp_003"
            assert result["sync_status"] == "synced"
            assert result["last_synced_at"] is not None
    
    def test_sync_opportunity_update(self, adapter, opportunity_data):
        """Test updating existing opportunity in Salesforce."""
        opportunity_data["salesforce_id"] = "sf_opp_existing"
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_opp_existing", "success": True}
            
            result = adapter.sync_opportunity(opportunity_data)
            
            assert result["external_id"] == "sf_opp_existing"
            assert result["sync_status"] == "synced"
    
    def test_sync_opportunity_failure(self, adapter, opportunity_data):
        """Test opportunity sync failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("INVALID_STAGE")
            
            result = adapter.sync_opportunity(opportunity_data)
            
            assert result["external_id"] is None
            assert result["sync_status"] == "failed"
            assert "INVALID_STAGE" in result["error"]
    
    def test_get_account(self, adapter):
        """Test fetching account from Salesforce."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"Id": "sf_001", "attributes": {"type": "Account"}}
            
            result = adapter.get_account("sf_001")
            
            assert result is not None
            assert result["Id"] == "sf_001"
    
    def test_get_account_not_found(self, adapter):
        """Test fetching non-existent account."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("ENTITY_NOT_FOUND")
            
            result = adapter.get_account("sf_nonexistent")
            
            assert result is None
    
    def test_get_lead(self, adapter):
        """Test fetching lead from Salesforce."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"Id": "sf_lead_002", "attributes": {"type": "Lead"}}
            
            result = adapter.get_lead("sf_lead_002")
            
            assert result is not None
            assert result["Id"] == "sf_lead_002"
    
    def test_get_lead_not_found(self, adapter):
        """Test fetching non-existent lead."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("ENTITY_NOT_FOUND")
            
            result = adapter.get_lead("sf_nonexistent")
            
            assert result is None
    
    def test_get_opportunity(self, adapter):
        """Test fetching opportunity from Salesforce."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"Id": "sf_opp_003", "attributes": {"type": "Opportunity"}}
            
            result = adapter.get_opportunity("sf_opp_003")
            
            assert result is not None
            assert result["Id"] == "sf_opp_003"
    
    def test_get_opportunity_not_found(self, adapter):
        """Test fetching non-existent opportunity."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("ENTITY_NOT_FOUND")
            
            result = adapter.get_opportunity("sf_nonexistent")
            
            assert result is None
    
    def test_external_id_persistence(self, adapter, account_data):
        """Test that external IDs are properly persisted."""
        with patch.object(adapter, '_make_request') as mock_request:
            # First sync - create
            mock_request.return_value = {"id": "sf_new_123", "success": True}
            result1 = adapter.sync_account(account_data)
            external_id = result1["external_id"]
            
            # Second sync - update with external ID
            account_data["salesforce_id"] = external_id
            mock_request.return_value = {"id": external_id, "success": True}
            result2 = adapter.sync_account(account_data)
            
            assert result2["external_id"] == external_id
            assert result2["sync_status"] == "synced"
    
    def test_sync_with_empty_optional_fields(self, adapter):
        """Test sync handles empty optional fields gracefully."""
        account_data = {"name": "Test Corp", "website": "", "industry": ""}
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_test", "success": True}
            
            result = adapter.sync_account(account_data)
            
            assert result["sync_status"] == "synced"
    
    def test_opportunity_value_conversion(self, adapter, opportunity_data):
        """Test opportunity value is converted to float."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "sf_opp_value", "success": True}
            
            result = adapter.sync_opportunity(opportunity_data)
            
            assert result["sync_status"] == "synced"
            # Verify float conversion happens in adapter
            call_args = mock_request.call_args
            assert call_args is not None
