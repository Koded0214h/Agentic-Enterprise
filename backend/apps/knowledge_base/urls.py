from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KnowledgeCollectionViewSet, DocumentViewSet, QueryLogViewSet

router = DefaultRouter()
router.register(r'collections', KnowledgeCollectionViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'queries', QueryLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]