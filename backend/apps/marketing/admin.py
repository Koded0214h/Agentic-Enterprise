from django.contrib import admin

from .models import Campaign, CampaignMetric, ContentCalendarItem


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("name", "project", "owner", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "objective", "audience")


@admin.register(ContentCalendarItem)
class ContentCalendarItemAdmin(admin.ModelAdmin):
    list_display = ("title", "campaign", "platform", "status", "scheduled_at")
    list_filter = ("platform", "status", "scheduled_at")
    search_fields = ("title", "caption")


@admin.register(CampaignMetric)
class CampaignMetricAdmin(admin.ModelAdmin):
    list_display = ("campaign", "calendar_item", "source", "impressions", "clicks", "conversions", "captured_at")
    list_filter = ("source", "captured_at")
