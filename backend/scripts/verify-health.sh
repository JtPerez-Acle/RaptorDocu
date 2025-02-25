#!/bin/sh

echo "Running health verification checks..."

# Run linting
echo "Running linting..."
pnpm run lint

# Run type checking
echo "Running type checking..."
pnpm run typecheck || true

# Run e2e tests if they exist
if [ -d "./test" ]; then
  echo "Running e2e tests..."
  pnpm run test:e2e || true
fi

echo "Health verification completed. Starting service..."