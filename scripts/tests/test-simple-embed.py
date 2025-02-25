#!/usr/bin/env python3

"""
Simple Python script to test direct embedding via the crawler API.
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8080"

# Test document data
test_document = {
    "content": "RAPTOR (Recursive Abstractive Processing and Thematic Organization for Retrieval) is an advanced documentation processing system that transforms large-scale documentation into queryable embeddings for efficient retrieval.",
    "metadata": {
        "title": "RAPTOR Overview",
        "url": "https://example.com/raptor",
        "source": "test-data",
        "version": "1.0"
    }
}

def main():
    print("=== Testing RAPTOR Documentation Assistant ===")
    
    # Step 1: Add document
    print("\nStep 1: Adding test document...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/embeddings/",
            json=test_document
        )
        response.raise_for_status()
        result = response.json()
        print(f"✅ Document added successfully with ID: {result.get('id')}")
        vector_id = result.get('vector_id')
        print(f"Vector ID: {vector_id}")
    except Exception as e:
        print(f"❌ Failed to add document: {str(e)}")
        sys.exit(1)
    
    # Give Weaviate time to process
    print("\nWaiting for 3 seconds...")
    time.sleep(3)
    
    # Step 2: Search for document
    print("\nStep 2: Searching for document...")
    try:
        search_query = {
            "query": "What is RAPTOR?",
            "limit": 5
        }
        response = requests.post(
            f"{BASE_URL}/api/v1/embeddings/search",
            json=search_query
        )
        response.raise_for_status()
        result = response.json()
        print(f"✅ Search completed successfully")
        
        # Display results
        if result.get('results'):
            print(f"\nFound {len(result['results'])} results:")
            for idx, doc in enumerate(result['results']):
                print(f"\nResult {idx+1}:")
                print(f"  Title: {doc['metadata']['title']}")
                print(f"  Score: {doc['score']}")
                print(f"  Content: {doc['content'][:100]}...")
        else:
            print("No results found.")
    except Exception as e:
        print(f"❌ Failed to search: {str(e)}")
    
    print("\n=== Test completed ===")

if __name__ == "__main__":
    main()