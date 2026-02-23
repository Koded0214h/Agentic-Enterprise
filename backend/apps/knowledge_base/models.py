import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.agent_registry.models import Agent

User = get_user_model()


class KnowledgeCollection(models.Model):
    """A collection of documents (e.g., 'Sales Docs 2024', 'Engineering Wiki')"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='knowledge_collections')
    agents = models.ManyToManyField(Agent, blank=True, related_name='knowledge_collections')
    
    embedding_model = models.CharField(
        max_length=100,
        default='models/gemini-embedding-001',  # <-- UPDATE THIS
        choices=[
            ('models/gemini-embedding-001', 'Gemini Embedding 001'),
            # you can keep other options if you like
        ]
    )

    
    chunk_size = models.IntegerField(default=1000)
    chunk_overlap = models.IntegerField(default=200)
    
    document_count = models.IntegerField(default=0)
    chunk_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'name']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.document_count} docs)"


class Document(models.Model):
    """Individual documents uploaded by users"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collection = models.ForeignKey(
        KnowledgeCollection, 
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    title = models.CharField(max_length=500)
    filename = models.CharField(max_length=500)
    file_type = models.CharField(max_length=50)  # pdf, docx, txt, md
    
    file = models.FileField(upload_to='knowledge_docs/%Y/%m/%d/')
    file_size = models.IntegerField(default=0)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('PROCESSING', 'Processing'),
            ('INDEXED', 'Indexed'),
            ('FAILED', 'Failed'),
        ],
        default='PENDING'
    )
    
    page_count = models.IntegerField(null=True, blank=True)
    author = models.CharField(max_length=255, blank=True)
    created_date = models.DateField(null=True, blank=True)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    error_message = models.TextField(blank=True)
    chunk_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.title


class DocumentChunk(models.Model):
    """Individual chunks of documents with embeddings"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    collection = models.ForeignKey(KnowledgeCollection, on_delete=models.CASCADE, related_name='chunks')
    
    content = models.TextField()
    chunk_index = models.IntegerField()
    
    page_number = models.IntegerField(null=True, blank=True)
    bbox = models.JSONField(null=True, blank=True)
    
    embedding_id = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['document', 'chunk_index']
        indexes = [
            models.Index(fields=['collection', 'document']),
        ]


class QueryLog(models.Model):
    """Track agent queries and retrieved context"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='rag_queries')
    collection = models.ForeignKey(KnowledgeCollection, on_delete=models.CASCADE)
    
    query = models.TextField()
    query_embedding_id = models.CharField(max_length=255, blank=True)
    
    retrieved_chunks = models.JSONField(default=list)
    relevance_scores = models.JSONField(default=list)
    
    response = models.TextField()
    tokens_used = models.IntegerField(default=0)
    
    retrieval_time_ms = models.IntegerField(default=0)
    generation_time_ms = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent', 'created_at']),
            models.Index(fields=['collection', 'created_at']),
        ]