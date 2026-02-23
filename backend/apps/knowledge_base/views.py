from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse


from .models import KnowledgeCollection, Document, QueryLog
from .serializers import (
    KnowledgeCollectionSerializer, 
    DocumentSerializer,
    QueryLogSerializer,
    QuerySerializer
)
from .services.document_processor import DocumentProcessor
from .services.rag_service import RAGService
from apps.agent_registry.models import Agent


class KnowledgeCollectionViewSet(viewsets.ModelViewSet):
    """Manage knowledge collections"""
    
    queryset = KnowledgeCollection.objects.all()
    serializer_class = KnowledgeCollectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def query(self, request, pk=None):
        """Query a knowledge collection"""
        collection = self.get_object()
        
        serializer = QuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        agent = None
        if 'agent_id' in serializer.validated_data:
            try:
                agent = Agent.objects.get(
                    id=serializer.validated_data['agent_id'],
                    owner=request.user
                )
            except Agent.DoesNotExist:
                pass
        
        try:
            result = RAGService.query(
                collection=collection,
                query=serializer.validated_data['query'],
                agent=agent,
                k=serializer.validated_data.get('k', 5)
            )
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def grant_access(self, request, pk=None):
        collection = self.get_object()
        agent_id = request.data.get('agent_id')
        
        try:
            agent = Agent.objects.get(id=agent_id, owner=request.user)
            collection.agents.add(agent)
            return Response({'status': 'access granted'})
        except Agent.DoesNotExist:
            return Response(
                {'error': 'Agent not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def revoke_access(self, request, pk=None):
        collection = self.get_object()
        agent_id = request.data.get('agent_id')
        
        try:
            agent = Agent.objects.get(id=agent_id, owner=request.user)
            collection.agents.remove(agent)
            return Response({'status': 'access revoked'})
        except Agent.DoesNotExist:
            return Response(
                {'error': 'Agent not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class DocumentViewSet(viewsets.ModelViewSet):
    """Upload and manage documents"""
    
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(collection__owner=self.request.user)
    
    def perform_create(self, serializer):
        # Set file_size automatically
        file = serializer.validated_data.get('file')
        if file:
            serializer.validated_data['file_size'] = file.size
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process and index a document immediately (synchronous)"""
        document = self.get_object()
        
        try:
            DocumentProcessor.process_document(document)
            return Response({
                'status': 'processing completed',
                'document_id': document.id,
                'chunk_count': document.chunk_count
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        document = self.get_object()
        return FileResponse(
            document.file.open(),
            filename=document.filename,
            as_attachment=True
        )


class QueryLogViewSet(viewsets.ReadOnlyModelViewSet):
    """View query history"""
    
    queryset = QueryLog.objects.all()
    serializer_class = QueryLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(collection__owner=self.request.user)