"""
API routes for handling document embeddings.
"""

import logging
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.embedding.service import EmbeddingService
from src.utils.config import Settings, get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


class DocumentEmbedRequest(BaseModel):
    """
    Request model for embedding a document.
    
    Attributes:
        content: Document content to embed
        metadata: Optional metadata about the document
    """
    
    content: str = Field(..., description="Document content to embed")
    metadata: Optional[Dict[str, str]] = Field(
        default={}, description="Metadata about the document"
    )


class DocumentEmbedResponse(BaseModel):
    """
    Response model for document embedding.
    
    Attributes:
        id: Unique identifier for the embedded document
        vector_id: ID of the vector in the vector database
    """
    
    id: str = Field(..., description="Unique identifier for the embedded document")
    vector_id: str = Field(..., description="ID of the vector in the vector database")


class SearchRequest(BaseModel):
    """
    Request model for searching document embeddings.
    
    Attributes:
        query: Search query
        limit: Maximum number of results to return
        filters: Optional filters to apply to search results
    """
    
    query: str = Field(..., description="Search query")
    limit: int = Field(default=10, description="Maximum number of results to return")
    filters: Optional[Dict[str, str]] = Field(
        default={}, description="Filters to apply to search results"
    )


class SearchResult(BaseModel):
    """
    Model for a single search result.
    
    Attributes:
        id: Unique identifier for the document
        content: Document content
        metadata: Metadata about the document
        score: Similarity score
    """
    
    id: str = Field(..., description="Unique identifier for the document")
    content: str = Field(..., description="Document content")
    metadata: Dict[str, str] = Field(..., description="Metadata about the document")
    score: float = Field(..., description="Similarity score")


class SearchResponse(BaseModel):
    """
    Response model for embedding search.
    
    Attributes:
        results: List of search results
        total: Total number of results
    """
    
    results: List[SearchResult] = Field(..., description="List of search results")
    total: int = Field(..., description="Total number of results")


@router.post(
    "/", 
    response_model=DocumentEmbedResponse, 
    status_code=status.HTTP_201_CREATED
)
async def embed_document(
    request: DocumentEmbedRequest, settings: Settings = Depends(get_settings)
) -> DocumentEmbedResponse:
    """
    Embed a document in the vector database.
    
    Args:
        request: Document embed request
        settings: Application settings
        
    Returns:
        DocumentEmbedResponse: Information about the embedded document
        
    Raises:
        HTTPException: If there is an error embedding the document
    """
    try:
        service = EmbeddingService(settings)
        doc_id, vector_id = await service.embed_document(
            content=request.content, 
            metadata=request.metadata
        )
        
        return DocumentEmbedResponse(
            id=doc_id,
            vector_id=vector_id,
        )
    except Exception as e:
        logger.error(f"Error embedding document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error embedding document: {str(e)}",
        )


@router.post("/search", response_model=SearchResponse)
async def search_embeddings(
    request: SearchRequest, settings: Settings = Depends(get_settings)
) -> SearchResponse:
    """
    Search for documents by semantic similarity.
    
    Args:
        request: Search request
        settings: Application settings
        
    Returns:
        SearchResponse: Search results
        
    Raises:
        HTTPException: If there is an error searching for documents
    """
    try:
        service = EmbeddingService(settings)
        results, total = await service.search(
            query=request.query,
            limit=request.limit,
            filters=request.filters,
        )
        
        return SearchResponse(
            results=results,
            total=total,
        )
    except Exception as e:
        logger.error(f"Error searching embeddings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching embeddings: {str(e)}",
        )