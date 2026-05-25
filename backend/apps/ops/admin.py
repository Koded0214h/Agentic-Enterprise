from django.contrib import admin

from .models import Account, Lead, Opportunity, Ticket, Touchpoint, QueueItem


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("name", "domain", "lifecycle", "owner", "created_at")
    search_fields = ("name", "domain")
    list_filter = ("lifecycle", "created_at")


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "company", "status", "owner", "created_at")
    search_fields = ("name", "email", "company")
    list_filter = ("status", "source", "created_at")


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ("title", "stage", "amount", "currency", "owner", "created_at")
    search_fields = ("title",)
    list_filter = ("stage", "created_at")


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("subject", "status", "priority", "owner", "created_at")
    search_fields = ("subject", "requester_name", "requester_email")
    list_filter = ("status", "priority", "channel", "created_at")


@admin.register(Touchpoint)
class TouchpointAdmin(admin.ModelAdmin):
    list_display = ("summary", "kind", "direction", "owner", "created_at")
    search_fields = ("summary",)
    list_filter = ("kind", "direction", "created_at")


@admin.register(QueueItem)
class QueueItemAdmin(admin.ModelAdmin):
    list_display = ("kind", "status", "attempts", "owner", "created_at")
    search_fields = ("kind", "status")
    list_filter = ("kind", "status", "created_at")
