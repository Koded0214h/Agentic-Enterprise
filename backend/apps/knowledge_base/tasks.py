from celery import shared_task
import logging

from .models import Document
from .services.document_processor import DocumentProcessor

logger = logging.getLogger(__name__)


@shared_task
def process_document_task(document_id: str):
    """Process document asynchronously"""
    try:
        document = Document.objects.get(id=document_id)
        DocumentProcessor.process_document(document)
        return f"Processed document {document_id}"
    except Document.DoesNotExist:
        logger.error(f"Document {document_id} not found")
        return f"Document {document_id} not found"
    except Exception as e:
        logger.error(f"Failed to process document {document_id}: {e}")
        raise