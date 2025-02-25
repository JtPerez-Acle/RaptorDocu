"""Pytest configuration for the RAPTOR Documentation Crawler tests."""

import os
import sys
from typing import AsyncGenerator, Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Add the src directory to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.app import app as application
from src.utils.config import Settings, get_settings


def get_settings_override() -> Settings:
    """
    Override settings for testing.
    
    Returns:
        Settings: Test settings
    """
    return Settings(
        environment="test",
        weaviate_url="http://localhost:8080",
        openai_api_key="test-key",
        crawl4ai_api_key="test-key",
    )


@pytest.fixture
def app() -> FastAPI:
    """
    Get FastAPI app for testing.
    
    Returns:
        FastAPI: FastAPI application
    """
    # Override dependencies for testing
    application.dependency_overrides[get_settings] = get_settings_override
    
    return application


@pytest.fixture
def client(app: FastAPI) -> Generator[TestClient, None, None]:
    """
    Get test client for FastAPI app.
    
    Args:
        app: FastAPI application
        
    Returns:
        Generator[TestClient, None, None]: Test client
    """
    with TestClient(app) as test_client:
        yield test_client