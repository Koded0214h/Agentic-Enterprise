import time
import logging
from django.conf import settings

from .vector_store import VectorStoreService
from ..models import KnowledgeCollection, QueryLog
from apps.agent_intelligence.utils.llm_manager import LLMManager
from apps.agent_intelligence.models import LLMConfig

logger = logging.getLogger(__name__)


class RAGService:
    """Retrieval-Augmented Generation service"""
    
    @classmethod
    def query(cls, collection: KnowledgeCollection, query: str, agent=None, k: int = 5):
        """Query a knowledge collection with RAG"""
        
        start_time = time.time()
        
        # 1. Retrieve relevant chunks
        retrieval_start = time.time()
        vector_store = VectorStoreService()
        results = vector_store.similarity_search(
            collection_id=str(collection.id),
            query=query,
            k=k
        )
        retrieval_time = int((time.time() - retrieval_start) * 1000)
        
        if not results:
            return {
                'query': query,
                'response': "I couldn't find any relevant information in the knowledge base.",
                'sources': [],
                'performance': {
                    'retrieval_ms': retrieval_time,
                    'generation_ms': 0,
                    'total_ms': retrieval_time
                }
            }
        
        # 2. Build context
        context = "\n\n".join([
            f"[From {r['metadata'].get('title', 'Document')}]:\n{r['content']}"
            for r in results
        ])
        
        # 3. Generate response using Gemini
        generation_start = time.time()
        
        # Get or create LLM config for RAG
        llm_config, _ = LLMConfig.objects.get_or_create(
            name="Gemini 2.5 Flash - RAG",
            defaults={
                'provider': 'GEMINI',
                'model_name': 'gemini-2.5-flash',
                'temperature': 0.3,
                'max_tokens': 1024,
            }
        )
        
        llm = LLMManager.get_llm(llm_config)
        
        prompt = f"""You are an AI assistant with access to internal company documents.
        
Use the following context to answer the question. If you cannot find the answer in the context, say "I don't have that information in my knowledge base."

Context:
{context}

Question: {query}

Answer:"""
        
        try:
            response = llm.invoke(prompt)
            answer = response.content
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            answer = "I encountered an error while generating the response."
        
        generation_time = int((time.time() - generation_start) * 1000)
        
        # 4. Log the query
        if agent:
            try:
                QueryLog.objects.create(
                    agent=agent,
                    collection=collection,
                    query=query,
                    retrieved_chunks=[r['id'] for r in results],
                    relevance_scores=[r['score'] for r in results],
                    response=answer,
                    tokens_used=len(answer.split()),
                    retrieval_time_ms=retrieval_time,
                    generation_time_ms=generation_time,
                )
            except Exception as e:
                logger.error(f"Failed to log query: {e}")
        
        return {
            'query': query,
            'response': answer,
            'sources': [
                {
                    'title': r['metadata'].get('title', 'Unknown'),
                    'content': r['content'][:200] + '...' if len(r['content']) > 200 else r['content'],
                    'relevance': r['score'],
                    'page': r['metadata'].get('page_number'),
                }
                for r in results
            ],
            'performance': {
                'retrieval_ms': retrieval_time,
                'generation_ms': generation_time,
                'total_ms': retrieval_time + generation_time,
            }
        }