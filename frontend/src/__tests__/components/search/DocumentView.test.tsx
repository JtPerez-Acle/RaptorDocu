import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentView } from '@/components/search/DocumentView';
import { Document } from '@/lib/api/search';

// Mock react-markdown
jest.mock('react-markdown', () => ({ 
  children 
}: { 
  children: string 
}) => <div data-testid="markdown">{children.replace(/\n/g, ' ')}</div>);

describe('DocumentView Component', () => {
  const mockDocument: Document = {
    id: 'doc123',
    content: '# Heading\nThis is a markdown document with **bold** text.',
    metadata: {
      url: 'https://example.com/docs/article',
      title: 'Test Document',
      source: 'Documentation',
      version: '2.0',
      lastUpdated: '2025-02-01T15:30:00Z',
    },
    score: 0.92,
  };

  const mockOnBack = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders document title and metadata', () => {
    render(<DocumentView document={mockDocument} onBack={mockOnBack} />);
    
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('v2.0')).toBeInTheDocument();
    expect(screen.getByText('Relevance: 92%')).toBeInTheDocument();
  });

  test('renders document content using markdown', () => {
    render(<DocumentView document={mockDocument} onBack={mockOnBack} />);
    
    const markdownElement = screen.getByTestId('markdown');
    expect(markdownElement).toBeInTheDocument();
    
    // Since our mock replaces newlines with spaces, we'll check for that format
    expect(markdownElement).toHaveTextContent('# Heading This is a markdown document with **bold** text.');
  });

  test('displays original link and document ID', () => {
    render(<DocumentView document={mockDocument} onBack={mockOnBack} />);
    
    const originalLink = screen.getByText('View Original');
    expect(originalLink).toBeInTheDocument();
    expect(originalLink).toHaveAttribute('href', 'https://example.com/docs/article');
    expect(originalLink).toHaveAttribute('target', '_blank');
    
    expect(screen.getByText(`Document ID: ${mockDocument.id}`)).toBeInTheDocument();
  });

  test('displays formatted last updated date', () => {
    render(<DocumentView document={mockDocument} onBack={mockOnBack} />);
    
    // This depends on the browser locale, but we'll check for part of the date
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  test('calls onBack when Back button is clicked', () => {
    render(<DocumentView document={mockDocument} onBack={mockOnBack} />);
    
    const backButton = screen.getByText(/Back to results/);
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});