"""
RAPTOR Documentation Crawler FastAPI application.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.router import api_router
from src.utils.config import get_settings

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle application startup and shutdown events.
    
    Args:
        app: FastAPI application instance
    """
    logger.info("Starting up RAPTOR Documentation Crawler service")
    # Add startup code here (database connections, etc.)
    yield
    # Add shutdown code here (close connections, etc.)
    logger.info("Shutting down RAPTOR Documentation Crawler service")


app = FastAPI(
    title="RAPTOR Documentation Crawler",
    description="API for crawling documentation with RAPTOR processing",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Status information
    """
    return {
        "status": "ok",
        "version": "0.1.0",
        "environment": settings.environment,
    }