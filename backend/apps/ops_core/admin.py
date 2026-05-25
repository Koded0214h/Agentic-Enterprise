from django.contrib import admin
from .models import Account, Lead, Opportunity, Ticket, Touchpoint, QueueItem


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ["name", "project", "domain", "industry", "size", "created_at"]
    list_filter = ["size", "industry"]
    search_fields = ["name", "domain", "hubspot_id", "salesforce_id"]
    raw_id_fields = ["project"]


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["email", "project", "status", "sync_status", "score", "created_at"]
    list_filter = ["status", "sync_status"]
    search_fields = ["email", "first_name", "last_name", "company"]
    raw_id_fields = ["project", "account"]


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ["name", "project", "stage", "value", "currency", "sync_status", "created_at"]
    list_filter = ["stage", "sync_status", "currency"]
    search_fields = ["name", "hubspot_id", "salesforce_id"]
    raw_id_fields = ["project", "account", "lead"]


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ["subject", "project", "status", "priority", "channel", "sync_status", "created_at"]
    list_filter = ["status", "priority", "channel", "sync_status"]
    search_fields = ["subject", "zendesk_id", "intercom_id"]
    raw_id_fields = ["project", "account", "lead", "assignee"]


@admin.register(Touchpoint)
class TouchpointAdmin(admin.ModelAdmin):
    list_display = ["type", "direction", "project", "occurred_at", "created_at"]
    list_filter = ["type", "direction"]
    search_fields = ["summary"]
    raw_id_fields = ["project", "account", "lead", "ticket", "recorded_by"]


@admin.register(QueueItem)
class QueueItemAdmin(admin.ModelAdmin):
    list_display = [
        "item_type", "project", "status", "priority",
        "retry_count", "max_retries", "created_at",
    ]
    list_filter = ["status", "item_type"]
    search_fields = ["id"]
    raw_id_fields = ["project"]
    readonly_fields = [
        "status", "result", "error_message", "retry_count",
        "started_at", "completed_at", "next_retry_at",
    ]
