"""
API router for the RAPTOR Documentation Crawler.
"""

from fastapi import APIRouter

from src.api.v1.routes import crawl, embedding, summary

api_router = APIRouter(prefix="/v1")

# Include routes from different modules
api_router.include_router(crawl.router, prefix="/crawl", tags=["crawl"])
api_router.include_router(embedding.router, prefix="/embeddings", tags=["embeddings"])
api_router.include_router(summary.router, prefix="/summary", tags=["summary"])