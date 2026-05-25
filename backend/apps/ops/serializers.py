from django.utils import timezone
from rest_framework import serializers

from .models import Account, Lead, Opportunity, Ticket, Touchpoint, QueueItem


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = "__all__"
        read_only_fields = ("id", "owner", "external_provider", "external_id", "created_at", "updated_at")


class LeadSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = Lead
        fields = "__all__"
        read_only_fields = (
            "id",
            "owner",
            "account",
            "account_name",
            "external_provider",
            "external_id",
            "converted_opportunity",
            "created_at",
            "updated_at",
        )


class OpportunitySerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)
    lead_name = serializers.CharField(source="lead.name", read_only=True)

    class Meta:
        model = Opportunity
        fields = "__all__"
        read_only_fields = (
            "id",
            "owner",
            "account_name",
            "lead_name",
            "external_provider",
            "external_id",
            "created_at",
            "updated_at",
        )


class TicketSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = Ticket
        fields = "__all__"
        read_only_fields = (
            "id",
            "owner",
            "account_name",
            "external_provider",
            "external_id",
            "created_at",
            "updated_at",
        )


class TouchpointSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)
    lead_name = serializers.CharField(source="lead.name", read_only=True)
    opportunity_title = serializers.CharField(source="opportunity.title", read_only=True)
    ticket_subject = serializers.CharField(source="ticket.subject", read_only=True)

    class Meta:
        model = Touchpoint
        fields = "__all__"
        read_only_fields = (
            "id",
            "owner",
            "account_name",
            "lead_name",
            "opportunity_title",
            "ticket_subject",
            "external_provider",
            "external_id",
            "created_at",
        )


class QueueItemSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source="lead.name", read_only=True)
    opportunity_title = serializers.CharField(source="opportunity.title", read_only=True)
    ticket_subject = serializers.CharField(source="ticket.subject", read_only=True)
    touchpoint_summary = serializers.CharField(source="touchpoint.summary", read_only=True)
    age_minutes = serializers.SerializerMethodField()

    class Meta:
        model = QueueItem
        fields = "__all__"
        read_only_fields = (
            "id",
            "owner",
            "external_provider",
            "external_id",
            "attempts",
            "last_error",
            "last_result",
            "created_at",
            "updated_at",
            "age_minutes",
            "lead_name",
            "opportunity_title",
            "ticket_subject",
            "touchpoint_summary",
        )

    def get_age_minutes(self, obj):
        if not obj.created_at:
            return 0
        delta = timezone.now() - obj.created_at
        return int(delta.total_seconds() // 60)
