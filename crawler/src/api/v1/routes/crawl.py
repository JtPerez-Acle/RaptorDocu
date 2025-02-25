"""
API routes for crawling documentation websites.
"""

import logging
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, HttpUrl

from src.crawl4ai.client import Crawl4AIClient
from src.crawl4ai.service import DocumentationCrawlerService
from src.utils.config import Settings, get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


class CrawlRequest(BaseModel):
    """
    Request model for crawling a documentation website.
    
    Attributes:
        url: Base URL of the documentation website
        max_pages: Maximum number of pages to crawl
        include_patterns: List of URL patterns to include
        exclude_patterns: List of URL patterns to exclude
        generate_summaries: Whether to generate summaries for the documentation
    """
    
    url: HttpUrl = Field(..., description="Base URL of the documentation website")
    max_pages: Optional[int] = Field(
        default=100, description="Maximum number of pages to crawl"
    )
    include_patterns: Optional[List[str]] = Field(
        default=None, description="List of URL patterns to include"
    )
    exclude_patterns: Optional[List[str]] = Field(
        default=None, description="List of URL patterns to exclude"
    )
    generate_summaries: Optional[bool] = Field(
        default=True, description="Whether to generate summaries for the documentation"
    )


class CrawlResponse(BaseModel):
    """
    Response model for a crawl operation.
    
    Attributes:
        job_id: Unique identifier for the crawl job
        status: Current status of the crawl job
        url: URL that was crawled
        page_count: Number of pages crawled
        embedded_count: Number of pages embedded
        summarized_count: Number of pages summarized
    """
    
    job_id: str = Field(..., description="Unique identifier for the crawl job")
    status: str = Field(..., description="Current status of the crawl job")
    url: HttpUrl = Field(..., description="URL that was crawled")
    page_count: Optional[int] = Field(
        default=None, description="Number of pages crawled"
    )
    embedded_count: Optional[int] = Field(
        default=None, description="Number of pages embedded"
    )
    summarized_count: Optional[int] = Field(
        default=None, description="Number of pages summarized"
    )


class Crawl4AIDocRequest(BaseModel):
    """
    Request model for crawling Crawl4AI documentation.
    
    Attributes:
        max_pages: Maximum number of pages to crawl
        generate_summaries: Whether to generate summaries for the documentation
    """
    
    max_pages: Optional[int] = Field(
        default=100, description="Maximum number of pages to crawl"
    )
    generate_summaries: Optional[bool] = Field(
        default=True, description="Whether to generate summaries for the documentation"
    )


@router.post(
    "/", 
    response_model=CrawlResponse, 
    status_code=status.HTTP_202_ACCEPTED
)
async def start_crawl(
    request: CrawlRequest, settings: Settings = Depends(get_settings)
) -> CrawlResponse:
    """
    Start crawling a documentation website.
    
    Args:
        request: Crawl request data
        settings: Application settings
        
    Returns:
        CrawlResponse: Information about the started crawl job
        
    Raises:
        HTTPException: If there is an error starting the crawl job
    """
    try:
        client = Crawl4AIClient(settings)
        job_id = await client.start_crawl(
            url=str(request.url),
            max_pages=request.max_pages,
            include_patterns=request.include_patterns,
            exclude_patterns=request.exclude_patterns,
        )
        
        return CrawlResponse(
            job_id=job_id,
            status="started",
            url=request.url,
            page_count=None,
            embedded_count=None,
            summarized_count=None,
        )
    except Exception as e:
        logger.error(f"Error starting crawl job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting crawl job: {str(e)}",
        )


@router.get("/{job_id}", response_model=CrawlResponse)
async def get_crawl_status(
    job_id: str, settings: Settings = Depends(get_settings)
) -> CrawlResponse:
    """
    Get the status of a crawl job.
    
    Args:
        job_id: Unique identifier for the crawl job
        settings: Application settings
        
    Returns:
        CrawlResponse: Current status of the crawl job
        
    Raises:
        HTTPException: If the job is not found or there is an error
    """
    try:
        client = Crawl4AIClient(settings)
        status_info = await client.get_crawl_status(job_id)
        
        return CrawlResponse(
            job_id=job_id,
            status=status_info["status"],
            url=status_info["url"],
            page_count=status_info.get("page_count"),
            embedded_count=None,
            summarized_count=None,
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crawl job {job_id} not found",
        )
    except Exception as e:
        logger.error(f"Error getting crawl status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting crawl status: {str(e)}",
        )


@router.post(
    "/crawl4ai-docs",
    response_model=CrawlResponse,
    status_code=status.HTTP_202_ACCEPTED,
    description="Crawl Crawl4AI documentation and store it in the vector database",
)
async def crawl_crawl4ai_docs(
    request: Crawl4AIDocRequest = Crawl4AIDocRequest(),
    settings: Settings = Depends(get_settings),
) -> CrawlResponse:
    """
    Crawl Crawl4AI documentation and store it in the vector database.
    
    Args:
        request: Optional request parameters
        settings: Application settings
        
    Returns:
        CrawlResponse: Information about the crawl operation
        
    Raises:
        HTTPException: If there is an error during crawling or storing
    """
    try:
        crawler_service = DocumentationCrawlerService(settings)
        
        # Define patterns specific to Crawl4AI documentation
        url = "https://crawl4ai.com/mkdocs/"
        include_patterns = [
            "https://crawl4ai.com/mkdocs/*",
        ]
        exclude_patterns = [
            "*.js",
            "*.css",
            "*.png",
            "*.jpg",
            "*.jpeg",
            "*.gif",
            "*.svg",
            "*.ico",
            "*.woff",
            "*.woff2",
            "*.ttf",
            "*.eot",
        ]
        
        # Crawl and store documentation
        result = await crawler_service.crawl_and_store(
            url=url,
            max_pages=request.max_pages,
            include_patterns=include_patterns,
            exclude_patterns=exclude_patterns,
            generate_summaries=request.generate_summaries,
        )
        
        return CrawlResponse(
            job_id=result["job_id"],
            status=result["status"],
            url=url,
            page_count=result["page_count"],
            embedded_count=result["embedded_count"],
            summarized_count=result["summarized_count"],
        )
    except Exception as e:
        logger.error(f"Error crawling Crawl4AI documentation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error crawling Crawl4AI documentation: {str(e)}",
        )