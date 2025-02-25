#!/bin/bash

# RAPTOR CLI - Command Line Interface for interacting with RAPTOR Documentation Assistant
# This script provides a simple CLI for interacting with the backend service

# Default settings
API_URL="http://localhost:3000"
COMMAND=""
URL=""
QUERY=""
JOB_ID=""
DOCUMENT_ID=""
DEPTH=2
LIMIT=5
SOURCES="documentation"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print help message
function print_help {
  echo -e "${BLUE}RAPTOR Documentation Assistant - Command Line Interface${NC}"
  echo ""
  echo "Usage: ./raptor-cli.sh [command] [options]"
  echo ""
  echo "Commands:"
  echo "  crawl      Crawl a URL for documentation"
  echo "  status     Check status of a crawl job"
  echo "  search     Search for documentation"
  echo "  similar    Find similar documents"
  echo "  health     Check health of services"
  echo "  metrics    View API performance metrics"
  echo "  help       Show this help message"
  echo ""
  echo "Options:"
  echo "  --url=URL              URL to crawl"
  echo "  --query=QUERY          Search query"
  echo "  --job-id=JOB_ID        Job ID for status check"
  echo "  --document-id=DOC_ID   Document ID for similar search"
  echo "  --depth=DEPTH          Crawl depth (default: 2)"
  echo "  --limit=LIMIT          Result limit (default: 5)"
  echo "  --sources=SOURCES      Comma-separated list of sources (default: documentation)"
  echo "  --api-url=API_URL      API URL (default: http://localhost:3000)"
  echo ""
  echo "Examples:"
  echo "  ./raptor-cli.sh crawl --url=https://docs.example.com"
  echo "  ./raptor-cli.sh status --job-id=abc123"
  echo "  ./raptor-cli.sh search --query=\"How to use RAPTOR?\""
  echo "  ./raptor-cli.sh similar --document-id=doc123"
  echo "  ./raptor-cli.sh health"
  echo "  ./raptor-cli.sh metrics"
}

# Parse command-line arguments
if [ $# -eq 0 ]; then
  print_help
  exit 1
fi

COMMAND=$1
shift

# Parse options
for i in "$@"; do
  case $i in
    --url=*)
      URL="${i#*=}"
      ;;
    --query=*)
      QUERY="${i#*=}"
      ;;
    --job-id=*)
      JOB_ID="${i#*=}"
      ;;
    --document-id=*)
      DOCUMENT_ID="${i#*=}"
      ;;
    --depth=*)
      DEPTH="${i#*=}"
      ;;
    --limit=*)
      LIMIT="${i#*=}"
      ;;
    --sources=*)
      SOURCES="${i#*=}"
      ;;
    --api-url=*)
      API_URL="${i#*=}"
      ;;
    *)
      echo -e "${RED}Unknown option: $i${NC}"
      print_help
      exit 1
      ;;
  esac
done

# Function to check if curl is installed
function check_curl {
  if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is not installed. Please install curl to use this script.${NC}"
    exit 1
  fi
}

# Function to check if jq is installed
function check_jq {
  if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed. Please install jq to use this script.${NC}"
    exit 1
  fi
}

# Check dependencies
check_curl
check_jq

# Crawl command
function crawl {
  if [ -z "$URL" ]; then
    echo -e "${RED}Error: URL is required${NC}"
    echo "Usage: ./raptor-cli.sh crawl --url=https://docs.example.com [--depth=2]"
    exit 1
  fi
  
  echo -e "${BLUE}Crawling URL: ${YELLOW}$URL${NC} with depth: ${YELLOW}$DEPTH${NC}"
  RESPONSE=$(curl -s -X POST "$API_URL/api/crawler/crawl" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$URL\", \"depth\": $DEPTH}")
  
  # Check if the response is valid JSON
  if ! echo "$RESPONSE" | jq . &>/dev/null; then
    echo -e "${RED}Error: Invalid response from server${NC}"
    echo "$RESPONSE"
    exit 1
  fi
  
  JOB_ID=$(echo "$RESPONSE" | jq -r '.jobId')
  STATUS=$(echo "$RESPONSE" | jq -r '.status')
  
  echo -e "${GREEN}Job created successfully${NC}"
  echo -e "Job ID: ${YELLOW}$JOB_ID${NC}"
  echo -e "Status: ${YELLOW}$STATUS${NC}"
}

