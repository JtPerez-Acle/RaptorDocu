import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer Component', () => {
  // Mocking the current year for consistent testing
  const realDate = global.Date;
  const mockDate = jest.fn(() => ({ getFullYear: () => 2025 }));
  
  beforeAll(() => {
    global.Date = mockDate as any;
  });
  
  afterAll(() => {
    global.Date = realDate;
  });

  test('renders the copyright text with current year', () => {
    render(<Footer />);
    
    const copyrightText = screen.getByText(/© 2025 RAPTOR Documentation Assistant/);
    expect(copyrightText).toBeInTheDocument();
  });

  test('renders the project description', () => {
    render(<Footer />);
    
    const description = screen.getByText(/Built with RAPTOR/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('Built with RAPTOR (Recursive Abstractive Processing and Thematic Organization for Retrieval) and Crawl4AI');
  });

  test('has appropriate styling', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-slate-800');
    expect(footer).toHaveClass('text-white');
  });
});