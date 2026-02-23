import os
import uuid
import logging
from typing import List, Dict, Any

from ..models import Document, DocumentChunk
from .vector_store import VectorStoreService

logger = logging.getLogger(__name__)

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None

try:
    import markdown
    from bs4 import BeautifulSoup
except ImportError:
    markdown = None
    BeautifulSoup = None


class DocumentProcessor:
    """Process documents and create embeddings"""
    
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    
    @classmethod
    def process_document(cls, document: Document):
        """Process a document and index it in vector store (synchronous)"""
        
        try:
            document.status = 'PROCESSING'
            document.save()
            
            file_path = document.file.path
            file_ext = os.path.splitext(document.filename)[1].lower()
            
            # Extract text based on file type
            if file_ext == '.pdf' and PyPDF2:
                chunks = cls._process_pdf(document, file_path)
            elif file_ext in ['.docx', '.doc'] and DocxDocument:
                chunks = cls._process_docx(document, file_path)
            elif file_ext == '.md' and markdown and BeautifulSoup:
                chunks = cls._process_markdown(document, file_path)
            else:  # Fallback to plain text
                chunks = cls._process_text(document, file_path)
            
            if not chunks:
                raise ValueError("No text content extracted from document")
            
            # Save chunks to database
            document_chunks = []
            for i, chunk_data in enumerate(chunks):
                chunk = DocumentChunk.objects.create(
                    document=document,
                    collection=document.collection,
                    content=chunk_data['content'],
                    chunk_index=i,
                    page_number=chunk_data.get('page_number', 0),
                    embedding_id=str(uuid.uuid4())
                )
                document_chunks.append({
                    'id': str(chunk.id),
                    'document_id': str(document.id),
                    'content': chunk.content,
                    'chunk_index': chunk.chunk_index,
                    'page_number': chunk.page_number,
                    'title': document.title,
                    'filename': document.filename,
                })
            
            # Index in vector store
            vector_store = VectorStoreService()
            vector_store.add_documents(
                collection_id=str(document.collection.id),
                chunks=document_chunks
            )
            
            # Update document status
            document.status = 'INDEXED'
            document.chunk_count = len(document_chunks)
            document.save()
            
            # Update collection counts
            collection = document.collection
            collection.document_count += 1
            collection.chunk_count += len(document_chunks)
            collection.save()
            
            logger.info(f"Processed document {document.id} with {len(chunks)} chunks")
            
        except Exception as e:
            document.status = 'FAILED'
            document.error_message = str(e)
            document.save()
            logger.error(f"Failed to process document {document.id}: {e}")
            raise
    
    @classmethod
    def _process_pdf(cls, document: Document, file_path: str) -> List[Dict[str, Any]]:
        chunks = []
        with open(file_path, 'rb') as f:
            pdf = PyPDF2.PdfReader(f)
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text.strip():
                    page_chunks = cls._chunk_text(text)
                    for chunk_text in page_chunks:
                        chunks.append({
                            'content': chunk_text,
                            'page_number': page_num + 1,
                        })
        return chunks
    
    @classmethod
    def _process_docx(cls, document: Document, file_path: str) -> List[Dict[str, Any]]:
        chunks = []
        doc = DocxDocument(file_path)
        full_text = '\n'.join([para.text for para in doc.paragraphs])
        for chunk_text in cls._chunk_text(full_text):
            if chunk_text.strip():
                chunks.append({'content': chunk_text})
        return chunks
    
    @classmethod
    def _process_text(cls, document: Document, file_path: str) -> List[Dict[str, Any]]:
        chunks = []
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        for chunk_text in cls._chunk_text(text):
            if chunk_text.strip():
                chunks.append({'content': chunk_text})
        return chunks
    
    @classmethod
    def _process_markdown(cls, document: Document, file_path: str) -> List[Dict[str, Any]]:
        chunks = []
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            md_text = f.read()
        html = markdown.markdown(md_text)
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.get_text()
        for chunk_text in cls._chunk_text(text):
            if chunk_text.strip():
                chunks.append({'content': chunk_text})
        return chunks
    
    @classmethod
    def _chunk_text(cls, text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        if chunk_size is None:
            chunk_size = cls.CHUNK_SIZE
        if overlap is None:
            overlap = cls.CHUNK_OVERLAP
        
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            
            # Try to find sentence boundary
            if end < text_len:
                for boundary in ['. ', '?\n', '!\n', '\n\n', '.\n', '? ', '! ']:
                    last_boundary = text.rfind(boundary, start, end)
                    if last_boundary != -1:
                        end = last_boundary + len(boundary)
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start = end - overlap
        
        return chunks