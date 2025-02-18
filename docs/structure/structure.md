```markdown
repo-root/
│── backend/                     # TypeScript Backend (NestJS)
│   ├── src/
│   │   ├── modules/             # Individual modules (REST/GraphQL APIs)
│   │   │   ├── auth/            # Authentication module
│   │   │   ├── retrieval/       # Embedding retrieval APIs
│   │   │   ├── summarization/   # Hierarchical summary APIs
│   │   │   ├── crawling/        # Calls Python service for Crawl4AI
│   │   ├── main.ts              # Entry point
│   │   ├── app.module.ts        # Root module
│   ├── test/                    # Unit & integration tests
│   ├── package.json             # Dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── Dockerfile               # Backend Dockerfile
│
│── frontend/                    # TypeScript Frontend (Next.js)
│   ├── src/
│   │   ├── components/          # UI Components
│   │   ├── pages/               # Next.js Routes
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── services/            # API Calls to Backend
│   ├── public/                  # Static assets
│   ├── package.json             # Dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── Dockerfile               # Frontend Dockerfile
│
│── crawler/                     # Python Service for Crawl4AI
│   ├── src/
│   │   ├── crawl4ai/            # API calls to Crawl4AI
│   │   ├── embedding/           # Vectorization and FAISS/Weaviate
│   │   ├── summarization/       # RAPTOR processing logic
│   │   ├── app.py               # Flask/FastAPI entry point
│   ├── tests/                   # Unit tests
│   ├── requirements.txt         # Dependencies
│   ├── pyproject.toml           # Poetry config (if using Poetry)
│   ├── Dockerfile               # Python Crawler Dockerfile
│
│── shared/                      # Shared utilities
│   ├── types/                   # Shared TypeScript types
│   ├── constants/               # API URLs, global constants
│
│── infra/                       # Deployment and Infrastructure
│   ├── docker-compose.yml       # Local development setup
│   ├── terraform/               # Terraform IaC (if using AWS)
│
│── .github/                      # GitHub Actions for CI/CD
│   ├── workflows/
│
│── docs/                        # Documentation (MkDocs)
│
│── README.md                    # Project overview
│── LICENSE                      # Open-source or proprietary license
```