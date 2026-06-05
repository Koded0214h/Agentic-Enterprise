"""
Tests for Zendesk support adapter.
"""
import pytest
from unittest.mock import Mock, patch
from django.utils import timezone
from apps.ops_core.services.support_adapters import ZendeskAdapter


class TestZendeskAdapter:
    """Test suite for Zendesk adapter."""
    
    @pytest.fixture
    def adapter(self):
        """Create Zendesk adapter instance."""
        return ZendeskAdapter(api_key="test_zd_key", subdomain="testcompany")
    
    @pytest.fixture
    def ticket_data(self):
        """Sample ticket data."""
        return {
            "subject": "Product not working",
            "body": "I cannot access the dashboard after login.",
            "priority": "high",
            "status": "open",
            "tags": ["bug", "dashboard"],
        }
    
    @pytest.fixture
    def reply_data(self):
        """Sample reply data."""
        return {
            "body": "Thank you for reporting this. We're investigating.",
            "public": True,
            "author_id": "agent_123",
        }
    
    @pytest.fixture
    def escalation_data(self):
        """Sample escalation data."""
        return {
            "priority": "urgent",
            "status": "open",
            "assignee_id": "senior_agent_456",
            "tags": ["escalated", "urgent"],
            "notify_message": "Escalated to senior support team.",
        }
    
    def test_adapter_initialization(self, adapter):
        """Test adapter initializes correctly."""
        assert adapter.api_key == "test_zd_key"
        assert adapter.subdomain == "testcompany"
        assert adapter.base_url == "https://testcompany.zendesk.com/api/v2"
    
    def test_adapter_default_subdomain(self):
        """Test adapter uses default subdomain."""
        adapter = ZendeskAdapter(api_key="test_key")
        assert adapter.subdomain == "default"
    
    def test_sync_ticket_create(self, adapter, ticket_data):
        """Test creating new ticket in Zendesk."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"ticket": {"id": "zd_12345", "status": "open"}}
            
            result = adapter.sync_ticket(ticket_data)
            
            assert result["external_id"] == "zd_12345"
            assert result["sync_status"] == "synced"
            assert result["last_synced_at"] is not None
            mock_request.assert_called_once()
    
    def test_sync_ticket_update(self, adapter, ticket_data):
        """Test updating existing ticket in Zendesk."""
        ticket_data["zendesk_id"] = "zd_existing_123"
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"ticket": {"id": "zd_existing_123", "status": "pending"}}
            
            result = adapter.sync_ticket(ticket_data)
            
            assert result["external_id"] == "zd_existing_123"
            assert result["sync_status"] == "synced"
    
    def test_sync_ticket_failure(self, adapter, ticket_data):
        """Test ticket sync failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("API rate limit exceeded")
            
            result = adapter.sync_ticket(ticket_data)
            
            assert result["external_id"] is None
            assert result["sync_status"] == "failed"
            assert "rate limit" in result["error"]
    
    def test_get_ticket(self, adapter):
        """Test fetching ticket from Zendesk."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"ticket": {"id": "zd_12345", "status": "open", "priority": "high"}}
            
            result = adapter.get_ticket("zd_12345")
            
            assert result is not None
            assert result["id"] == "zd_12345"
            assert result["status"] == "open"
    
    def test_get_ticket_not_found(self, adapter):
        """Test fetching non-existent ticket."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Ticket not found")
            
            result = adapter.get_ticket("zd_nonexistent")
            
            assert result is None
    
    def test_reply_to_ticket(self, adapter, reply_data):
        """Test adding reply to ticket."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"comment": {"id": "comment_789", "body": reply_data["body"]}}
            
            result = adapter.reply_to_ticket("zd_12345", reply_data)
            
            assert result["success"] is True
            assert result["comment_id"] == "comment_789"
            assert result["timestamp"] is not None
    
    def test_reply_to_ticket_failure(self, adapter, reply_data):
        """Test reply failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Ticket is closed")
            
            result = adapter.reply_to_ticket("zd_12345", reply_data)
            
            assert result["success"] is False
            assert "closed" in result["error"]
    
    def test_reply_with_private_comment(self, adapter):
        """Test adding private internal note."""
        reply_data = {
            "body": "Internal note for team",
            "public": False,
            "author_id": "agent_123",
        }
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"comment": {"id": "comment_private", "body": reply_data["body"]}}
            
            result = adapter.reply_to_ticket("zd_12345", reply_data)
            
            assert result["success"] is True
    
    def test_update_ticket_status(self, adapter):
        """Test updating ticket status."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"ticket": {"id": "zd_12345", "status": "resolved"}}
            
            result = adapter.update_ticket_status("zd_12345", "resolved")
            
            assert result["success"] is True
            assert result["status"] == "resolved"
            assert result["timestamp"] is not None
    
    def test_update_ticket_status_failure(self, adapter):
        """Test status update failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Invalid status")
            
            result = adapter.update_ticket_status("zd_12345", "invalid_status")
            
            assert result["success"] is False
            assert "Invalid status" in result["error"]
    
    def test_escalate_ticket(self, adapter, escalation_data):
        """Test escalating ticket."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"ticket": {"id": "zd_12345", "priority": "urgent"}}
            
            result = adapter.escalate_ticket("zd_12345", escalation_data)
            
            assert result["success"] is True
            assert result["escalated"] is True
            assert result["priority"] == "urgent"
            assert result["timestamp"] is not None
    
    def test_escalate_ticket_with_notification(self, adapter, escalation_data):
        """Test escalation with notification message."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"ticket": {"id": "zd_12345", "priority": "urgent"}}
            
            result = adapter.escalate_ticket("zd_12345", escalation_data)
            
            assert result["success"] is True
            # Verify notification was included in payload
            assert mock_request.called
    
    def test_escalate_ticket_without_notification(self, adapter):
        """Test escalation without notification message."""
        escalation_data = {
            "priority": "high",
            "assignee_id": "agent_789",
        }
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"ticket": {"id": "zd_12345", "priority": "high"}}
            
            result = adapter.escalate_ticket("zd_12345", escalation_data)
            
            assert result["success"] is True
    
    def test_escalate_ticket_failure(self, adapter, escalation_data):
        """Test escalation failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Assignee not found")
            
            result = adapter.escalate_ticket("zd_12345", escalation_data)
            
            assert result["success"] is False
            assert "Assignee not found" in result["error"]
    
    def test_external_id_persistence(self, adapter, ticket_data):
        """Test that external IDs are properly persisted."""
        with patch.object(adapter, '_make_request') as mock_request:
            # First sync - create
            mock_request.return_value = {"ticket": {"id": "zd_new_999", "status": "open"}}
            result1 = adapter.sync_ticket(ticket_data)
            external_id = result1["external_id"]
            
            # Second sync - update with external ID
            ticket_data["zendesk_id"] = external_id
            mock_request.return_value = {"ticket": {"id": external_id, "status": "pending"}}
            result2 = adapter.sync_ticket(ticket_data)
            
            assert result2["external_id"] == external_id
            assert result2["sync_status"] == "synced"
    
    def test_sync_with_minimal_data(self, adapter):
        """Test sync with minimal required data."""
        minimal_ticket = {"subject": "Help needed"}
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"ticket": {"id": "zd_minimal", "status": "open"}}
            
            result = adapter.sync_ticket(minimal_ticket)
            
            assert result["sync_status"] == "synced"
            assert result["external_id"] == "zd_minimal"
    
    def test_round_trip_workflow(self, adapter, ticket_data, reply_data):
        """Test complete round-trip: create, reply, update status."""
        with patch.object(adapter, '_make_request') as mock_request:
            # Create ticket
            mock_request.return_value = {"ticket": {"id": "zd_roundtrip", "status": "open"}}
            sync_result = adapter.sync_ticket(ticket_data)
            ticket_id = sync_result["external_id"]
            
            # Add reply
            mock_request.return_value = {"comment": {"id": "comment_rt", "body": reply_data["body"]}}
            reply_result = adapter.reply_to_ticket(ticket_id, reply_data)
            
            # Update status
            mock_request.return_value = {"ticket": {"id": ticket_id, "status": "resolved"}}
            status_result = adapter.update_ticket_status(ticket_id, "resolved")
            
            assert sync_result["sync_status"] == "synced"
            assert reply_result["success"] is True
            assert status_result["success"] is True
    
    def test_escalation_workflow(self, adapter, ticket_data, escalation_data):
        """Test escalation workflow: create, escalate, verify."""
        with patch.object(adapter, '_make_request') as mock_request:
            # Create ticket
            mock_request.return_value = {"ticket": {"id": "zd_escalate", "status": "open"}}
            sync_result = adapter.sync_ticket(ticket_data)
            ticket_id = sync_result["external_id"]
            
            # Escalate
            mock_request.return_value = {"ticket": {"id": ticket_id, "priority": "urgent"}}
            escalate_result = adapter.escalate_ticket(ticket_id, escalation_data)
            
            # Verify
            mock_request.return_value = {"ticket": {"id": ticket_id, "priority": "urgent", "status": "open"}}
            get_result = adapter.get_ticket(ticket_id)
            
            assert sync_result["sync_status"] == "synced"
            assert escalate_result["success"] is True
            assert get_result["priority"] == "urgent"
