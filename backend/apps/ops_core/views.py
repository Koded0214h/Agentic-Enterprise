from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Account,
    Lead,
    Opportunity,
    Ticket,
    Touchpoint,
    QueueItem,
    QueueItemStatus,
    QueueItemType,
)
from .serializers import (
    AccountSerializer,
    LeadSerializer,
    OpportunitySerializer,
    TicketSerializer,
    TouchpointSerializer,
    QueueItemSerializer,
)


class ProjectScopedMixin:
    """Filter queryset to records owned by projects belonging to the request user."""

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(project__owner=self.request.user)
        )


class AccountViewSet(ProjectScopedMixin, viewsets.ModelViewSet):
    """
    CRUD for project-owned Account records.
    POST /{id}/enqueue_sync/ — queue a CRM sync for this account.
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["project", "size", "industry"]
    search_fields = ["name", "domain", "website"]
    ordering_fields = ["created_at", "name"]

    @action(detail=True, methods=["post"], url_path="enqueue_sync")
    def enqueue_sync(self, request, pk=None):
        account = self.get_object()
        item = QueueItem.objects.create(
            project=account.project,
            item_type=QueueItemType.ACCOUNT_SYNC,
            payload={"account_id": str(account.id)},
        )
        _dispatch_async(item)
        return Response(QueueItemSerializer(item).data, status=status.HTTP_202_ACCEPTED)


class LeadViewSet(ProjectScopedMixin, viewsets.ModelViewSet):
    """
    CRUD for project-owned Lead records.
    POST /{id}/enqueue_sync/ — queue a CRM lead sync.
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["project", "status", "sync_status", "account"]
    search_fields = ["email", "first_name", "last_name", "company"]
    ordering_fields = ["created_at", "score", "status"]

    @action(detail=True, methods=["post"], url_path="enqueue_sync")
    def enqueue_sync(self, request, pk=None):
        lead = self.get_object()
        item = QueueItem.objects.create(
            project=lead.project,
            item_type=QueueItemType.LEAD_SYNC,
            payload={"lead_id": str(lead.id)},
        )
        _dispatch_async(item)
        return Response(QueueItemSerializer(item).data, status=status.HTTP_202_ACCEPTED)


class OpportunityViewSet(ProjectScopedMixin, viewsets.ModelViewSet):
    """CRUD for project-owned Opportunity records."""
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["project", "stage", "sync_status", "account", "lead"]
    search_fields = ["name"]
    ordering_fields = ["created_at", "value", "close_date", "stage"]

    @action(detail=True, methods=["post"], url_path="enqueue_sync")
    def enqueue_sync(self, request, pk=None):
        opp = self.get_object()
        item = QueueItem.objects.create(
            project=opp.project,
            item_type=QueueItemType.OPPORTUNITY_SYNC,
            payload={"opportunity_id": str(opp.id)},
        )
        _dispatch_async(item)
        return Response(QueueItemSerializer(item).data, status=status.HTTP_202_ACCEPTED)


class TicketViewSet(ProjectScopedMixin, viewsets.ModelViewSet):
    """
    CRUD for project-owned Ticket records.
    POST /{id}/enqueue_sync/ — queue a support platform sync.
    POST /{id}/resolve/      — mark a ticket resolved.
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["project", "status", "priority", "channel", "sync_status", "assignee"]
    search_fields = ["subject", "body"]
    ordering_fields = ["created_at", "priority", "status"]

    @action(detail=True, methods=["post"], url_path="enqueue_sync")
    def enqueue_sync(self, request, pk=None):
        ticket = self.get_object()
        item = QueueItem.objects.create(
            project=ticket.project,
            item_type=QueueItemType.TICKET_SYNC,
            payload={"ticket_id": str(ticket.id)},
        )
        _dispatch_async(item)
        return Response(QueueItemSerializer(item).data, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        from django.utils import timezone
        ticket = self.get_object()
        ticket.status = "resolved"
        ticket.resolved_at = timezone.now()
        ticket.save(update_fields=["status", "resolved_at", "updated_at"])
        return Response(TicketSerializer(ticket).data)


class TouchpointViewSet(ProjectScopedMixin, viewsets.ModelViewSet):
    """CRUD for project-owned Touchpoint records."""
    queryset = Touchpoint.objects.all()
    serializer_class = TouchpointSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["project", "type", "direction", "account", "lead", "ticket"]
    search_fields = ["summary"]
    ordering_fields = ["occurred_at", "created_at"]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class QueueItemViewSet(ProjectScopedMixin, viewsets.ModelViewSet):
    """
    Read/create queue items. Use POST /{id}/retry/ to manually requeue a dead item.
    """
    queryset = QueueItem.objects.all()
    serializer_class = QueueItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["project", "status", "item_type"]
    ordering_fields = ["created_at", "priority", "status"]
    http_method_names = ["get", "post", "head", "options"]  # no PUT/PATCH/DELETE

    def perform_create(self, serializer):
        item = serializer.save()
        _dispatch_async(item)

    @action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        item = self.get_object()
        if item.status not in [QueueItemStatus.DEAD, QueueItemStatus.FAILED]:
            return Response(
                {"detail": "Only dead or failed items can be manually retried."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.status = QueueItemStatus.PENDING
        item.retry_count = 0
        item.error_message = ""
        item.next_retry_at = None
        item.save(
            update_fields=[
                "status", "retry_count", "error_message", "next_retry_at", "updated_at"
            ]
        )
        _dispatch_async(item)
        return Response(QueueItemSerializer(item).data, status=status.HTTP_202_ACCEPTED)


def _dispatch_async(item) -> None:
    """Fire-and-forget: enqueue the item for background processing if Celery is up."""
    try:
        from .tasks import process_queue_item
        process_queue_item.delay(str(item.id))
    except Exception:
        pass  # Celery unavailable in test/dev — beat sweep will pick it up
