from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountViewSet,
    LeadViewSet,
    OpportunityViewSet,
    TicketViewSet,
    TouchpointViewSet,
    QueueItemViewSet,
)

router = DefaultRouter()
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"leads", LeadViewSet, basename="lead")
router.register(r"opportunities", OpportunityViewSet, basename="opportunity")
router.register(r"tickets", TicketViewSet, basename="ticket")
router.register(r"touchpoints", TouchpointViewSet, basename="touchpoint")
router.register(r"queue", QueueItemViewSet, basename="queueitem")

urlpatterns = [
    path("", include(router.urls)),
]