# Status command
function check_status {
  if [ -z "$JOB_ID" ]; then
    echo -e "${RED}Error: Job ID is required${NC}"
    echo "Usage: ./raptor-cli.sh status --job-id=JOB_ID"
    exit 1
  fi
  
  echo -e "${BLUE}Checking status for job: ${YELLOW}$JOB_ID${NC}"
  RESPONSE=$(curl -s -X GET "$API_URL/api/crawler/status/$JOB_ID")
  
  # Check if the response is valid JSON
  if ! echo "$RESPONSE" | jq . &>/dev/null; then
    echo -e "${RED}Error: Invalid response from server${NC}"
    echo "$RESPONSE"
    exit 1
  fi
  
  STATUS=$(echo "$RESPONSE" | jq -r '.status')
  PROGRESS=$(echo "$RESPONSE" | jq -r '.progress // "N/A"')
  
  echo -e "Status: ${YELLOW}$STATUS${NC}"
  echo -e "Progress: ${YELLOW}$PROGRESS${NC}"
  
  # Pretty print additional details if available
  if echo "$RESPONSE" | jq -e '.details' &>/dev/null; then
    echo -e "\n${BLUE}Details:${NC}"
    echo "$RESPONSE" | jq -r '.details'
  fi
}

# Search command
function search {
  if [ -z "$QUERY" ]; then
    echo -e "${RED}Error: Query is required${NC}"
    echo "Usage: ./raptor-cli.sh search --query=\"Your search query\" [--limit=5] [--sources=documentation]"
    exit 1
  fi
  
  echo -e "${BLUE}Searching for: ${YELLOW}$QUERY${NC}"
  RESPONSE=$(curl -s -X POST "$API_URL/api/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$QUERY\", \"limit\": $LIMIT, \"sources\": [\"$SOURCES\"]}")
  
  # Check if the response is valid JSON
  if ! echo "$RESPONSE" | jq . &>/dev/null; then
    echo -e "${RED}Error: Invalid response from server${NC}"
    echo "$RESPONSE"
    exit 1
  fi
  
  TOTAL=$(echo "$RESPONSE" | jq -r '.totalResults')
  
  echo -e "${GREEN}Found ${YELLOW}$TOTAL${GREEN} results:${NC}\n"
  
  # Display results
  echo "$RESPONSE" | jq -r '.results[] | "ID: \(.id)\nTitle: \(.title)\nContent: \(.content | if length > 100 then .[:100] + "..." else . end)\nSource: \(.source)\nRelevance: \(.relevance)\n"'
}

# Similar documents command
function find_similar {
  if [ -z "$DOCUMENT_ID" ]; then
    echo -e "${RED}Error: Document ID is required${NC}"
    echo "Usage: ./raptor-cli.sh similar --document-id=DOC_ID [--limit=5]"
    exit 1
  fi
  
  echo -e "${BLUE}Finding documents similar to: ${YELLOW}$DOCUMENT_ID${NC}"
  RESPONSE=$(curl -s -X POST "$API_URL/api/search/similar" \
    -H "Content-Type: application/json" \
    -d "{\"documentId\": \"$DOCUMENT_ID\", \"limit\": $LIMIT}")
  
  # Check if the response is valid JSON
  if ! echo "$RESPONSE" | jq . &>/dev/null; then
    echo -e "${RED}Error: Invalid response from server${NC}"
    echo "$RESPONSE"
    exit 1
  fi
  
  TOTAL=$(echo "$RESPONSE" | jq -r '.totalResults')
  
  echo -e "${GREEN}Found ${YELLOW}$TOTAL${GREEN} similar documents:${NC}\n"
  
  # Display results
  echo "$RESPONSE" | jq -r '.results[] | "ID: \(.id)\nTitle: \(.title)\nContent: \(.content | if length > 100 then .[:100] + "..." else . end)\nSource: \(.source)\nSimilarity: \(.similarity)\n"'
}

