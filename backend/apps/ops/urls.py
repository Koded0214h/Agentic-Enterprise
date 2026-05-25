from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AccountViewSet,
    LeadViewSet,
    OpportunityViewSet,
    TicketViewSet,
    TouchpointViewSet,
    QueueItemViewSet,
    OpsOverviewView,
    OpsConnectorsView,
)


router = DefaultRouter()
router.register(r"accounts", AccountViewSet, basename="ops-account")
router.register(r"leads", LeadViewSet, basename="ops-lead")
router.register(r"opportunities", OpportunityViewSet, basename="ops-opportunity")
router.register(r"tickets", TicketViewSet, basename="ops-ticket")
router.register(r"touchpoints", TouchpointViewSet, basename="ops-touchpoint")
router.register(r"queue", QueueItemViewSet, basename="ops-queue")

urlpatterns = [
    path("", include(router.urls)),
    path("overview/", OpsOverviewView.as_view(), name="ops-overview"),
    path("connectors/", OpsConnectorsView.as_view(), name="ops-connectors"),
]
