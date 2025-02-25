"""
API routes for generating RAPTOR summaries.
"""

import logging
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.summarization.service import SummarizationService
from src.utils.config import Settings, get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


class SummaryRequest(BaseModel):
    """
    Request model for generating a summary.
    
    Attributes:
        documents: List of documents to summarize
        max_tokens: Maximum tokens in the summary
        hierarchy_levels: Number of hierarchical levels
    """
    
    documents: List[str] = Field(..., description="List of documents to summarize")
    max_tokens: Optional[int] = Field(
        default=1000, description="Maximum tokens in the summary"
    )
    hierarchy_levels: Optional[int] = Field(
        default=3, description="Number of hierarchical levels"
    )


class HierarchicalSummary(BaseModel):
    """
    Model for a hierarchical summary.
    
    Attributes:
        level: Hierarchy level
        content: Summary content
        children: Child summaries
    """
    
    level: int = Field(..., description="Hierarchy level")
    content: str = Field(..., description="Summary content")
    children: Optional[List["HierarchicalSummary"]] = Field(
        default=None, description="Child summaries"
    )


class SummaryResponse(BaseModel):
    """
    Response model for summary generation.
    
    Attributes:
        id: Unique identifier for the summary
        summary: Generated summary
        hierarchical_summary: Hierarchical summary structure
    """
    
    id: str = Field(..., description="Unique identifier for the summary")
    summary: str = Field(..., description="Generated summary")
    hierarchical_summary: Optional[HierarchicalSummary] = Field(
        default=None, description="Hierarchical summary structure"
    )


@router.post(
    "/", 
    response_model=SummaryResponse, 
    status_code=status.HTTP_200_OK
)
async def generate_summary(
    request: SummaryRequest, settings: Settings = Depends(get_settings)
) -> SummaryResponse:
    """
    Generate a summary using RAPTOR.
    
    Args:
        request: Summary request
        settings: Application settings
        
    Returns:
        SummaryResponse: Generated summary
        
    Raises:
        HTTPException: If there is an error generating the summary
    """
    try:
        service = SummarizationService(settings)
        summary_id, summary, hierarchical = await service.generate_summary(
            documents=request.documents,
            max_tokens=request.max_tokens,
            hierarchy_levels=request.hierarchy_levels,
        )
        
        return SummaryResponse(
            id=summary_id,
            summary=summary,
            hierarchical_summary=hierarchical,
        )
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating summary: {str(e)}",
        )


@router.get("/{summary_id}", response_model=SummaryResponse)
async def get_summary(
    summary_id: str, settings: Settings = Depends(get_settings)
) -> SummaryResponse:
    """
    Get a previously generated summary.
    
    Args:
        summary_id: Unique identifier for the summary
        settings: Application settings
        
    Returns:
        SummaryResponse: Retrieved summary
        
    Raises:
        HTTPException: If the summary is not found or there is an error
    """
    try:
        service = SummarizationService(settings)
        summary_info = await service.get_summary(summary_id)
        
        return SummaryResponse(
            id=summary_id,
            summary=summary_info["summary"],
            hierarchical_summary=summary_info.get("hierarchical_summary"),
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Summary {summary_id} not found",
        )
    except Exception as e:
        logger.error(f"Error retrieving summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving summary: {str(e)}",
        )