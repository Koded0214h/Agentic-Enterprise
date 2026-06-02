from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ops_core.serializers import QueueItemSerializer
from apps.projects.models import Project

from .models import Campaign, CampaignMetric, ContentCalendarItem
from .serializers import CampaignMetricSerializer, CampaignSerializer, ContentCalendarItemSerializer
from .services import MarketingService


class OwnerQuerysetMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(owner=self.request.user) if hasattr(qs.model, "owner") else qs.filter(campaign__owner=self.request.user)
        project_id = self.request.query_params.get("project_id")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class CampaignViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Campaign.objects.prefetch_related("calendar_items", "metrics")
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        campaign = self.get_object()
        queued = []
        for item in campaign.calendar_items.exclude(status=ContentCalendarItem.Status.PUBLISHED):
            queued.append(MarketingService.enqueue_publish(item))
        return Response(
            {"queued": len(queued), "items": QueueItemSerializer(queued, many=True).data},
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=["post"])
    def ingest_analytics(self, request, pk=None):
        campaign = self.get_object()
        if request.data:
            result = MarketingService.ingest_campaign_analytics(
                campaign.id,
                metrics_payload=request.data,
            )
            return Response(result)
        queue_item = MarketingService.enqueue_analytics(campaign)
        return Response(QueueItemSerializer(queue_item).data, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=["post"])
    def refresh_feedback(self, request, pk=None):
        campaign = self.get_object()
        summary = MarketingService.refresh_campaign_feedback(campaign)
        campaign.refresh_from_db()
        return Response(
            {
                "performance_summary": summary,
                "next_action_suggestions": campaign.next_action_suggestions,
            }
        )


class ContentCalendarItemViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = ContentCalendarItem.objects.select_related("campaign", "project")
    serializer_class = ContentCalendarItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        campaign = serializer.validated_data["campaign"]
        serializer.save(owner=self.request.user, project=campaign.project)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        item = self.get_object()
        queue_item = MarketingService.enqueue_publish(item)
        return Response(QueueItemSerializer(queue_item).data, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        item = self.get_object()
        if item.status != ContentCalendarItem.Status.FAILED:
            return Response(
                {"detail": "Only failed posts can be retried."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        queue_item = MarketingService.enqueue_publish(item)
        return Response(QueueItemSerializer(queue_item).data, status=status.HTTP_202_ACCEPTED)


class CampaignMetricViewSet(OwnerQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = CampaignMetric.objects.select_related("campaign", "calendar_item")
    serializer_class = CampaignMetricSerializer
    permission_classes = [permissions.IsAuthenticated]


class MarketingOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        project = None
        project_id = request.query_params.get("project_id")
        if project_id:
            project_qs = Project.objects.filter(id=project_id)
            if not request.user.is_staff:
                project_qs = project_qs.filter(owner=request.user)
            project = project_qs.first()
        summary = MarketingService.overview(owner=request.user, project=project)
        campaigns = Campaign.objects.filter(owner=request.user)
        items = ContentCalendarItem.objects.filter(owner=request.user)
        if project:
            campaigns = campaigns.filter(project=project)
            items = items.filter(project=project)
        return Response(
            {
                **summary,
                "recent": {
                    "campaigns": CampaignSerializer(campaigns[:5], many=True).data,
                    "calendar": ContentCalendarItemSerializer(items[:8], many=True).data,
                },
            }
        )
