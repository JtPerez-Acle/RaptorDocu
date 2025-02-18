# 🚀 RAPTOR Documentation Assistant

A cloud-based documentation crawler using RAPTOR (Recursive Abstractive Processing and Thematic Organization for Retrieval) and Crawl4AI.

## 📖 Overview

This system transforms large-scale documentation into queryable embeddings for efficient and context-aware programming solutions. It combines advanced crawling capabilities with hierarchical summarization to provide precise, up-to-date answers to technical queries.

## 🏗 Architecture

The system consists of three main services:

1. **Crawler Service (Python)**: Documentation fetching and structuring using Crawl4AI
2. **Processing Engine (Python)**: RAPTOR-based summarization and embedding generation
3. **Query Service (TypeScript)**: API layer for retrieving and serving relevant information

## 🛠 Technology Stack

- **Backend**: NestJS (TypeScript)
- **Frontend**: Next.js (TypeScript)
- **Crawler**: Python (Crawl4AI)
- **Processing**: Python (RAPTOR)
- **Vector Store**: Weaviate
- **Infrastructure**: Docker, Kubernetes

## 🚦 Getting Started

### Prerequisites

- Node.js >= 20
- Python >= 3.12
- Docker
- pnpm (for Node.js package management)
- Poetry (for Python package management)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd raptor-docu
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env  # Configure your environment variables
   pnpm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   pnpm install
   cp .env.example .env  # Configure your environment variables
   pnpm run dev
   ```

4. **Python Services Setup**
   ```bash
   cd crawler
   poetry install
   cp .env.example .env  # Configure your environment variables
   poetry run python -m src.app
   ```

5. **Docker Setup (Optional)**
   ```bash
   docker-compose up -d
   ```

## 🧪 Testing

Each component includes its own test suite:

- **Backend**: `cd backend && pnpm test`
- **Frontend**: `cd frontend && pnpm test`
- **Python Services**: `cd crawler && poetry run pytest`

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- Architecture Overview
- API Documentation
- Development Guidelines
- Deployment Instructions

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Jose Tomas Perez-Acle - Project Lead 