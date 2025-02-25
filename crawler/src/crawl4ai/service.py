"""
Service for crawling and processing documentation from Crawl4AI.
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional, Tuple

from src.crawl4ai.client import Crawl4AIClient
from src.embedding.service import EmbeddingService
from src.summarization.service import SummarizationService
from src.utils.config import Settings

logger = logging.getLogger(__name__)


class DocumentationCrawlerService:
    """
    Service for crawling and storing documentation.
    
    Attributes:
        settings: Application settings
        crawl4ai_client: Crawl4AI client for fetching documentation
        embedding_service: Service for document embedding
        summarization_service: Service for document summarization
    """
    
    def __init__(
        self, 
        settings: Settings,
        crawl4ai_client: Optional[Crawl4AIClient] = None,
        embedding_service: Optional[EmbeddingService] = None,
        summarization_service: Optional[SummarizationService] = None,
    ):
        """
        Initialize the documentation crawler service.
        
        Args:
            settings: Application settings
            crawl4ai_client: Optional Crawl4AI client
            embedding_service: Optional embedding service
            summarization_service: Optional summarization service
        """
        self.settings = settings
        self.crawl4ai_client = crawl4ai_client or Crawl4AIClient(settings)
        self.embedding_service = embedding_service or EmbeddingService(settings)
        self.summarization_service = summarization_service or SummarizationService(settings)
    
    async def crawl_and_store(
        self,
        url: str,
        max_pages: int = 100,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
        generate_summaries: bool = True,
    ) -> Dict[str, Any]:
        """
        Crawl documentation and store it in the vector database.
        
        Args:
            url: URL to crawl
            max_pages: Maximum number of pages to crawl
            include_patterns: List of URL patterns to include
            exclude_patterns: List of URL patterns to exclude
            generate_summaries: Whether to generate summaries for the documentation
            
        Returns:
            Dict[str, Any]: Result of the crawl and store operation
            
        Raises:
            Exception: If there is an error during crawling or storing
        """
        try:
            # Extract domain name for source metadata
            from urllib.parse import urlparse
            parsed_url = urlparse(url)
            source = parsed_url.netloc
            
            # Start the crawl job
            logger.info(f"Starting crawl for {url} with max_pages={max_pages}")
            job_id = await self.crawl4ai_client.start_crawl(
                url=url,
                max_pages=max_pages,
                include_patterns=include_patterns,
                exclude_patterns=exclude_patterns,
            )
            
            # Wait for the crawl job to complete
            status, page_count = await self.crawl4ai_client.wait_for_crawl_completion(job_id)
            
            if status != "completed":
                raise Exception(f"Crawl job did not complete successfully: {status}")
            
            # Fetch the crawl results
            logger.info(f"Fetching crawl results for job {job_id}")
            pages = await self.crawl4ai_client.fetch_crawl_results(job_id)
            
            if not pages:
                logger.warning(f"No pages found in crawl results for job {job_id}")
                return {
                    "job_id": job_id,
                    "status": status,
                    "url": url,
                    "page_count": 0,
                    "embedded_count": 0,
                    "summarized_count": 0,
                }
            
            # Process pages in parallel
            logger.info(f"Processing {len(pages)} pages from crawl job {job_id}")
            embedded_count = 0
            summarized_count = 0
            
            # Prepare documents for batch embedding
            batch_documents = []
            
            for page in pages:
                content = page.get("content", "")
                title = page.get("title", "Untitled Page")
                page_url = page.get("url", url)
                
                # Skip pages with empty content
                if not content.strip():
                    logger.warning(f"Skipping page with empty content: {page_url}")
                    continue
                
                metadata = {
                    "title": title,
                    "url": page_url,
                    "source": source,
                    "version": "latest",
                }
                
                # Add to batch for embedding
                batch_documents.append({
                    "content": content,
                    "metadata": metadata,
                })
            
            # Batch embed documents
            if batch_documents:
                logger.info(f"Embedding {len(batch_documents)} documents in batch")
                embedding_results = await self.embedding_service.batch_embed_documents(batch_documents)
                embedded_count = len(embedding_results)
                logger.info(f"Successfully embedded {embedded_count} documents")
            
            # Generate summaries if requested
            if generate_summaries and batch_documents:
                # Create summaries for top-level documents
                logger.info(f"Generating summaries for {len(batch_documents)} documents")
                
                # Process in batches of 10 to avoid overloading the system
                batch_size = 10
                
                for i in range(0, len(batch_documents), batch_size):
                    batch = batch_documents[i:i+batch_size]
                    
                    # Process each document in parallel
                    tasks = []
                    for doc in batch:
                        task = asyncio.create_task(self._generate_summary(
                            content=doc["content"],
                            metadata=doc["metadata"],
                        ))
                        tasks.append(task)
                    
                    # Wait for all tasks to complete
                    summary_results = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    # Count successful summaries
                    for result in summary_results:
                        if not isinstance(result, Exception) and result:
                            summarized_count += 1
                    
                    logger.info(f"Generated {summarized_count} summaries")
            
            return {
                "job_id": job_id,
                "status": status,
                "url": url,
                "page_count": page_count,
                "embedded_count": embedded_count,
                "summarized_count": summarized_count,
            }
        except Exception as e:
            logger.error(f"Error during crawl and store: {str(e)}")
            raise
    
    async def _generate_summary(self, content: str, metadata: Dict[str, str]) -> bool:
        """
        Generate a summary for a document and store it.
        
        Args:
            content: Document content
            metadata: Document metadata
            
        Returns:
            bool: True if successful
            
        Raises:
            Exception: If there is an error generating the summary
        """
        try:
            # Generate the summary
            summary = await self.summarization_service.generate_summary(
                text=content,
                title=metadata.get("title", "Untitled Document"),
                url=metadata.get("url", ""),
            )
            
            # Store the summary
            await self.summarization_service.store_summary(
                text=content,
                summary=summary,
                metadata=metadata,
            )
            
            return True
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return False