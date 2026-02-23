from rest_framework import serializers
from .models import KnowledgeCollection, Document, DocumentChunk, QueryLog


class KnowledgeCollectionSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    document_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = KnowledgeCollection
        fields = '__all__'
        read_only_fields = ['id', 'owner', 'document_count', 'chunk_count', 'created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    collection_name = serializers.CharField(source='collection.name', read_only=True)
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = [
            'id', 'uploaded_by', 'uploaded_at', 'status', 
            'chunk_count', 'error_message', 'file_size'
        ]
        extra_kwargs = {
            'filename': {'required': True},
            'file_type': {'required': True},
            'file': {'required': True},
        }
    
    def validate_file_type(self, value):
        allowed_types = ['pdf', 'docx', 'txt', 'md']
        if value not in allowed_types:
            raise serializers.ValidationError(f"File type must be one of: {allowed_types}")
        return value


class DocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentChunk
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class QueryLogSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    collection_name = serializers.CharField(source='collection.name', read_only=True)
    
    class Meta:
        model = QueryLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class QuerySerializer(serializers.Serializer):
    query = serializers.CharField()
    agent_id = serializers.UUIDField(required=False)
    k = serializers.IntegerField(default=5, min_value=1, max_value=20)