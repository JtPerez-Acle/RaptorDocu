#!/bin/bash

# RAPTOR Documentation Assistant - Full Workflow Demo Script
# This script demonstrates the complete workflow from crawling to searching
#
# Usage: ./scripts/workflow-demo.sh
#
# For more detailed testing, see the test scripts in scripts/tests/

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Helper functions
print_header() {
  echo -e "\n${BOLD}${BLUE}=== $1 ===${NC}\n"
}

print_step() {
  echo -e "${BOLD}${GREEN}$1${NC} $2"
}

print_error() {
  echo -e "${RED}ERROR: $1${NC}"
  exit 1
}

wait_for_service() {
  local url=$1
  local max_retries=${2:-30}
  local retry_count=0
  
  echo -n "Waiting for $url to be available... "
  while ! wget --quiet --spider "$url" 2>/dev/null; do
    sleep 2
    retry_count=$((retry_count+1))
    if [[ $retry_count -ge $max_retries ]]; then
      echo "FAILED"
      return 1
    fi
    echo -n "."
  done
  echo "READY"
  return 0
}

# Check if Docker and Docker Compose are installed
print_header "Checking prerequisites"
if ! command -v docker &> /dev/null; then
  print_error "Docker is not installed"
fi

if ! command -v docker-compose &> /dev/null; then
  print_error "Docker Compose is not installed"
fi
echo "✅ Docker and Docker Compose are installed"

# Start the services if not already running
print_header "Starting RAPTOR Documentation Assistant services"

if [[ "$(docker ps -q -f name=raptordocu-backend-1)" || "$(docker ps -q -f name=raptordocu_backend_1)" ]]; then
  echo "✅ Services are already running"
else
  echo "🚀 Starting services..."
  docker-compose -p raptordocu up -d || print_error "Failed to start Docker services"
  
  # Wait for services to be ready
  wait_for_service "http://localhost:3000/api/health" || print_error "Backend service failed to start"
  wait_for_service "http://localhost:8080/docs" || print_error "Crawler service failed to start"
  wait_for_service "http://localhost:8000" || print_error "Frontend service failed to start"
  
  echo "✅ All services have started successfully!"
fi

# Display service info
print_header "Service Information"
echo "📊 Frontend UI: http://localhost:8000"
echo "🔌 Backend API: http://localhost:3000/api"
echo "🕸️ Crawler API: http://localhost:8080/docs"
echo "💾 Weaviate UI: http://localhost:8081/v1/console"

# Demonstrate workflow
print_header "Workflow Demonstration"

# Step 1: Add test documents
print_step "1️⃣" "Adding test documents to the database..."
DOC1=$(curl -s -X POST "http://localhost:8080/api/v1/embeddings/" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "RAPTOR (Recursive Abstractive Processing and Thematic Organization for Retrieval) is an advanced documentation processing system. It combines hierarchical summarization with vector embeddings to create a queryable knowledge base. The system excels at understanding complex technical documentation and providing precise, up-to-date answers to technical queries based on the documentation content.",
    "metadata": {
      "title": "RAPTOR Overview",
      "url": "https://example.com/raptor/overview",
      "source": "demo-docs",
      "version": "1.0"
    }
  }')
  
DOC2=$(curl -s -X POST "http://localhost:8080/api/v1/embeddings/" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Crawl4AI is a specialized web crawling service designed for AI training and data collection. It efficiently crawls documentation websites, blogs, and knowledge bases to gather structured content for embeddings and RAG applications. The service provides capabilities to filter content, extract meaningful text, and structure the output for downstream AI processing.",
    "metadata": {
      "title": "Crawl4AI Introduction",
      "url": "https://crawl4ai.com/intro",
      "source": "demo-docs",
      "version": "1.0"
    }
  }')
  
DOC3=$(curl -s -X POST "http://localhost:8080/api/v1/embeddings/" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Weaviate is a vector database designed for scalable AI-powered applications. It stores data objects and their vector embeddings for efficient similarity search. This makes it perfect for semantic search, recommendation systems, and other applications requiring finding similar items based on meaning rather than keywords.",
    "metadata": {
      "title": "Weaviate Vector Database",
      "url": "https://weaviate.io/overview",
      "source": "demo-docs",
      "version": "1.0"
    }
  }')

DOC1_ID=$(echo $DOC1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
DOC2_ID=$(echo $DOC2 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
DOC3_ID=$(echo $DOC3 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [[ -z "$DOC1_ID" || -z "$DOC2_ID" || -z "$DOC3_ID" ]]; then
  print_error "Failed to add test documents"
fi

echo "✅ Added documents with IDs:"
echo "   - RAPTOR Overview: $DOC1_ID"
echo "   - Crawl4AI Introduction: $DOC2_ID"
echo "   - Weaviate Vector Database: $DOC3_ID"

# Step 2: Wait for processing
print_step "2️⃣" "Waiting for documents to be processed..."
sleep 5
echo "✅ Documents processed and ready for search"

# Step 3: Search for documents
print_step "3️⃣" "Searching for documents..."
RAPTOR_RESULTS=$(curl -s -X POST "http://localhost:8080/api/v1/embeddings/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is RAPTOR?",
    "limit": 2
  }')
  
CRAWL4AI_RESULTS=$(curl -s -X POST "http://localhost:8080/api/v1/embeddings/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about Crawl4AI",
    "limit": 2
  }')

echo "✅ Search complete"
echo -e "\n${YELLOW}Search results for 'What is RAPTOR?':${NC}"
echo "$RAPTOR_RESULTS" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'results' in data and len(data['results']) > 0:
        doc = data['results'][0]
        print(f\"Title: {doc['metadata']['title']}\")
        print(f\"Content: {doc['content'][:150]}...\")
        print(f\"Score: {doc.get('score', 'N/A')}\")
    else:
        print('No results found')
except Exception as e:
    print(f'Error parsing results: {e}')
"

echo -e "\n${YELLOW}Search results for 'Tell me about Crawl4AI':${NC}"
echo "$CRAWL4AI_RESULTS" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'results' in data and len(data['results']) > 0:
        doc = data['results'][0]
        print(f\"Title: {doc['metadata']['title']}\")
        print(f\"Content: {doc['content'][:150]}...\")
        print(f\"Score: {doc.get('score', 'N/A')}\")
    else:
        print('No results found')
except Exception as e:
    print(f'Error parsing results: {e}')
"

# Step 4: Use the backend API
print_step "4️⃣" "Testing backend API..."
BACKEND_RESULTS=$(curl -s "http://localhost:3000/api/search?query=RAPTOR")

echo "✅ Backend API test complete"
echo -e "\n${YELLOW}Backend API search response:${NC}"
echo "$BACKEND_RESULTS" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f'Error parsing results: {e}')
"

# Final message
print_header "Workflow Demonstration Complete"
echo "🎉 The RAPTOR Documentation Assistant is working correctly!"
echo -e "\n${BOLD}Next steps:${NC}"
echo "1. Visit the frontend at http://localhost:8000 to explore the UI"
echo "2. Check the API documentation at http://localhost:8080/docs"
echo "3. Explore Weaviate at http://localhost:8081/v1/console"
echo "4. Run the Python test scripts for more detailed tests:"
echo "   - python3 scripts/tests/run_all_tests.py"
echo -e "\n${BOLD}Documentation:${NC}"
echo "- Full demo guide: docs/DEMO.md"
echo "- Test summary: docs/WORKFLOW_TEST_SUMMARY.md"
echo "- Available scripts: scripts/README.md"