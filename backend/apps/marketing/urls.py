from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CampaignMetricViewSet, CampaignViewSet, ContentCalendarItemViewSet, MarketingOverviewView

router = DefaultRouter()
router.register("campaigns", CampaignViewSet, basename="marketing-campaign")
router.register("calendar", ContentCalendarItemViewSet, basename="marketing-calendar")
router.register("metrics", CampaignMetricViewSet, basename="marketing-metric")

urlpatterns = [
    path("overview/", MarketingOverviewView.as_view(), name="marketing-overview"),
    path("", include(router.urls)),
]
