from rest_framework import serializers

from .models import Campaign, CampaignMetric, ContentCalendarItem


class CampaignMetricSerializer(serializers.ModelSerializer):
    engagement_total = serializers.IntegerField(read_only=True)

    class Meta:
        model = CampaignMetric
        fields = "__all__"
        read_only_fields = ("id", "project", "created_at", "engagement_total")


class ContentCalendarItemSerializer(serializers.ModelSerializer):
    campaign_name = serializers.CharField(source="campaign.name", read_only=True)

    class Meta:
        model = ContentCalendarItem
        fields = "__all__"
        read_only_fields = (
            "id",
            "project",
            "owner",
            "campaign_name",
            "status",
            "uploadpost_request_id",
            "external_post_id",
            "publish_result",
            "error_message",
            "published_at",
            "created_at",
            "updated_at",
        )

    def validate_campaign(self, campaign):
        request = self.context.get("request")
        if request and campaign.owner_id != request.user.id and not request.user.is_staff:
            raise serializers.ValidationError("Campaign does not belong to this user.")
        return campaign


class CampaignSerializer(serializers.ModelSerializer):
    calendar_items = ContentCalendarItemSerializer(many=True, read_only=True)
    metrics_count = serializers.IntegerField(source="metrics.count", read_only=True)

    class Meta:
        model = Campaign
        fields = "__all__"
        read_only_fields = (
            "id",
            "owner",
            "status",
            "performance_summary",
            "next_action_suggestions",
            "created_at",
            "updated_at",
            "calendar_items",
            "metrics_count",
        )
