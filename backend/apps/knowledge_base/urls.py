from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KnowledgeCollectionViewSet, DocumentViewSet, QueryLogViewSet, MemoryTagViewSet

router = DefaultRouter()
router.register(r'collections', KnowledgeCollectionViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'queries', QueryLogViewSet)
router.register(r'query-logs', QueryLogViewSet, basename='query-logs')
router.register(r'tags', MemoryTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
]