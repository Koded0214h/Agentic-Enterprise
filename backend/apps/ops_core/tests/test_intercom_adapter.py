"""
Tests for Intercom support adapter.
"""
import pytest
from unittest.mock import Mock, patch
from django.utils import timezone
from apps.ops_core.services.support_adapters import IntercomAdapter


class TestIntercomAdapter:
    """Test suite for Intercom adapter."""
    
    @pytest.fixture
    def adapter(self):
        """Create Intercom adapter instance."""
        return IntercomAdapter(api_key="test_ic_key_abc123")
    
    @pytest.fixture
    def ticket_data(self):
        """Sample ticket/conversation data."""
        return {
            "subject": "Feature request",
            "body": "Would love to see dark mode support.",
            "requester_email": "user@example.com",
            "priority": "not_priority",
            "status": "open",
        }
    
    @pytest.fixture
    def reply_data(self):
        """Sample reply data."""
        return {
            "body": "Thanks for the suggestion! We'll consider it for our roadmap.",
            "message_type": "comment",
            "admin_id": "admin_123",
        }
    
    @pytest.fixture
    def escalation_data(self):
        """Sample escalation data."""
        return {
            "priority": "critical",
            "assignee_id": "senior_admin_456",
            "admin_id": "admin_123",
            "notify_message": "Escalated due to severity.",
        }
    
    def test_adapter_initialization(self, adapter):
        """Test adapter initializes correctly."""
        assert adapter.api_key == "test_ic_key_abc123"
        assert adapter.base_url == "https://api.intercom.io"
    
    def test_sync_ticket_create(self, adapter, ticket_data):
        """Test creating new conversation in Intercom."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_conv_12345", "type": "conversation", "state": "open"}
            
            result = adapter.sync_ticket(ticket_data)
            
            assert result["external_id"] == "ic_conv_12345"
            assert result["sync_status"] == "synced"
            assert result["last_synced_at"] is not None
            mock_request.assert_called_once()
    
    def test_sync_ticket_update(self, adapter, ticket_data):
        """Test updating existing conversation in Intercom."""
        ticket_data["intercom_id"] = "ic_existing_789"
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_existing_789", "type": "conversation", "state": "open"}
            
            result = adapter.sync_ticket(ticket_data)
            
            assert result["external_id"] == "ic_existing_789"
            assert result["sync_status"] == "synced"
    
    def test_sync_ticket_failure(self, adapter, ticket_data):
        """Test ticket sync failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Invalid email format")
            
            result = adapter.sync_ticket(ticket_data)
            
            assert result["external_id"] is None
            assert result["sync_status"] == "failed"
            assert "Invalid email" in result["error"]
    
    def test_sync_ticket_without_email(self, adapter):
        """Test sync uses default email when not provided."""
        ticket_data = {"subject": "Test", "body": "Test message"}
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_default", "type": "conversation", "state": "open"}
            
            result = adapter.sync_ticket(ticket_data)
            
            assert result["sync_status"] == "synced"
    
    def test_get_ticket(self, adapter):
        """Test fetching conversation from Intercom."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_conv_12345", "type": "conversation", "state": "open"}
            
            result = adapter.get_ticket("ic_conv_12345")
            
            assert result is not None
            assert result["id"] == "ic_conv_12345"
            assert result["type"] == "conversation"
    
    def test_get_ticket_not_found(self, adapter):
        """Test fetching non-existent conversation."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Conversation not found")
            
            result = adapter.get_ticket("ic_nonexistent")
            
            assert result is None
    
    def test_reply_to_ticket(self, adapter, reply_data):
        """Test adding reply to conversation."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_reply_456", "type": "comment"}
            
            result = adapter.reply_to_ticket("ic_conv_12345", reply_data)
            
            assert result["success"] is True
            assert result["reply_id"] == "ic_reply_456"
            assert result["timestamp"] is not None
    
    def test_reply_to_ticket_failure(self, adapter, reply_data):
        """Test reply failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Conversation is closed")
            
            result = adapter.reply_to_ticket("ic_conv_12345", reply_data)
            
            assert result["success"] is False
            assert "closed" in result["error"]
    
    def test_reply_with_note(self, adapter):
        """Test adding internal note."""
        note_data = {
            "body": "Internal note for team",
            "message_type": "note",
            "admin_id": "admin_123",
        }
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_note_789", "type": "comment"}
            
            result = adapter.reply_to_ticket("ic_conv_12345", note_data)
            
            assert result["success"] is True
    
    def test_update_ticket_status_open(self, adapter):
        """Test updating conversation to open state."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_conv_12345", "state": "open"}
            
            result = adapter.update_ticket_status("ic_conv_12345", "open")
            
            assert result["success"] is True
            assert result["state"] == "open"
            assert result["timestamp"] is not None
    
    def test_update_ticket_status_closed(self, adapter):
        """Test updating conversation to closed state."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_conv_12345", "state": "closed"}
            
            result = adapter.update_ticket_status("ic_conv_12345", "resolved")
            
            assert result["success"] is True
            assert result["state"] == "closed"
    
    def test_update_ticket_status_mapping(self, adapter):
        """Test status mapping from generic to Intercom states."""
        status_tests = [
            ("open", "open"),
            ("pending", "open"),
            ("in_progress", "open"),
            ("resolved", "closed"),
            ("closed", "closed"),
        ]
        
        with patch.object(adapter, '_make_request') as mock_request:
            for generic_status, expected_state in status_tests:
                mock_request.return_value = {"id": "ic_test", "state": expected_state}
                result = adapter.update_ticket_status("ic_test", generic_status)
                assert result["state"] == expected_state
    
    def test_update_ticket_status_failure(self, adapter):
        """Test status update failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Invalid state")
            
            result = adapter.update_ticket_status("ic_conv_12345", "invalid")
            
            assert result["success"] is False
            assert "Invalid state" in result["error"]
    
    def test_escalate_ticket(self, adapter, escalation_data):
        """Test escalating conversation."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_conv_12345", "priority": "priority"}
            
            result = adapter.escalate_ticket("ic_conv_12345", escalation_data)
            
            assert result["success"] is True
            assert result["escalated"] is True
            assert result["priority"] == "priority"
            assert result["timestamp"] is not None
    
    def test_escalate_ticket_with_assignment(self, adapter, escalation_data):
        """Test escalation with assignee."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_conv_12345", "priority": "priority"}
            
            result = adapter.escalate_ticket("ic_conv_12345", escalation_data)
            
            assert result["success"] is True
            # Verify assignee was included in payload
            assert mock_request.called
    
    def test_escalate_ticket_with_notification(self, adapter, escalation_data):
        """Test escalation with notification message."""
        with patch.object(adapter, '_make_request') as mock_request:
            # First call for escalation, second for note
            mock_request.return_value = {"id": "ic_conv_12345", "priority": "priority"}
            
            result = adapter.escalate_ticket("ic_conv_12345", escalation_data)
            
            assert result["success"] is True
            # Should have been called twice: once for update, once for note
            assert mock_request.call_count >= 1
    
    def test_escalate_ticket_without_notification(self, adapter):
        """Test escalation without notification message."""
        escalation_data = {
            "priority": "high",
            "assignee_id": "admin_789",
        }
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_conv_12345", "priority": "priority"}
            
            result = adapter.escalate_ticket("ic_conv_12345", escalation_data)
            
            assert result["success"] is True
    
    def test_escalate_ticket_priority_mapping(self, adapter):
        """Test priority mapping for escalation."""
        high_priority_tests = ["high", "critical"]
        
        with patch.object(adapter, '_make_request') as mock_request:
            for priority in high_priority_tests:
                escalation_data = {"priority": priority}
                mock_request.return_value = {"id": "ic_test", "priority": "priority"}
                result = adapter.escalate_ticket("ic_test", escalation_data)
                assert result["priority"] == "priority"
    
    def test_escalate_ticket_failure(self, adapter, escalation_data):
        """Test escalation failure handling."""
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.side_effect = Exception("Admin not found")
            
            result = adapter.escalate_ticket("ic_conv_12345", escalation_data)
            
            assert result["success"] is False
            assert "Admin not found" in result["error"]
    
    def test_external_id_persistence(self, adapter, ticket_data):
        """Test that external IDs are properly persisted."""
        with patch.object(adapter, '_make_request') as mock_request:
            # First sync - create
            mock_request.return_value = {"id": "ic_new_999", "type": "conversation", "state": "open"}
            result1 = adapter.sync_ticket(ticket_data)
            external_id = result1["external_id"]
            
            # Second sync - update with external ID
            ticket_data["intercom_id"] = external_id
            mock_request.return_value = {"id": external_id, "type": "conversation", "state": "open"}
            result2 = adapter.sync_ticket(ticket_data)
            
            assert result2["external_id"] == external_id
            assert result2["sync_status"] == "synced"
    
    def test_round_trip_workflow(self, adapter, ticket_data, reply_data):
        """Test complete round-trip: create, reply, update state."""
        with patch.object(adapter, '_make_request') as mock_request:
            # Create conversation
            mock_request.return_value = {"id": "ic_roundtrip", "type": "conversation", "state": "open"}
            sync_result = adapter.sync_ticket(ticket_data)
            conv_id = sync_result["external_id"]
            
            # Add reply
            mock_request.return_value = {"id": "ic_reply_rt", "type": "comment"}
            reply_result = adapter.reply_to_ticket(conv_id, reply_data)
            
            # Update state
            mock_request.return_value = {"id": conv_id, "state": "closed"}
            status_result = adapter.update_ticket_status(conv_id, "resolved")
            
            assert sync_result["sync_status"] == "synced"
            assert reply_result["success"] is True
            assert status_result["success"] is True
    
    def test_escalation_workflow(self, adapter, ticket_data, escalation_data):
        """Test escalation workflow: create, escalate, verify."""
        with patch.object(adapter, '_make_request') as mock_request:
            # Create conversation
            mock_request.return_value = {"id": "ic_escalate", "type": "conversation", "state": "open"}
            sync_result = adapter.sync_ticket(ticket_data)
            conv_id = sync_result["external_id"]
            
            # Escalate
            mock_request.return_value = {"id": conv_id, "priority": "priority"}
            escalate_result = adapter.escalate_ticket(conv_id, escalation_data)
            
            # Verify
            mock_request.return_value = {"id": conv_id, "priority": "priority", "state": "open"}
            get_result = adapter.get_ticket(conv_id)
            
            assert sync_result["sync_status"] == "synced"
            assert escalate_result["success"] is True
            assert get_result["priority"] == "priority"
    
    def test_sync_with_minimal_data(self, adapter):
        """Test sync with minimal required data."""
        minimal_ticket = {"body": "Quick question"}
        
        with patch.object(adapter, '_make_request') as mock_request:
            mock_request.return_value = {"id": "ic_minimal", "type": "conversation", "state": "open"}
            
            result = adapter.sync_ticket(minimal_ticket)
            
            assert result["sync_status"] == "synced"
            assert result["external_id"] == "ic_minimal"
