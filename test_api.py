#!/usr/bin/env python3

"""
Direct test of the backend search API.
"""

import requests
import json

def test_search_api():
    url = "http://localhost:3000/api/search"
    params = {"query": "test"}
    
    try:
        # Make the request with full error details
        response = requests.get(url, params=params)
        
        # Print status code and headers
        print(f"Status Code: {response.status_code}")
        print("Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        # Print response body
        print("\nResponse Body:")
        try:
            # Try to parse as JSON
            json_response = response.json()
            print(json.dumps(json_response, indent=2))
        except json.JSONDecodeError:
            # If not valid JSON, print as text
            print(response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {str(e)}")

if __name__ == "__main__":
    test_search_api()