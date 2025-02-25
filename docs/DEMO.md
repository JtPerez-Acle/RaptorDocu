# RAPTOR Documentation Assistant Demo Guide

This guide provides instructions for running a complete demonstration of the RAPTOR Documentation Assistant system.

## Prerequisites

- Docker and Docker Compose installed
- At least 8GB of RAM available for Docker
- Internet connection (for initial container pulls)

## Quick Start

The easiest way to run the demonstration is using the provided workflow script:

```bash
./scripts/workflow-demo.sh
```

This script will:
1. Check if the necessary services are running
2. Start the Docker containers if needed
3. Add test documents to the vector database
4. Perform search queries to demonstrate functionality
5. Test the backend API integration
6. Provide next steps for further exploration

## Manual Demo Steps

If you prefer to run the demo manually, follow these steps:

### 1. Start the Docker Services

```bash
docker-compose up -d
```

Wait for all services to be healthy:
- Frontend UI: http://localhost:8000
- Backend API: http://localhost:3000/api
- Crawler API: http://localhost:8080/docs
- Weaviate: http://localhost:8081/v1/console

### 2. Add Test Documents

Use the crawler API to add documents to the vector database:

```bash
curl -X POST "http://localhost:8080/api/v1/embeddings/" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "RAPTOR is an advanced documentation processing system...",
    "metadata": {
      "title": "RAPTOR Overview",
      "url": "https://example.com/raptor/overview",
      "source": "demo-docs",
      "version": "1.0"
    }
  }'
```

### 3. Search for Documents

Query the vector database using the crawler API:

```bash
curl -X POST "http://localhost:8080/api/v1/embeddings/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is RAPTOR?",
    "limit": 2
  }'
```

### 4. Test the Backend API

Query the backend API to verify the full integration:

```bash
curl "http://localhost:3000/api/search?query=RAPTOR"
```

### 5. Use the Frontend UI

Visit http://localhost:8000 in your browser to use the web interface for searching documentation.

## Running Tests

For more comprehensive testing, run the provided test scripts:

```bash
# Run a specific test
python3 scripts/tests/test-full-workflow.py

# Or run all tests in sequence
python3 scripts/tests/run_all_tests.py
```

## Troubleshooting

If you encounter issues:

1. Check all services are running:
   ```bash
   docker-compose ps
   ```

2. Check service logs:
   ```bash
   docker-compose logs backend
   docker-compose logs crawler
   docker-compose logs weaviate
   ```

3. Ensure all environment variables are correctly set in the docker-compose.yml file

4. If the transformer service is unhealthy, it may need more startup time (up to 2 minutes)

## Next Steps

After running the demo, consider:

1. Crawling actual documentation with the crawler API
2. Implementing custom frontend UI components
3. Integrating with your own documentation sources
4. Customizing the vector search parameters for better results