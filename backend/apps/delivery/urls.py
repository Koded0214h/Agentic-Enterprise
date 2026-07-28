from django.urls import path

from .views import (
    ConnectionsView,
    DisconnectView,
    GitHubConnectView,
    RunDeliveryView,
    VercelConnectView,
)

urlpatterns = [
    path("connections/", ConnectionsView.as_view(), name="delivery-connections"),
    path("github/connect/", GitHubConnectView.as_view(), name="delivery-github-connect"),
    path("vercel/connect/", VercelConnectView.as_view(), name="delivery-vercel-connect"),
    path("connections/<str:provider>/", DisconnectView.as_view(), name="delivery-disconnect"),
    path("runs/<str:run_id>/", RunDeliveryView.as_view(), name="delivery-run"),
    path("runs/<str:run_id>/deliver/", RunDeliveryView.as_view(), name="delivery-run-deliver"),
]
