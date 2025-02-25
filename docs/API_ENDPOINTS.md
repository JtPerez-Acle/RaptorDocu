# RAPTOR Documentation Assistant API Endpoints

This document outlines all API endpoints available in the RAPTOR Documentation Assistant system.

## Backend Service (NestJS)

Base URL: `http://localhost:3000/api`

### Search Endpoints

- **GET /search**
  - Description: Search for documents in the vector database
  - Query Parameters:
    - `query` (required): Search query
    - `limit` (optional): Maximum number of results (default: 20)
    - `source` (optional): Filter by document source
    - `version` (optional): Filter by document version
  - Response: List of matching documents with relevance scores

- **GET /search/:id**
  - Description: Get a specific document by ID
  - Parameters:
    - `id` (required): Document unique identifier
  - Response: Complete document with all metadata

### Crawler Endpoints

- **POST /crawler**
  - Description: Start a new crawl job
  - Request Body:
    - `url` (required): URL to crawl
    - `maxPages` (optional): Maximum pages to crawl
    - `includePatterns` (optional): Array of URL patterns to include
    - `excludePatterns` (optional): Array of URL patterns to exclude
  - Response: Crawl job information with job ID

- **GET /crawler/:jobId**
  - Description: Get the status of a crawl job
  - Parameters:
    - `jobId` (required): Crawl job unique identifier
  - Response: Current status of the crawl job

- **POST /crawler/crawl4ai-docs**
  - Description: Start a crawl job specifically for Crawl4AI documentation
  - Request Body:
    - `maxPages` (optional): Maximum pages to crawl
  - Response: Crawl job information with job ID

### Monitoring Endpoints

- **GET /monitoring/metrics**
  - Description: Get API performance metrics
  - Response: Performance metrics for all API endpoints

## Crawler Service (Python FastAPI)

Base URL: `http://localhost:8080/api/v1`

### Health Check

- **GET /health**
  - Description: Check service health
  - Response: Service status and version information

### Crawl Endpoints

- **POST /crawl**
  - Description: Start a new crawl job
  - Request Body:
    - `url` (required): URL to crawl
    - `max_pages` (optional): Maximum pages to crawl
    - `include_patterns` (optional): Array of URL patterns to include
    - `exclude_patterns` (optional): Array of URL patterns to exclude
    - `generate_summaries` (optional): Whether to generate summaries
  - Response: Crawl job information with job ID

- **GET /crawl/{job_id}**
  - Description: Get the status of a crawl job
  - Parameters:
    - `job_id` (required): Crawl job unique identifier
  - Response: Current status of the crawl job

- **POST /crawl/crawl4ai-docs**
  - Description: Start a crawl job specifically for Crawl4AI documentation
  - Request Body:
    - `max_pages` (optional): Maximum pages to crawl
    - `generate_summaries` (optional): Whether to generate summaries
  - Response: Crawl job information with job ID

### Embedding Endpoints

- **POST /embeddings**
  - Description: Embed a document in the vector database
  - Request Body:
    - `content` (required): Document content to embed
    - `metadata` (optional): Document metadata
  - Response: Document ID and vector ID

- **POST /embeddings/search**
  - Description: Search for documents by semantic similarity
  - Request Body:
    - `query` (required): Search query
    - `limit` (optional): Maximum number of results
    - `filters` (optional): Filters to apply to search results
  - Response: List of matching documents with relevance scores

### Summary Endpoints

- **POST /summary**
  - Description: Generate a summary using RAPTOR
  - Request Body:
    - `documents` (required): List of documents to summarize
    - `max_tokens` (optional): Maximum tokens in the summary
    - `hierarchy_levels` (optional): Number of hierarchical levels
  - Response: Generated summary with hierarchical structure

- **GET /summary/{summary_id}**
  - Description: Get a previously generated summary
  - Parameters:
    - `summary_id` (required): Summary unique identifier
  - Response: Retrieved summary with hierarchical structure

## Weaviate Vector Database

Base URL: `http://localhost:8081`

- **GET /v1/.well-known/ready**
  - Description: Check if Weaviate is ready to accept requests
  - Response: Readiness status

## Service Communication

The services communicate with each other as follows:

1. **Frontend → Backend**: The Next.js frontend communicates with the NestJS backend API
2. **Backend → Crawler**: The NestJS backend forwards crawler requests to the Python crawler service
3. **Backend → Weaviate**: The NestJS backend queries Weaviate directly for search operations
4. **Crawler → Weaviate**: The Python crawler sends embeddings directly to Weaviate
5. **Transformer → Weaviate**: The transformer model service provides vector embeddings to Weaviate

## OpenAPI Documentation

- NestJS Swagger UI: `http://localhost:3000/api`
- FastAPI Swagger UI: `http://localhost:8080/docs`