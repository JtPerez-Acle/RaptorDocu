import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResults } from '@/components/search/SearchResults';
import { Document } from '@/lib/api/search';

describe('SearchResults Component', () => {
  const mockDocuments: Document[] = [
    {
      id: 'doc1',
      content: 'This is the content of the first document',
      metadata: {
        url: 'https://example.com/doc1',
        title: 'Document One',
        source: 'Example Docs',
        version: '1.0',
        lastUpdated: '2025-01-15T12:00:00Z',
      },
      score: 0.95,
    },
    {
      id: 'doc2',
      content: 'This is the content of the second document with more explanation about the topic',
      metadata: {
        url: 'https://example.com/doc2',
        title: 'Document Two',
        source: 'Example Docs',
      },
      score: 0.85,
    },
  ];

  const mockSelectDocument = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state when no results', () => {
    render(
      <SearchResults
        results={[]}
        total={0}
        onSelectDocument={mockSelectDocument}
      />
    );
    
    expect(screen.getByText('No results found. Try a different search query.')).toBeInTheDocument();
  });

  test('renders search results count', () => {
    render(
      <SearchResults
        results={mockDocuments}
        total={2}
        onSelectDocument={mockSelectDocument}
      />
    );
    
    expect(screen.getByText('Found 2 results')).toBeInTheDocument();
  });

  test('renders search results with correct information', () => {
    render(
      <SearchResults
        results={mockDocuments}
        total={2}
        onSelectDocument={mockSelectDocument}
      />
    );
    
    // Verify document titles are shown
    expect(screen.getByText('Document One')).toBeInTheDocument();
    expect(screen.getByText('Document Two')).toBeInTheDocument();
    
    // Verify scores are shown
    expect(screen.getByText('Score: 95%')).toBeInTheDocument();
    expect(screen.getByText('Score: 85%')).toBeInTheDocument();
    
    // Verify content snippets are shown
    expect(screen.getByText(/This is the content of the first document/)).toBeInTheDocument();
    
    // Verify metadata is shown
    expect(screen.getAllByText('Example Docs').length).toBe(2);
    expect(screen.getByText('1.0')).toBeInTheDocument();
  });

  test('truncates long content in search results', () => {
    const longContent = 'A'.repeat(300);
    const mockDocsWithLongContent = [
      {
        ...mockDocuments[0],
        content: longContent,
      },
    ];
    
    render(
      <SearchResults
        results={mockDocsWithLongContent}
        total={1}
        onSelectDocument={mockSelectDocument}
      />
    );
    
    // Should truncate to 200 chars with ellipsis
    expect(screen.getByText(/^A{200}\.\.\.$/)).toBeInTheDocument();
  });

  test('calls onSelectDocument when View Details button is clicked', () => {
    render(
      <SearchResults
        results={mockDocuments}
        total={2}
        onSelectDocument={mockSelectDocument}
      />
    );
    
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);
    
    expect(mockSelectDocument).toHaveBeenCalledWith(mockDocuments[0]);
  });
});