"""
Service for document embedding and similarity search.
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

from src.embedding.weaviate import WeaviateClient
from src.utils.config import Settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service for document embedding and similarity search.
    
    Attributes:
        settings: Application settings
        weaviate_client: Weaviate client for vector operations
    """
    
    def __init__(self, settings: Settings):
        """
        Initialize the embedding service.
        
        Args:
            settings: Application settings
        """
        self.settings = settings
        self.weaviate_client = WeaviateClient(settings)
    
    async def embed_document(
        self, content: str, metadata: Dict[str, str] = None
    ) -> Tuple[str, str]:
        """
        Embed a document and store it in the vector database.
        
        Args:
            content: Document content
            metadata: Optional metadata
            
        Returns:
            Tuple[str, str]: Document ID and vector ID
        """
        if metadata is None:
            metadata = {}
        
        # Store the document in Weaviate (which will also generate the embedding)
        try:
            doc_id, vector_id = self.weaviate_client.add_document(content, metadata)
            logger.info(f"Embedded document with ID: {doc_id}")
            
            return doc_id, vector_id
        except Exception as e:
            logger.error(f"Failed to embed document: {str(e)}")
            raise
    
    async def search(
        self,
        query: str,
        limit: int = 10,
        filters: Optional[Dict[str, str]] = None,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Search for documents by semantic similarity.
        
        Args:
            query: Search query
            limit: Maximum number of results
            filters: Optional filters
            
        Returns:
            Tuple[List[Dict[str, Any]], int]: Search results and total count
        """
        if filters is None:
            filters = {}
        
        # Search for similar documents in Weaviate
        try:
            results, total = self.weaviate_client.search_similar(
                query=query,
                limit=limit,
                filters=filters,
            )
            logger.info(f"Found {total} documents similar to query: {query}")
            
            return results, total
        except Exception as e:
            logger.error(f"Failed to search for documents: {str(e)}")
            raise
    
    async def batch_embed_documents(
        self, documents: List[Dict[str, Any]]
    ) -> List[Tuple[str, str]]:
        """
        Embed multiple documents in a batch.
        
        Args:
            documents: List of document objects with content and metadata
            
        Returns:
            List[Tuple[str, str]]: List of document IDs and vector IDs
        """
        # Store the documents in Weaviate in batch
        try:
            results = self.weaviate_client.batch_add_documents(documents)
            logger.info(f"Embedded {len(documents)} documents in batch")
            
            return results
        except Exception as e:
            logger.error(f"Failed to batch embed documents: {str(e)}")
            raise
    
    async def delete_document(self, vector_id: str) -> bool:
        """
        Delete a document from the vector database.
        
        Args:
            vector_id: Vector ID
            
        Returns:
            bool: True if successful
        """
        try:
            success = self.weaviate_client.delete_document(vector_id)
            if success:
                logger.info(f"Deleted document with vector ID: {vector_id}")
            
            return success
        except Exception as e:
            logger.error(f"Failed to delete document: {str(e)}")
            raise