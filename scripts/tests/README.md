# Test Scripts for RAPTOR Documentation Assistant

This directory contains various test scripts for testing the RAPTOR Documentation Assistant system.

## Available Tests

### 1. Full Workflow Test

**File:** `test-full-workflow.py`

This script tests the complete workflow of the RAPTOR system:
- Checking service health
- Adding documents to the vector database
- Performing semantic searches
- Testing backend API integration

**Usage:**
```bash
python3 test-full-workflow.py
```

### 2. Simple Embedding Test

**File:** `test-simple-embed.py`

A minimal test for the document embedding functionality:
- Creates a test document
- Adds it to the vector database
- Performs a search to verify it was added correctly

**Usage:**
```bash
python3 test-simple-embed.py
```

### 3. Simple API Test

**File:** `test-simple.py`

A very simple test for the backend API:
- Makes a basic query to the search endpoint
- Verifies that the response is as expected

**Usage:**
```bash
python3 test-simple.py
```

## Running All Tests

To run all tests sequentially:

```bash
for test in $(ls test-*.py); do
  echo "Running $test..."
  python3 $test
  echo "------------------------------"
done
```

## Notes

- All tests require the Docker services to be running
- Tests assume the default ports for services (Backend: 3000, Crawler: 8080, etc.)
- Tests may use mock data when actual API keys are not available