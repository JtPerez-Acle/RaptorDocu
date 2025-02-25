"""
Tests for the DocumentationCrawlerService.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from src.crawl4ai.service import DocumentationCrawlerService
from src.utils.config import Settings


@pytest.fixture
def settings():
    """
    Create test settings.
    """
    return Settings(
        crawl4ai_base_url="https://api.crawl4ai.com",
        crawl4ai_api_key="test-api-key",
        weaviate_url="http://localhost:8080",
        weaviate_api_key="test-weaviate-key",
        openai_api_key="test-openai-key",
    )


@pytest.fixture
def mock_crawl4ai_client():
    """
    Create a mock Crawl4AI client.
    """
    client = AsyncMock()
    client.start_crawl.return_value = "test-job-id"
    client.wait_for_crawl_completion.return_value = ("completed", 5)
    client.fetch_crawl_results.return_value = [
        {
            "url": "https://crawl4ai.com/mkdocs/",
            "title": "Crawl4AI Documentation",
            "content": "Test content 1",
        },
        {
            "url": "https://crawl4ai.com/mkdocs/getting-started/",
            "title": "Getting Started",
            "content": "Test content 2",
        },
    ]
    return client


@pytest.fixture
def mock_embedding_service():
    """
    Create a mock embedding service.
    """
    service = AsyncMock()
    service.batch_embed_documents.return_value = [
        ("doc-id-1", "vector-id-1"),
        ("doc-id-2", "vector-id-2"),
    ]
    return service


@pytest.fixture
def mock_summarization_service():
    """
    Create a mock summarization service.
    """
    service = AsyncMock()
    service.generate_summary.return_value = "Test summary"
    service.store_summary.return_value = True
    return service


@pytest.mark.asyncio
async def test_crawl_and_store_success(
    settings,
    mock_crawl4ai_client,
    mock_embedding_service,
    mock_summarization_service,
):
    """
    Test successful crawling and storing of documentation.
    """
    # Create the service with mocked dependencies
    service = DocumentationCrawlerService(
        settings=settings,
        crawl4ai_client=mock_crawl4ai_client,
        embedding_service=mock_embedding_service,
        summarization_service=mock_summarization_service,
    )
    
    # Call the method
    result = await service.crawl_and_store(
        url="https://crawl4ai.com/mkdocs/",
        max_pages=10,
        include_patterns=["https://crawl4ai.com/mkdocs/*"],
        exclude_patterns=["*.js", "*.css"],
        generate_summaries=True,
    )
    
    # Verify the result
    assert result["job_id"] == "test-job-id"
    assert result["status"] == "completed"
    assert result["page_count"] == 5
    assert result["embedded_count"] == 2
    assert result["summarized_count"] == 2
    
    # Verify the mocks were called correctly
    mock_crawl4ai_client.start_crawl.assert_called_once_with(
        url="https://crawl4ai.com/mkdocs/",
        max_pages=10,
        include_patterns=["https://crawl4ai.com/mkdocs/*"],
        exclude_patterns=["*.js", "*.css"],
    )
    mock_crawl4ai_client.wait_for_crawl_completion.assert_called_once_with("test-job-id")
    mock_crawl4ai_client.fetch_crawl_results.assert_called_once_with("test-job-id")
    
    # Verify embedding service was called with correct documents
    mock_embedding_service.batch_embed_documents.assert_called_once()
    call_args = mock_embedding_service.batch_embed_documents.call_args[0][0]
    assert len(call_args) == 2
    assert call_args[0]["content"] == "Test content 1"
    assert call_args[1]["content"] == "Test content 2"
    
    # Verify summarization service was called for each document
    assert mock_summarization_service.generate_summary.call_count == 2
    assert mock_summarization_service.store_summary.call_count == 2


@pytest.mark.asyncio
async def test_crawl_and_store_no_summaries(
    settings,
    mock_crawl4ai_client,
    mock_embedding_service,
    mock_summarization_service,
):
    """
    Test crawling and storing without generating summaries.
    """
    # Create the service with mocked dependencies
    service = DocumentationCrawlerService(
        settings=settings,
        crawl4ai_client=mock_crawl4ai_client,
        embedding_service=mock_embedding_service,
        summarization_service=mock_summarization_service,
    )
    
    # Call the method with generate_summaries=False
    result = await service.crawl_and_store(
        url="https://crawl4ai.com/mkdocs/",
        max_pages=10,
        generate_summaries=False,
    )
    
    # Verify the result
    assert result["job_id"] == "test-job-id"
    assert result["status"] == "completed"
    assert result["page_count"] == 5
    assert result["embedded_count"] == 2
    assert result["summarized_count"] == 0
    
    # Verify the summarization service was not called
    mock_summarization_service.generate_summary.assert_not_called()
    mock_summarization_service.store_summary.assert_not_called()


@pytest.mark.asyncio
async def test_crawl_and_store_empty_results(
    settings,
    mock_crawl4ai_client,
    mock_embedding_service,
    mock_summarization_service,
):
    """
    Test handling of empty crawl results.
    """
    # Set up mock to return empty results
    mock_crawl4ai_client.fetch_crawl_results.return_value = []
    
    # Create the service with mocked dependencies
    service = DocumentationCrawlerService(
        settings=settings,
        crawl4ai_client=mock_crawl4ai_client,
        embedding_service=mock_embedding_service,
        summarization_service=mock_summarization_service,
    )
    
    # Call the method
    result = await service.crawl_and_store(url="https://crawl4ai.com/mkdocs/")
    
    # Verify the result
    assert result["job_id"] == "test-job-id"
    assert result["status"] == "completed"
    assert result["page_count"] == 0
    assert result["embedded_count"] == 0
    assert result["summarized_count"] == 0
    
    # Verify embedding and summarization services were not called
    mock_embedding_service.batch_embed_documents.assert_not_called()
    mock_summarization_service.generate_summary.assert_not_called()
    mock_summarization_service.store_summary.assert_not_called()