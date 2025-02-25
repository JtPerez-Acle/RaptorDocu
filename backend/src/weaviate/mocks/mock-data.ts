import { Document, SearchResult } from '../models/document.model';

/**
 * Mock documents for development and testing
 */
export const mockDocuments: Document[] = [
  {
    id: 'mock-1',
    content: 'RAPTOR Documentation Assistant is a cloud-based documentation crawler that uses semantic search and hierarchical summarization to provide relevant information from technical documentation.',
    metadata: {
      title: 'RAPTOR Overview',
      url: 'https://raptor-docu.com/overview',
      source: 'RAPTOR Documentation',
      version: '1.0',
    },
    score: 0.95,
  },
  {
    id: 'mock-2',
    content: 'The RAPTOR system consists of three main microservices: a Python crawler using FastAPI, a NestJS backend API, and a Next.js frontend. It uses Weaviate as a vector database for semantic search.',
    metadata: {
      title: 'Architecture Overview',
      url: 'https://raptor-docu.com/architecture',
      source: 'RAPTOR Documentation',
      version: '1.0',
    },
    score: 0.93,
  },
  {
    id: 'mock-3',
    content: 'RAPTOR uses semantic search with transformer models to find the most relevant documentation based on your queries, providing context-aware answers to technical questions.',
    metadata: {
      title: 'Semantic Search',
      url: 'https://raptor-docu.com/search',
      source: 'RAPTOR Documentation',
      version: '1.0',
    },
    score: 0.91,
  },
  {
    id: 'mock-4',
    content: 'The crawler service in RAPTOR integrates with Crawl4AI to efficiently fetch documentation from various sources, process it, and store it in the vector database.',
    metadata: {
      title: 'Crawler Service',
      url: 'https://raptor-docu.com/crawler',
      source: 'RAPTOR Documentation',
      version: '1.0',
    },
    score: 0.89,
  },
  {
    id: 'mock-5',
    content: 'RAPTOR uses hierarchical summarization to create multi-level abstractions of documentation, allowing for both high-level overviews and detailed explanations.',
    metadata: {
      title: 'Hierarchical Summarization',
      url: 'https://raptor-docu.com/summarization',
      source: 'RAPTOR Documentation',
      version: '1.0',
    },
    score: 0.87,
  },
];

/**
 * Get mock search results based on a query
 * @param query The search query
 * @param limit Maximum number of results to return
 * @returns Mock search results
 */
export function getMockSearchResults(query: string, limit: number = 5): SearchResult {
  const filteredDocs = mockDocuments
    .filter(doc => 
      doc.content.toLowerCase().includes(query.toLowerCase()) || 
      doc.metadata.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, limit);
  
  return {
    documents: filteredDocs,
    total: filteredDocs.length,
  };
}

/**
 * Get a mock document by ID
 * @param id The document ID
 * @returns The mock document, or null if not found
 */
export function getMockDocumentById(id: string): Document | null {
  return mockDocuments.find(doc => doc.id === id) || null;
}