"""
Client for interacting with the Crawl4AI API.
"""

import json
import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from src.utils.config import Settings

logger = logging.getLogger(__name__)


class Crawl4AIClient:
    """
    Client for interacting with the Crawl4AI API.
    
    Attributes:
        settings: Application settings
        base_url: Base URL for the Crawl4AI API
        api_key: API key for authentication
        client: HTTP client
    """
    
    def __init__(self, settings: Settings):
        """
        Initialize the Crawl4AI client.
        
        Args:
            settings: Application settings
        """
        self.settings = settings
        self.base_url = settings.crawl4ai_base_url
        self.api_key = settings.crawl4ai_api_key
        self.client = httpx.AsyncClient(
            timeout=60.0,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )
    
    async def start_crawl(
        self,
        url: str,
        max_pages: Optional[int] = 100,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
    ) -> str:
        """
        Start a new crawl job.
        
        Args:
            url: URL to crawl
            max_pages: Maximum number of pages to crawl
            include_patterns: List of URL patterns to include
            exclude_patterns: List of URL patterns to exclude
            
        Returns:
            str: Unique identifier for the crawl job
            
        Raises:
            Exception: If there is an error starting the crawl job
        """
        try:
            job_id = str(uuid.uuid4())
            payload = {
                "url": url,
                "max_pages": max_pages,
                "job_id": job_id,
            }
            
            if include_patterns:
                payload["include_patterns"] = include_patterns
            
            if exclude_patterns:
                payload["exclude_patterns"] = exclude_patterns
            
            response = await self.client.post(
                f"{self.base_url}/crawl",
                json=payload,
            )
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Started crawl job {job_id} for URL {url}")
            
            return job_id
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error when starting crawl: {e.response.text}")
            raise Exception(f"Failed to start crawl: {e}")
        except httpx.RequestError as e:
            logger.error(f"Request error when starting crawl: {str(e)}")
            raise Exception(f"Failed to start crawl: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error when starting crawl: {str(e)}")
            raise
    
    async def get_crawl_status(self, job_id: str) -> Dict[str, Any]:
        """
        Get the status of a crawl job.
        
        Args:
            job_id: Unique identifier for the crawl job
            
        Returns:
            Dict[str, Any]: Status information for the crawl job
            
        Raises:
            Exception: If there is an error getting the crawl status
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/crawl/{job_id}",
            )
            response.raise_for_status()
            
            data = response.json()
            logger.debug(f"Got status for crawl job {job_id}: {data}")
            
            return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error when getting crawl status: {e.response.text}")
            if e.response.status_code == 404:
                raise KeyError(f"Crawl job {job_id} not found")
            raise Exception(f"Failed to get crawl status: {e}")
        except httpx.RequestError as e:
            logger.error(f"Request error when getting crawl status: {str(e)}")
            raise Exception(f"Failed to get crawl status: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error when getting crawl status: {str(e)}")
            raise
    
    async def fetch_crawl_results(self, job_id: str) -> List[Dict[str, Any]]:
        """
        Fetch the results of a completed crawl job.
        
        Args:
            job_id: Unique identifier for the crawl job
            
        Returns:
            List[Dict[str, Any]]: List of crawled pages
            
        Raises:
            Exception: If there is an error fetching the crawl results
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/crawl/{job_id}/results",
            )
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Fetched results for crawl job {job_id}: {len(data)} pages")
            
            return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error when fetching crawl results: {e.response.text}")
            if e.response.status_code == 404:
                raise KeyError(f"Crawl job {job_id} not found")
            raise Exception(f"Failed to fetch crawl results: {e}")
        except httpx.RequestError as e:
            logger.error(f"Request error when fetching crawl results: {str(e)}")
            raise Exception(f"Failed to fetch crawl results: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error when fetching crawl results: {str(e)}")
            raise
            
    @retry(
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.RequestError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def wait_for_crawl_completion(self, job_id: str, check_interval: int = 5) -> Tuple[str, int]:
        """
        Wait for a crawl job to complete.
        
        Args:
            job_id: Unique identifier for the crawl job
            check_interval: Interval in seconds between status checks
            
        Returns:
            Tuple[str, int]: Final status and page count
            
        Raises:
            Exception: If there is an error waiting for the crawl job to complete
        """
        import asyncio
        
        try:
            while True:
                status_info = await self.get_crawl_status(job_id)
                
                status = status_info.get("status", "unknown")
                page_count = status_info.get("page_count", 0)
                
                logger.info(f"Crawl job {job_id} status: {status}, pages: {page_count}")
                
                if status == "completed":
                    return status, page_count
                elif status in ["failed", "error"]:
                    error_message = status_info.get("error", "Unknown error")
                    raise Exception(f"Crawl job failed: {error_message}")
                
                # Wait before checking again
                await asyncio.sleep(check_interval)
        except Exception as e:
            logger.error(f"Error waiting for crawl completion: {str(e)}")
            raise