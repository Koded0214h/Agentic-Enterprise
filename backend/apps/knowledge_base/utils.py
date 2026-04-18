"""
Knowledge Base utilities — thin wrappers for use by other apps
(e.g. swarm_bridge) without importing service classes directly.
"""
import logging
from typing import List

logger = logging.getLogger(__name__)


def search_knowledge_base(query: str, top_k: int = 5) -> List[dict]:
    """
    Run a semantic similarity search across all knowledge collections
    the caller has access to.

    Returns a list of result dicts:
        [{"title": str, "content": str, "relevance": float, "collection": str}, ...]

    Fails silently and returns [] if the vector store is unavailable,
    so callers do not need to handle exceptions.
    """
    from .models import KnowledgeCollection
    from .services.vector_store import VectorStoreService

    results = []
    try:
        vector_store = VectorStoreService()
        collections = KnowledgeCollection.objects.filter(is_active=True)

        for collection in collections:
            try:
                hits = vector_store.similarity_search(
                    collection_id=str(collection.id),
                    query=query,
                    k=top_k,
                )
                for hit in hits:
                    results.append({
                        "title": hit["metadata"].get("title", "Unknown"),
                        "content": hit["content"][:500],
                        "relevance": round(float(hit.get("score", 0)), 4),
                        "collection": collection.name,
                        "collection_id": str(collection.id),
                    })
            except Exception:
                logger.debug("similarity_search failed for collection %s", collection.id)
                continue

        # Sort by relevance descending, return top_k overall
        results.sort(key=lambda r: r["relevance"], reverse=True)
        return results[:top_k]

    except Exception as exc:
        logger.warning("search_knowledge_base error: %s", exc)
        return []
