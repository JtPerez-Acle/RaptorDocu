"""
Configuration utilities for the RAPTOR Documentation Crawler.
"""

import logging
import os
from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings.
    
    Attributes:
        environment: Current environment (development, test, production)
        log_level: Logging level
        cors_origins: List of allowed CORS origins
        weaviate_url: URL for Weaviate vector database
        weaviate_api_key: API key for Weaviate (if using cloud instance)
        openai_api_key: API key for OpenAI (used for embeddings)
        crawl4ai_api_key: API key for Crawl4AI service
        crawl4ai_base_url: Base URL for Crawl4AI API
    """

    environment: str = Field(default="development")
    log_level: int = Field(default=logging.INFO)
    cors_origins: List[AnyHttpUrl] = Field(default=["http://localhost:8000"])
    weaviate_url: str = Field(default="http://weaviate:8080")
    weaviate_api_key: Optional[str] = Field(default=None)
    openai_api_key: str = Field(default="")
    crawl4ai_api_key: str = Field(default="")
    crawl4ai_base_url: str = Field(default="https://api.crawl4ai.com/v1")

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=False
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings with caching.
    
    Returns:
        Settings: Application settings
    """
    return Settings()