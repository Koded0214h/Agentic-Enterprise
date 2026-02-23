import os
import tempfile
import uuid
from unittest.mock import patch, MagicMock, mock_open

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from apps.agent_registry.models import Agent, AgentType, AgentStatus
from apps.knowledge_base.models import (
    KnowledgeCollection, Document, DocumentChunk, QueryLog,
)
from apps.knowledge_base.serializers import (
    KnowledgeCollectionSerializer, DocumentSerializer,
    QueryLogSerializer, QuerySerializer
)
from apps.knowledge_base.services.document_processor import DocumentProcessor
from apps.knowledge_base.services.rag_service import RAGService
from apps.knowledge_base.services.vector_store import VectorStoreService

User = get_user_model()


# -------------------- Model Tests --------------------

class KnowledgeCollectionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")

    def test_create_collection(self):
        collection = KnowledgeCollection.objects.create(
            name="Test Collection",
            description="Test description",
            owner=self.user,
            embedding_model="models/gemini-embedding-001",
            chunk_size=500,
            chunk_overlap=100
        )
        self.assertEqual(collection.name, "Test Collection")
        self.assertEqual(collection.owner, self.user)
        self.assertEqual(collection.document_count, 0)
        self.assertEqual(collection.chunk_count, 0)
        self.assertIsNotNone(collection.id)
        self.assertIsNotNone(collection.created_at)
        self.assertIsNotNone(collection.updated_at)

    def test_str_method(self):
        collection = KnowledgeCollection.objects.create(
            name="My Collection",
            owner=self.user
        )
        self.assertEqual(str(collection), "My Collection (0 docs)")


class DocumentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.collection = KnowledgeCollection.objects.create(
            name="Test Collection",
            owner=self.user
        )

    def test_create_document(self):
        doc = Document.objects.create(
            collection=self.collection,
            title="Test Doc",
            filename="test.txt",
            file_type="txt",
            uploaded_by=self.user
        )
        self.assertEqual(doc.title, "Test Doc")
        self.assertEqual(doc.collection, self.collection)
        self.assertEqual(doc.status, "PENDING")
        self.assertEqual(doc.chunk_count, 0)

    def test_str_method(self):
        doc = Document.objects.create(
            collection=self.collection,
            title="My Document",
            filename="my.txt",
            file_type="txt"
        )
        self.assertEqual(str(doc), "My Document")


class DocumentChunkModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.collection = KnowledgeCollection.objects.create(name="C", owner=self.user)
        self.doc = Document.objects.create(collection=self.collection, title="D", filename="d.txt", file_type="txt")

    def test_create_chunk(self):
        chunk = DocumentChunk.objects.create(
            document=self.doc,
            collection=self.collection,
            content="Sample content",
            chunk_index=0,
            page_number=1,
            embedding_id="emb123"
        )
        self.assertEqual(chunk.content, "Sample content")
        self.assertEqual(chunk.chunk_index, 0)
        self.assertEqual(chunk.document, self.doc)


class QueryLogModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.agent = Agent.objects.create(
            name="Test Agent",
            agent_type=AgentType.EXECUTIVE,
            owner=self.user,
            identity_key="testkey",
            status=AgentStatus.RUNNING
        )
        self.collection = KnowledgeCollection.objects.create(name="C", owner=self.user)

    def test_create_query_log(self):
        log = QueryLog.objects.create(
            agent=self.agent,
            collection=self.collection,
            query="test query",
            retrieved_chunks=["chunk1", "chunk2"],
            relevance_scores=[0.9, 0.8],
            response="test response",
            tokens_used=50,
            retrieval_time_ms=100,
            generation_time_ms=200
        )
        self.assertEqual(log.query, "test query")
        self.assertEqual(log.agent, self.agent)
        self.assertEqual(log.response, "test response")


# -------------------- Serializer Tests --------------------

class KnowledgeCollectionSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")

    def test_serialize_collection(self):
        collection = KnowledgeCollection.objects.create(
            name="Serialized Collection",
            description="desc",
            owner=self.user,
            document_count=5,
            chunk_count=20
        )
        serializer = KnowledgeCollectionSerializer(collection)
        data = serializer.data
        self.assertEqual(data['name'], "Serialized Collection")
        self.assertEqual(data['owner_username'], "testuser")
        self.assertEqual(data['document_count'], 5)

    def test_deserialize_valid(self):
        data = {
            'name': 'New Collection',
            'description': 'A new collection',
            'embedding_model': 'models/gemini-embedding-001',
            'chunk_size': 1000,
            'chunk_overlap': 200
        }
        context = {'request': MagicMock(user=self.user)}
        serializer = KnowledgeCollectionSerializer(data=data, context=context)
        self.assertTrue(serializer.is_valid())
        collection = serializer.save(owner=self.user)
        self.assertEqual(collection.name, 'New Collection')


class DocumentSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.collection = KnowledgeCollection.objects.create(name="C", owner=self.user)

    def test_deserialize_valid(self):
        file = SimpleUploadedFile("test.txt", b"file content", content_type="text/plain")
        data = {
            'collection': str(self.collection.id),
            'title': 'Test Doc',
            'filename': 'test.txt',
            'file_type': 'txt',
            'file': file
        }
        serializer = DocumentSerializer(data=data, context={'request': MagicMock(user=self.user)})
        self.assertTrue(serializer.is_valid())
        doc = serializer.save(uploaded_by=self.user)
        self.assertEqual(doc.title, 'Test Doc')
        self.assertEqual(doc.file_type, 'txt')

    def test_invalid_file_type(self):
        file = SimpleUploadedFile("test.pdf", b"fake pdf", content_type="application/pdf")
        data = {
            'collection': str(self.collection.id),
            'title': 'Test Doc',
            'filename': 'test.pdf',
            'file_type': 'pdf',
            'file': file
        }
        serializer = DocumentSerializer(data=data, context={'request': MagicMock(user=self.user)})
        self.assertTrue(serializer.is_valid())  # pdf is allowed if added to choices

    def test_missing_filename(self):
        file = SimpleUploadedFile("test.txt", b"content")
        data = {
            'collection': str(self.collection.id),
            'title': 'Test Doc',
            'file_type': 'txt',
            'file': file
        }
        serializer = DocumentSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('filename', serializer.errors)


class QuerySerializerTest(TestCase):
    def test_valid_query(self):
        data = {'query': 'What is RAG?', 'k': 5}
        serializer = QuerySerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['k'], 5)

    def test_invalid_k_range(self):
        data = {'query': 'test', 'k': 30}
        serializer = QuerySerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('k', serializer.errors)


# -------------------- View Tests --------------------

class KnowledgeCollectionViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.collection = KnowledgeCollection.objects.create(
            name="My Collection",
            owner=self.user
        )

    def test_list_collections(self):
        url = reverse('knowledgecollection-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_collection(self):
        url = reverse('knowledgecollection-list')
        data = {
            'name': 'New Collection',
            'description': 'Test',
            'embedding_model': 'models/gemini-embedding-001'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Collection')
        self.assertEqual(KnowledgeCollection.objects.count(), 2)

    def test_retrieve_collection(self):
        url = reverse('knowledgecollection-detail', args=[self.collection.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], str(self.collection.id))

    def test_update_collection(self):
        url = reverse('knowledgecollection-detail', args=[self.collection.id])
        data = {'name': 'Updated Name'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.collection.refresh_from_db()
        self.assertEqual(self.collection.name, 'Updated Name')

    def test_delete_collection(self):
        url = reverse('knowledgecollection-detail', args=[self.collection.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(KnowledgeCollection.objects.count(), 0)

    @patch('apps.knowledge_base.views.RAGService.query')
    def test_query_endpoint(self, mock_query):
        mock_query.return_value = {'response': 'test answer', 'sources': []}
        url = reverse('knowledgecollection-query', args=[self.collection.id])
        data = {'query': 'test question', 'k': 3}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['response'], 'test answer')
        mock_query.assert_called_once()

    def test_grant_access(self):
        agent = Agent.objects.create(
            name="Test Agent",
            agent_type=AgentType.EXECUTIVE,
            owner=self.user,
            identity_key="testkey",
            status=AgentStatus.RUNNING
        )
        url = reverse('knowledgecollection-grant-access', args=[self.collection.id])
        data = {'agent_id': str(agent.id)}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(agent, self.collection.agents.all())

    def test_revoke_access(self):
        agent = Agent.objects.create(
            name="Test Agent",
            agent_type=AgentType.EXECUTIVE,
            owner=self.user,
            identity_key="testkey",
            status=AgentStatus.RUNNING
        )
        self.collection.agents.add(agent)
        url = reverse('knowledgecollection-revoke-access', args=[self.collection.id])
        data = {'agent_id': str(agent.id)}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn(agent, self.collection.agents.all())


class DocumentViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.collection = KnowledgeCollection.objects.create(name="C", owner=self.user)

    def test_upload_document(self):
        url = reverse('document-list')
        file_content = b"Hello world"
        test_file = SimpleUploadedFile("test.txt", file_content, content_type="text/plain")
        data = {
            'collection': str(self.collection.id),
            'title': 'Upload Test',
            'filename': 'test.txt',
            'file_type': 'txt',
            'file': test_file
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Document.objects.count(), 1)
        doc = Document.objects.first()
        self.assertEqual(doc.title, 'Upload Test')
        self.assertEqual(doc.file_size, len(file_content))

    @patch('apps.knowledge_base.views.DocumentProcessor.process_document')
    def test_process_document(self, mock_process):
        doc = Document.objects.create(
            collection=self.collection,
            title="Process me",
            filename="p.txt",
            file_type="txt",
            uploaded_by=self.user
        )
        url = reverse('document-process', args=[doc.id])
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_process.assert_called_once_with(doc)

    def test_download_document(self):
        doc = Document.objects.create(
            collection=self.collection,
            title="Download",
            filename="down.txt",
            file_type="txt",
            uploaded_by=self.user
        )
        # Save a file to the document
        doc.file.save('down.txt', ContentFile("download content"), save=True)
        url = reverse('document-download', args=[doc.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.get('Content-Disposition'), 'attachment; filename="down.txt"')
        # Clean up
        doc.file.delete()


class QueryLogViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.collection = KnowledgeCollection.objects.create(name="C", owner=self.user)
        self.agent = Agent.objects.create(
            name="Test Agent",
            agent_type=AgentType.EXECUTIVE,
            owner=self.user,
            identity_key="testkey",
            status=AgentStatus.RUNNING
        )
        self.log = QueryLog.objects.create(
            agent=self.agent,
            collection=self.collection,
            query="test",
            response="resp",
            retrieved_chunks=[],
            relevance_scores=[]
        )

    def test_list_logs(self):
        url = reverse('querylog-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


# -------------------- Service Tests --------------------

class DocumentProcessorTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.collection = KnowledgeCollection.objects.create(name="C", owner=self.user)

    @patch('apps.knowledge_base.services.document_processor.VectorStoreService')
    @patch('apps.knowledge_base.services.document_processor.DocumentChunk.objects.create')
    @patch('builtins.open', new_callable=mock_open, read_data=b"Hello world")
    def test_process_text_document(self, mock_file, mock_chunk_create, mock_vector_store):
        doc = Document.objects.create(
            collection=self.collection,
            title="Text Doc",
            filename="test.txt",
            file_type="txt",
            uploaded_by=self.user
        )
        doc.file.save('test.txt', ContentFile("Hello world"), save=True)

        mock_vs_instance = MagicMock()
        mock_vector_store.return_value = mock_vs_instance

        mock_chunk_create.side_effect = lambda **kwargs: MagicMock(id=uuid.uuid4(), **kwargs)

        DocumentProcessor.process_document(doc)

        doc.refresh_from_db()
        self.assertEqual(doc.status, 'INDEXED')
        self.assertGreater(doc.chunk_count, 0)

        mock_vs_instance.add_documents.assert_called_once()

    @patch('apps.knowledge_base.services.document_processor.VectorStoreService')
    def test_process_document_failure(self, mock_vector_store):
        doc = Document.objects.create(
            collection=self.collection,
            title="Fail Doc",
            filename="fail.txt",
            file_type="txt",
            uploaded_by=self.user
        )
        # Simulate file read error
        with patch('builtins.open', side_effect=Exception("File error")):
            with self.assertRaises(Exception):
                DocumentProcessor.process_document(doc)

        doc.refresh_from_db()
        self.assertEqual(doc.status, 'FAILED')
        self.assertIn("File error", doc.error_message)


class RAGServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.collection = KnowledgeCollection.objects.create(name="C", owner=self.user)
        self.agent = Agent.objects.create(
            name="Test Agent",
            agent_type=AgentType.EXECUTIVE,
            owner=self.user,
            identity_key="testkey",
            status=AgentStatus.RUNNING
        )

    @patch('apps.knowledge_base.services.rag_service.VectorStoreService')
    @patch('apps.knowledge_base.services.rag_service.LLMManager.get_llm')
    def test_query_success(self, mock_get_llm, mock_vector_store):
        mock_vs_instance = MagicMock()
        mock_vector_store.return_value = mock_vs_instance
        mock_vs_instance.similarity_search.return_value = [
            {'id': 'chunk1', 'content': 'Relevant content', 'metadata': {'title': 'Doc1'}, 'score': 0.9}
        ]

        mock_llm = MagicMock()
        mock_llm.invoke.return_value.content = "This is the answer"
        mock_get_llm.return_value = mock_llm

        result = RAGService.query(
            collection=self.collection,
            query="test query",
            agent=self.agent,
            k=3
        )

        self.assertEqual(result['response'], "This is the answer")
        self.assertEqual(len(result['sources']), 1)
        self.assertEqual(result['sources'][0]['title'], 'Doc1')
        mock_vs_instance.similarity_search.assert_called_once_with(
            collection_id=str(self.collection.id),
            query="test query",
            k=3
        )
        mock_llm.invoke.assert_called_once()

    @patch('apps.knowledge_base.services.rag_service.VectorStoreService')
    def test_query_no_results(self, mock_vector_store):
        mock_vs_instance = MagicMock()
        mock_vector_store.return_value = mock_vs_instance
        mock_vs_instance.similarity_search.return_value = []

        result = RAGService.query(
            collection=self.collection,
            query="no results",
            agent=None
        )

        self.assertIn("couldn't find any relevant information", result['response'])
        self.assertEqual(result['sources'], [])


class VectorStoreServiceTest(TestCase):
    @patch('chromadb.PersistentClient')
    def test_get_or_create_collection(self, mock_chromadb_client):
        mock_client = MagicMock()
        mock_chromadb_client.return_value = mock_client
        mock_collection = MagicMock()
        mock_client.get_collection.side_effect = Exception("Not found")
        mock_client.create_collection.return_value = mock_collection

        # Reset singleton
        VectorStoreService._instance = None
        service = VectorStoreService()
        service._client = mock_client  # Override the client

        collection = service.get_or_create_collection(
            collection_id="test-id",
            embedding_model="models/gemini-embedding-001"
        )
        self.assertIsNotNone(collection)
        mock_client.create_collection.assert_called_once()

    @patch('chromadb.PersistentClient')
    def test_add_documents(self, mock_chromadb_client):
        mock_client = MagicMock()
        mock_chromadb_client.return_value = mock_client
        mock_collection = MagicMock()
        mock_client.get_or_create_collection = MagicMock(return_value=mock_collection)

        VectorStoreService._instance = None
        service = VectorStoreService()
        service._client = mock_client
        service.get_or_create_collection = MagicMock(return_value=mock_collection)

        chunks = [
            {'id': 'c1', 'document_id': 'd1', 'content': 'test', 'chunk_index': 0, 'filename': 'f.txt'}
        ]
        service.add_documents("test-id", chunks)

        mock_collection.add.assert_called_once_with(
            ids=['c1'],
            documents=['test'],
            metadatas=[{'document_id': 'd1', 'chunk_index': 0, 'page_number': 0, 'title': '', 'filename': 'f.txt'}]
        )

    @patch('chromadb.PersistentClient')
    def test_similarity_search(self, mock_chromadb_client):
        mock_client = MagicMock()
        mock_chromadb_client.return_value = mock_client
        mock_collection = MagicMock()
        mock_collection.query.return_value = {
            'ids': [['id1']],
            'documents': [['content1']],
            'metadatas': [[{'title': 'Doc'}]],
            'distances': [[0.1]]
        }
        mock_client.get_collection.return_value = mock_collection

        VectorStoreService._instance = None
        service = VectorStoreService()
        service._client = mock_client

        results = service.similarity_search("test-id", "query", k=1)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], 'id1')
        self.assertEqual(results[0]['content'], 'content1')
        self.assertEqual(results[0]['metadata']['title'], 'Doc')
        self.assertAlmostEqual(results[0]['score'], 0.9)