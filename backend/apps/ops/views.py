from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Account, Lead, Opportunity, Ticket, Touchpoint, QueueItem
from .serializers import (
    AccountSerializer,
    LeadSerializer,
    OpportunitySerializer,
    TicketSerializer,
    TouchpointSerializer,
    QueueItemSerializer,
)
from .services import OpsService, connector_status


class OwnerQuerysetMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AccountViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]


class LeadViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Lead.objects.select_related("account", "converted_opportunity")
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        lead, queue_item = OpsService.create_lead(owner=request.user, data=request.data)
        OpsService.process_queue_item(queue_item)
        return Response(
            {
                "lead": LeadSerializer(lead).data,
                "queue_item": QueueItemSerializer(queue_item).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def convert(self, request, pk=None):
        lead = self.get_object()
        serializer = OpportunitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        opportunity, queue_item = OpsService.create_opportunity(
            owner=request.user,
            data=serializer.validated_data,
            lead=lead,
        )
        return Response(
            {
                "lead": LeadSerializer(lead).data,
                "opportunity": OpportunitySerializer(opportunity).data,
                "queue_item": QueueItemSerializer(queue_item).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def sync(self, request, pk=None):
        lead = self.get_object()
        queue_item = OpsService.enqueue(
            owner=request.user,
            kind=QueueItem.Kind.LEAD_SYNC,
            payload={"lead_id": str(lead.id), **request.data},
            lead=lead,
        )
        OpsService.process_queue_item(queue_item)
        return Response(QueueItemSerializer(queue_item).data)


class OpportunityViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Opportunity.objects.select_related("account", "lead")
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        lead = None
        lead_id = request.data.get("lead_id")
        if lead_id:
            lead = Lead.objects.filter(id=lead_id, owner=request.user).select_related("account").first()
        opportunity, queue_item = OpsService.create_opportunity(owner=request.user, data=request.data, lead=lead)
        OpsService.process_queue_item(queue_item)
        return Response(
            {
                "opportunity": OpportunitySerializer(opportunity).data,
                "queue_item": QueueItemSerializer(queue_item).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def sync(self, request, pk=None):
        opportunity = self.get_object()
        queue_item = OpsService.enqueue(
            owner=request.user,
            kind=QueueItem.Kind.OPPORTUNITY_SYNC,
            payload={"opportunity_id": str(opportunity.id), **request.data},
            opportunity=opportunity,
        )
        OpsService.process_queue_item(queue_item)
        return Response(QueueItemSerializer(queue_item).data)


class TicketViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related("account", "assignee")
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        ticket, queue_item = OpsService.create_ticket(owner=request.user, data=request.data)
        OpsService.process_queue_item(queue_item)
        return Response(
            {
                "ticket": TicketSerializer(ticket).data,
                "queue_item": QueueItemSerializer(queue_item).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = Ticket.Status.RESOLVED
        ticket.save(update_fields=["status", "updated_at"])
        queue_item = OpsService.enqueue(
            owner=request.user,
            kind=QueueItem.Kind.TICKET_REPLY,
            payload={
                "ticket_id": str(ticket.id),
                "message": request.data.get("message") or "Ticket resolved",
            },
            ticket=ticket,
        )
        OpsService.process_queue_item(queue_item)
        return Response(
            {
                "ticket": TicketSerializer(ticket).data,
                "queue_item": QueueItemSerializer(queue_item).data,
            }
        )

    @action(detail=True, methods=["post"])
    def sync(self, request, pk=None):
        ticket = self.get_object()
        queue_item = OpsService.enqueue(
            owner=request.user,
            kind=QueueItem.Kind.TICKET_SYNC,
            payload={"ticket_id": str(ticket.id), **request.data},
            ticket=ticket,
        )
        OpsService.process_queue_item(queue_item)
        return Response(QueueItemSerializer(queue_item).data)


class TouchpointViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Touchpoint.objects.select_related("account", "lead", "opportunity", "ticket")
    serializer_class = TouchpointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        touchpoint = OpsService.log_touchpoint(owner=request.user, data=request.data)
        queue_item = QueueItem.objects.filter(touchpoint=touchpoint).order_by("-created_at").first()
        if queue_item:
            OpsService.process_queue_item(queue_item)
        return Response(TouchpointSerializer(touchpoint).data, status=status.HTTP_201_CREATED)


class QueueItemViewSet(OwnerQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = QueueItem.objects.select_related("lead", "opportunity", "ticket", "touchpoint")
    serializer_class = QueueItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["post"])
    def process(self, request):
        limit = int(request.data.get("limit") or 25)
        processed = OpsService.process_pending(owner=request.user if not request.user.is_staff else None, limit=limit)
        return Response(
            {
                "processed": len(processed),
                "items": QueueItemSerializer(processed, many=True).data,
            }
        )

    @action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        item = self.get_object()
        item.status = QueueItem.Status.PENDING
        item.next_attempt_at = None
        item.last_error = ""
        item.save(update_fields=["status", "next_attempt_at", "last_error", "updated_at"])
        OpsService.process_queue_item(item)
        return Response(QueueItemSerializer(item).data)


class OpsOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        owner = None if request.user.is_staff else request.user
        summary = OpsService.overview(owner=owner)
        if owner is None:
            latest_leads = Lead.objects.select_related("account")[:5]
            latest_tickets = Ticket.objects.select_related("account")[:5]
            latest_queue = QueueItem.objects.all()[:5]
        else:
            latest_leads = Lead.objects.filter(owner=owner).select_related("account")[:5]
            latest_tickets = Ticket.objects.filter(owner=owner).select_related("account")[:5]
            latest_queue = QueueItem.objects.filter(owner=owner)[:5]

        return Response(
            {
                **summary,
                "recent": {
                    "leads": LeadSerializer(latest_leads, many=True).data,
                    "tickets": TicketSerializer(latest_tickets, many=True).data,
                    "queue": QueueItemSerializer(latest_queue, many=True).data,
                },
            }
        )


class OpsConnectorsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(connector_status())