# Health check command
function check_health {
  echo -e "${BLUE}Checking system health...${NC}"
  
  # Check backend health
  BACKEND_RESPONSE=$(curl -s -X GET "$API_URL/api/search/health" || echo "{\"status\": \"error\", \"message\": \"Connection refused\"}")
  
  # Check if the response is valid JSON
  if ! echo "$BACKEND_RESPONSE" | jq . &>/dev/null; then
    echo -e "${RED}Backend: Error - Invalid response${NC}"
    echo "$BACKEND_RESPONSE"
  else
    BACKEND_STATUS=$(echo "$BACKEND_RESPONSE" | jq -r '.status')
    WEAVIATE_STATUS=$(echo "$BACKEND_RESPONSE" | jq -r '.weaviateStatus')
    
    if [ "$BACKEND_STATUS" == "ok" ]; then
      echo -e "${GREEN}Backend: OK${NC}"
    else
      echo -e "${RED}Backend: Error - $BACKEND_STATUS${NC}"
    fi
    
    if [ "$WEAVIATE_STATUS" == "connected" ]; then
      echo -e "${GREEN}Weaviate: Connected${NC}"
    else
      echo -e "${RED}Weaviate: Not connected${NC}"
    fi
  fi
  
  # Attempt to check crawler health
  CRAWLER_RESPONSE=$(curl -s -X GET "$API_URL/api/crawler/health" || echo "{\"status\": \"error\", \"message\": \"Connection refused\"}")
  
  # Check if the response is valid JSON
  if ! echo "$CRAWLER_RESPONSE" | jq . &>/dev/null; then
    echo -e "${RED}Crawler: Error - Invalid response${NC}"
    echo "$CRAWLER_RESPONSE"
  else
    CRAWLER_STATUS=$(echo "$CRAWLER_RESPONSE" | jq -r '.status')
    
    if [ "$CRAWLER_STATUS" == "ok" ]; then
      echo -e "${GREEN}Crawler: OK${NC}"
    else
      echo -e "${RED}Crawler: Error - $CRAWLER_STATUS${NC}"
    fi
  fi
}

# Metrics command
function view_metrics {
  echo -e "${BLUE}Fetching API performance metrics...${NC}"
  
  RESPONSE=$(curl -s -X GET "$API_URL/api/monitoring/metrics")
  
  # Check if the response is valid JSON
  if ! echo "$RESPONSE" | jq . &>/dev/null; then
    echo -e "${RED}Error: Invalid response from server${NC}"
    echo "$RESPONSE"
    exit 1
  fi
  
  echo -e "${GREEN}API Performance Metrics:${NC}\n"
  
  # Display metrics in a formatted table
  echo -e "${YELLOW}Endpoint                  │ Count │ Avg (ms) │ Min (ms) │ Max (ms)${NC}"
  echo -e "───────────────────────────┼───────┼──────────┼──────────┼──────────"
  
  echo "$RESPONSE" | jq -r '.metrics | to_entries[] | "\(.key)|\(.value.count)|\(.value.avgDuration)|\(.value.minDuration)|\(.value.maxDuration)"' | \
  while IFS="|" read -r endpoint count avg min max; do
    printf "%-26s │ %5d │ %8.2f │ %8.2f │ %8.2f\n" "$endpoint" "$count" "$avg" "$min" "$max"
  done
}

# Execute command
case $COMMAND in
  crawl)
    crawl
    ;;
  status)
    check_status
    ;;
  search)
    search
    ;;
  similar)
    find_similar
    ;;
  health)
    check_health
    ;;
  metrics)
    view_metrics
    ;;
  help)
    print_help
    ;;
  *)
    echo -e "${RED}Error: Unknown command: $COMMAND${NC}"
    print_help
    exit 1
    ;;
esac