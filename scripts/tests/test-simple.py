#!/usr/bin/env python3

"""
Simple test of backend search API.
"""

import requests

# Try a very simple query
response = requests.get('http://localhost:3000/api/search?query=test')
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")