from rest_framework import serializers
from .models import (
    Account,
    Lead,
    Opportunity,
    Ticket,
    Touchpoint,
    QueueItem,
)


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            "id",
            "project",
            "name",
            "domain",
            "industry",
            "size",
            "website",
            "hubspot_id",
            "salesforce_id",
            "external_id",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            "id",
            "project",
            "account",
            "email",
            "first_name",
            "last_name",
            "title",
            "company",
            "phone",
            "source",
            "status",
            "score",
            "hubspot_id",
            "salesforce_id",
            "external_id",
            "sync_status",
            "last_synced_at",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "sync_status", "last_synced_at", "created_at", "updated_at"]


class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            "id",
            "project",
            "account",
            "lead",
            "name",
            "stage",
            "value",
            "currency",
            "close_date",
            "probability",
            "hubspot_id",
            "salesforce_id",
            "external_id",
            "sync_status",
            "last_synced_at",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "sync_status", "last_synced_at", "created_at", "updated_at"]


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "id",
            "project",
            "account",
            "lead",
            "subject",
            "body",
            "status",
            "priority",
            "channel",
            "assignee",
            "zendesk_id",
            "intercom_id",
            "external_id",
            "sync_status",
            "last_synced_at",
            "resolved_at",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id", "sync_status", "last_synced_at", "resolved_at", "created_at", "updated_at"
        ]


class TouchpointSerializer(serializers.ModelSerializer):
    recorded_by = serializers.ReadOnlyField(source="recorded_by.id")

    class Meta:
        model = Touchpoint
        fields = [
            "id",
            "project",
            "account",
            "lead",
            "ticket",
            "type",
            "direction",
            "summary",
            "occurred_at",
            "recorded_by",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "recorded_by", "created_at"]


class QueueItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueItem
        fields = [
            "id",
            "project",
            "item_type",
            "status",
            "priority",
            "payload",
            "result",
            "error_message",
            "retry_count",
            "max_retries",
            "can_retry",
            "scheduled_at",
            "started_at",
            "completed_at",
            "next_retry_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "result",
            "error_message",
            "retry_count",
            "can_retry",
            "started_at",
            "completed_at",
            "next_retry_at",
            "created_at",
            "updated_at",
        ]
