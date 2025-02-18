# Changelog

All notable changes to the RAPTOR Documentation Assistant project will be documented in this file.

## [Unreleased] 17-02-2025

### Added
- Initial project structure setup
  - Created base directory structure for all services
  - Set up Python crawler service configuration
  - Set up NestJS backend configuration
  - Set up Next.js frontend configuration

### Configuration
- Python Crawler Service
  - Added `pyproject.toml` with Poetry configuration
  - Configured development dependencies (pytest, black, isort, mypy)
  - Set up test configuration with pytest
  - Added type checking with mypy

- NestJS Backend
  - Added `package.json` with NestJS dependencies
  - Configured TypeScript with `tsconfig.json`
  - Set up Jest for testing
  - Added ESLint and Prettier for code formatting

- Next.js Frontend
  - Added `package.json` with React and Next.js dependencies
  - Configured TypeScript with `tsconfig.json`
  - Set up Tailwind CSS with custom configuration
  - Added PostCSS configuration
  - Configured Jest for React testing

### Documentation
- Added comprehensive README.md with:
  - Project overview
  - Architecture description
  - Technology stack details
  - Setup instructions
  - Testing information

### Development Environment
- Added `.gitignore` for Python, Node.js, and environment files
- Set up initial Git repository
- Added cursor rules for development standards
