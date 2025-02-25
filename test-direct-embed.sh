#!/bin/bash

# Test direct embedding without Crawl4AI
# This script will add documents directly to Weaviate

echo "=== RAPTOR Documentation Assistant Direct Embedding Test ==="

# Function to handle errors
handle_error() {
  echo "❌ Error: $1"
  echo "Detailed error: $2"
  exit 1
}

# Step 1: Create a test document for embedding
echo "Creating test document..."

cat > test-document.json << EOF
{
  "content": "Weaviate is a vector database designed for scalable AI-powered applications. It stores data objects and vector embeddings for efficient similarity search. This makes it perfect for semantic search, recommendation systems, and other applications requiring finding similar items based on meaning rather than keywords. Weaviate supports multiple vectorization modules and can be used with various ML models for generating embeddings.",
  "metadata": {
    "title": "Weaviate Vector Database",
    "url": "https://weaviate.io/overview",
    "source": "test-data",
    "version": "1.0"
  }
}
EOF

# Step 2: Use the crawler API to embed the document directly
echo "Embedding document using /api/v1/embeddings/ endpoint..."
EMBED_RESPONSE=$(wget -q -O - --header="Content-Type: application/json" --post-file=test-document.json http://localhost:8080/api/v1/embeddings/)

if [[ "$EMBED_RESPONSE" == *"vector_id"* ]]; then
  echo "✅ Document embedded successfully"
  echo "Response: $EMBED_RESPONSE"
  
  # Extract vector_id for reference
  VECTOR_ID=$(echo $EMBED_RESPONSE | grep -o '"vector_id":"[^"]*"' | cut -d'"' -f4)
  echo "Vector ID: $VECTOR_ID"
else
  handle_error "Failed to embed document" "$EMBED_RESPONSE"
fi

# Step 3: Test search functionality
echo "Testing search functionality..."
cat > search-query.json << EOF
{
  "query": "Tell me about Weaviate database",
  "limit": 5
}
EOF

SEARCH_RESPONSE=$(wget -q -O - --header="Content-Type: application/json" --post-file=search-query.json http://localhost:8080/api/v1/embeddings/search)

if [[ "$SEARCH_RESPONSE" == *"results"* ]]; then
  echo "✅ Search successful"
  echo "Response: $SEARCH_RESPONSE"
else
  handle_error "Search failed" "$SEARCH_RESPONSE"
fi

# Step 4: Clean up
echo "Cleaning up..."
rm test-document.json
rm search-query.json

echo "=== Test completed successfully ==="