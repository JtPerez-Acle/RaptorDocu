# RAPTOR Documentation Assistant Scripts

This directory contains utility scripts for working with the RAPTOR Documentation Assistant system.

## Available Scripts

### 1. Workflow Demo

**File:** `workflow-demo.sh`

A complete demonstration of the RAPTOR system workflow:
- Checks if services are running
- Starts Docker containers if needed
- Adds test documents to the vector database
- Performs search queries to demonstrate functionality
- Tests backend API integration

**Usage:**
```bash
./workflow-demo.sh
```

### 2. Raptor CLI

**File:** `backend/scripts/raptor-cli.sh`

Command-line interface for interacting with the RAPTOR API:
- Search for documents
- Start crawl jobs
- Check system health
- View monitoring metrics

**Usage:**
```bash
cd backend/scripts
./raptor-cli.sh help
./raptor-cli.sh search "RAPTOR architecture"
./raptor-cli.sh crawl --url https://example.com/docs
./raptor-cli.sh health
```

## Test Scripts

For testing scripts, see the `tests/` subdirectory:

```bash
cd tests
python3 test-full-workflow.py
```

## Adding New Scripts

When adding new scripts:

1. Make the script executable: `chmod +x your-script.sh`
2. Add documentation in this README
3. Update the main project README if needed
4. Follow shell script best practices (error handling, clear output, etc.)