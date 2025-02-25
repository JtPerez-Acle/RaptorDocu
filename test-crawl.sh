#!/bin/bash

# Start a crawl of the Crawl4AI docs
echo "Starting crawl of Crawl4AI docs..."
CRAWL_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/crawl/crawl4ai-docs -H "Content-Type: application/json" -d '{"max_pages": 10, "generate_summaries": true}')
echo "Crawl initiated with response:"
echo $CRAWL_RESPONSE

# Extract job_id from the response (assuming it's a JSON response)
JOB_ID=$(echo $CRAWL_RESPONSE | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)
echo "Job ID: $JOB_ID"

# Check status periodically
echo "Checking status every 5 seconds..."
STATUS="started"
while [ "$STATUS" == "started" ] || [ "$STATUS" == "processing" ]; do
    sleep 5
    STATUS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/v1/crawl/$JOB_ID")
    STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo "Current status: $STATUS"
done

echo "Crawl completed with status: $STATUS"

# Once complete, search for something in the embedded documents
echo "Searching for 'crawler' in the embedded documents..."
SEARCH_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/embeddings/search -H "Content-Type: application/json" -d '{"query": "What is Crawl4AI?", "limit": 3}')
echo "Search results:"
echo $SEARCH_RESPONSE