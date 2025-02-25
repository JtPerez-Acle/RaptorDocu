# RAPTOR CLI - Command Line Interface

This CLI tool provides a simple way to interact with the RAPTOR Documentation Assistant through your terminal.

## Requirements

- Bash shell (Linux or macOS)
- curl
- jq (for JSON processing)

## Installation

1. Clone the repository (if you haven't already)
2. Make the script executable:
   ```bash
   chmod +x raptor-cli.sh
   ```

## Usage

```bash
./raptor-cli.sh [command] [options]
```

### Available Commands

- `crawl`: Crawl a URL for documentation
- `status`: Check the status of a crawl job
- `search`: Search for documentation
- `similar`: Find similar documents
- `health`: Check the health of services
- `metrics`: View API performance metrics
- `help`: Show help message

### Command Options

#### Crawl a URL

```bash
./raptor-cli.sh crawl --url=https://docs.example.com [--depth=2]
```

Options:
- `--url`: (Required) The URL to crawl
- `--depth`: (Optional) Crawl depth, default is 2

#### Check Job Status

```bash
./raptor-cli.sh status --job-id=YOUR_JOB_ID
```

Options:
- `--job-id`: (Required) The job ID to check

#### Search Documentation

```bash
./raptor-cli.sh search --query="How to use RAPTOR?" [--limit=5] [--sources=documentation]
```

Options:
- `--query`: (Required) The search query
- `--limit`: (Optional) Number of results to return, default is 5
- `--sources`: (Optional) Documentation source, default is "documentation"

#### Find Similar Documents

```bash
./raptor-cli.sh similar --document-id=DOC_ID [--limit=5]
```

Options:
- `--document-id`: (Required) The document ID to find similar documents for
- `--limit`: (Optional) Number of results to return, default is 5

#### Check Health

```bash
./raptor-cli.sh health
```

#### View Performance Metrics

```bash
./raptor-cli.sh metrics
```

### Global Options

- `--api-url`: (Optional) API URL, default is "http://localhost:3000"

## Examples

Check system health:
```bash
./raptor-cli.sh health
```

Crawl a documentation site:
```bash
./raptor-cli.sh crawl --url=https://docs.example.com --depth=3
```

Search for specific information:
```bash
./raptor-cli.sh search --query="How to implement vector search?"
```

Check the status of a crawl job:
```bash
./raptor-cli.sh status --job-id=abc123def456
```

View performance metrics:
```bash
./raptor-cli.sh metrics
```

## Troubleshooting

- If you get `Permission denied` when running the script, make sure it's executable:
  ```bash
  chmod +x raptor-cli.sh
  ```

- If you see `Error: curl is not installed` or `Error: jq is not installed`, install the required dependencies:
  ```bash
  # For Debian/Ubuntu
  sudo apt-get install curl jq

  # For macOS with Homebrew
  brew install curl jq
  ```

- If you get connection errors, make sure the backend service is running at the expected URL or specify a different URL:
  ```bash
  ./raptor-cli.sh health --api-url=http://your-backend-url:3000
  ```