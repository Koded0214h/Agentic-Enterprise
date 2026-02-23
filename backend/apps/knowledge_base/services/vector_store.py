import os
import logging
from django.conf import settings
import chromadb
from chromadb.config import Settings

logger = logging.getLogger(__name__)


class VectorStoreService:
    """Service for managing vector embeddings with ChromaDB"""
    
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize ChromaDB client"""
        persist_dir = getattr(settings, 'VECTOR_STORE_PATH', './chroma_db')
        os.makedirs(persist_dir, exist_ok=True)
        
        self._client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=False
            )
        )
        logger.info(f"Vector store initialized at {persist_dir}")
    
    def get_or_create_collection(self, collection_id: str, embedding_model: str = 'text-embedding-004'):
        """Get or create a ChromaDB collection with proper embedding function"""
        
        # Dynamically import embedding function to avoid version issues
        try:
            # For newer chromadb versions
            from chromadb.utils.embedding_functions import GooglePalmEmbeddingFunction
            embedding_fn = GooglePalmEmbeddingFunction(
                api_key=settings.GEMINI_API_KEY,
                model_name=embedding_model
            )
        except ImportError:
            # Fallback for older versions
            from chromadb.utils.embedding_functions import GoogleGenerativeAiEmbeddingFunction
            embedding_fn = GoogleGenerativeAiEmbeddingFunction(
                api_key=settings.GEMINI_API_KEY,
                model_name=embedding_model
            )
        
        collection_name = f"collection_{collection_id}"
        
        try:
            collection = self._client.get_collection(
                name=collection_name,
                embedding_function=embedding_fn
            )
            logger.info(f"Retrieved existing collection: {collection_name}")
        except Exception as e:
            logger.info(f"Creating new collection: {collection_name}")
            collection = self._client.create_collection(
                name=collection_name,
                embedding_function=embedding_fn,
                metadata={"hnsw:space": "cosine"}
            )
        
        return collection
    
    def delete_collection(self, collection_id: str):
        collection_name = f"collection_{collection_id}"
        try:
            self._client.delete_collection(collection_name)
            logger.info(f"Deleted collection: {collection_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete collection: {e}")
            return False
    
    def add_documents(self, collection_id: str, chunks: list):
        """Add document chunks to vector store"""
        collection = self.get_or_create_collection(collection_id)
        
        ids = []
        documents = []
        metadatas = []
        
        for chunk in chunks:
            ids.append(chunk['id'])
            documents.append(chunk['content'])
            metadatas.append({
                'document_id': chunk['document_id'],
                'chunk_index': chunk['chunk_index'],
                'page_number': chunk.get('page_number', 0),
                'title': chunk.get('title', ''),
                'filename': chunk.get('filename', ''),
            })
        
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        
        logger.info(f"Added {len(chunks)} chunks to collection {collection_id}")
        return len(chunks)
    
    def similarity_search(self, collection_id: str, query: str, k: int = 5):
        """Search for similar documents"""
        collection = self.get_or_create_collection(collection_id)
        
        results = collection.query(
            query_texts=[query],
            n_results=k,
            include=["documents", "metadatas", "distances"]
        )
        
        formatted_results = []
        if results['ids'] and results['ids'][0]:
            for i, doc_id in enumerate(results['ids'][0]):
                formatted_results.append({
                    'id': doc_id,
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'score': 1 - results['distances'][0][i] if results['distances'] else 0,
                })
        
        return formatted_results