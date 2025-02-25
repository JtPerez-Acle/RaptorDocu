# Changelog

All notable changes to the RAPTOR Documentation Assistant project will be documented in this file.

## [Unreleased] 25-02-2025

### Added

- Service Integration and Project Organization
  - Reorganized project structure for better maintainability
  - Created dedicated scripts directory with well-documented utilities
  - Added comprehensive test runner for executing all tests
  - Moved test scripts to scripts/tests directory with proper documentation
  - Added README files to explain directory contents and usage
  - Created workflow-demo.sh for easy demonstration of the complete system
  - Fixed inter-service connection settings for proper service communication
  - Configured Docker environment variables for local development setup
  - Updated volume mounts to ensure script access across containers
  - Added proper error handling when services are unavailable
  - Ensured frontend properly connects to the backend API
  
- Full System Integration and Workflow Testing
  - Successfully tested end-to-end document processing workflow
  - Verified document embedding and vector search functionality
  - Tested communication between all services
  - Created test scripts for validating the complete system
  - Added WORKFLOW_TEST_SUMMARY.md with detailed test results
  - Implemented graceful error handling for Weaviate connection issues
  - Added fallback mechanisms for service dependencies
  
- Enhanced Docker Configuration
  - Fixed Docker build issues in all services
  - Added testing during container build for quality assurance
  - Implemented health checks for all services in docker-compose
  - Added verification scripts to ensure service health before startup
  - Configured failover options with both wget and curl for reliability
  - Fixed transformer service health check for reliable monitoring

- API Enhancements and Bugfixes
  - Improved backend API endpoint structure with consistent prefixes
  - Fixed health endpoint accessibility outside of API prefix
  - Added robust error handling in all controllers
  - Enhanced response formatting to ensure cross-client compatibility
  - Implemented content-type detection and request method flexibility
  - Extended search controllers to handle both GET and POST requests
  - Fixed missing endpoints required by e2e tests

- Crawler Embedding Improvements
  - Fixed critical bug in Weaviate search implementation causing NoneType errors
  - Added robust error handling in all vector search operations
  - Implemented fallback to mock data when vector search fails
  - Enhanced data validation to prevent response structure errors
  - Improved type checking in embedding service
  - Added proper response context handling between microservices
- API Documentation
  - Created comprehensive API_ENDPOINTS.md reference
  - Documented all backend, crawler, and database endpoints
  - Mapped service communication paths
  - Added OpenAPI documentation references
- Terminal Interface for Human-Software Interaction
  - Added `raptor-cli.sh` bash script for command-line interaction with the API
  - Implemented commands for crawling, search, status checking, and health monitoring
  - Added colorized output and formatted result display
  - Support for configuration via command-line arguments
- Performance Monitoring System
  - Added MonitoringModule with API request tracking
  - Implemented PerformanceInterceptor for timing API calls
  - Created endpoint for viewing performance metrics
  - Added response time statistics by endpoint
- End-to-End Testing
  - Added e2e tests for crawler endpoints
  - Added e2e tests for search functionality
  - Configured jest-e2e.json for E2E test setup
  - Implemented test fixtures and mocks

## [Unreleased] 24-02-2025

### Added
- CLAUDE.md with development guidelines
  - Build, test, and lint commands for all services
  - Coding standards and conventions
  - Project maintenance instructions
- GitHub Actions workflows for CI/CD
  - CI pipeline for linting and testing all services
  - Build pipeline for creating deployable artifacts
  - Configured for Python, NestJS, and Next.js
- Docker development environment
  - Dockerfiles for all services with dev configuration
  - docker-compose setup with Weaviate integration
  - Hot-reloading for all services
- Python Crawler Service core setup
  - FastAPI application structure with API routers
  - Health check endpoint implementation
  - Configuration management with Pydantic 
  - Logging and error handling configuration
  - Crawl4AI client for external API interaction
  - API route structure for crawl, embeddings, and summaries
- RAPTOR Implementation
  - Core processing logic for hierarchical summarization
  - OpenAI integration for semantic analysis
  - Topic extraction and organization
  - Persistent storage for summaries
- Weaviate Integration
  - Vector database client with schema creation
  - Embedding generation and storage
  - Semantic search capabilities
  - Batch processing for multiple documents
- Testing Framework
  - Pytest configuration for unit tests
  - Test fixtures and configuration
  - Health check test implementation
- Crawl4AI Documentation Integration
  - Enhanced Crawl4AI client with retry logic and job waiting
  - Added DocumentationCrawlerService for processing and storing documentation
  - Created API endpoint for crawling Crawl4AI documentation
  - Implemented parallel processing for document embedding and summarization
  - Added comprehensive test suite for crawler service
- NestJS Backend Core Setup
  - Initial application structure with app module
  - Configuration management with ConfigModule
  - Swagger API documentation setup
  - Input validation using class-validator
- Weaviate Integration in NestJS Backend
  - WeaviateService for vector database interactions
  - Document models and DTOs for search operations
  - Search controller with query filtering
  - Comprehensive test suite using Jest
  - Environment configuration with .env file
- Crawler API in NestJS Backend
  - CrawlerService for communication with Python crawler
  - DTOs for crawl requests and responses
  - REST endpoints for crawling operations
  - Dedicated endpoint for Crawl4AI documentation
  - Comprehensive test suite using Jest
- Caching Implementation
  - Added caching layer for Weaviate queries
  - Configurable TTL for cache entries
  - Skip caching for filtered queries
  - Added WeaviateCacheService with test coverage

## [0.1.0] 17-02-2025

### Added
- Initial project structure setup
  - Created base directory structure for all services
  - Set up Python crawler service configuration
  - Set up NestJS backend configuration
  - Set up Next.js frontend configuration

### Configuration
- Python Crawler Service
  - Added `pyproject.toml` with Poetry configuration
  - Configured development dependencies (pytest, black, isort, mypy)
  - Set up test configuration with pytest
  - Added type checking with mypy

- NestJS Backend
  - Added `package.json` with NestJS dependencies
  - Configured TypeScript with `tsconfig.json`
  - Set up Jest for testing
  - Added ESLint and Prettier for code formatting

- Next.js Frontend
  - Added `package.json` with React and Next.js dependencies
  - Configured TypeScript with `tsconfig.json`
  - Set up Tailwind CSS with custom configuration
  - Added PostCSS configuration
  - Configured Jest for React testing

### Documentation
- Added comprehensive README.md with:
  - Project overview
  - Architecture description
  - Technology stack details
  - Setup instructions
  - Testing information

### Development Environment
- Added `.gitignore` for Python, Node.js, and environment files
- Set up initial Git repository
- Added cursor rules for development standards
