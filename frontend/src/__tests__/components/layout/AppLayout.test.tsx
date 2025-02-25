import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppLayout } from '@/components/layout/AppLayout';

// Mock the Header and Footer components
jest.mock('@/components/layout/Header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock('@/components/layout/Footer', () => ({
  Footer: () => <div data-testid="mock-footer">Footer</div>,
}));

// Mock the QueryClientProvider
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-query-provider">{children}</div>
  ),
}));

describe('AppLayout Component', () => {
  test('renders children between header and footer', () => {
    render(
      <AppLayout>
        <div data-testid="content">Test Content</div>
      </AppLayout>
    );
    
    // Verify that all components are rendered in the correct structure
    expect(screen.getByTestId('mock-query-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    
    // Verify the correct order (header -> content -> footer)
    const container = screen.getByTestId('mock-query-provider').firstChild;
    expect(container?.childNodes[0]).toHaveAttribute('data-testid', 'mock-header');
    expect(container?.childNodes[1]).toContainElement(screen.getByTestId('content'));
    expect(container?.childNodes[2]).toHaveAttribute('data-testid', 'mock-footer');
  });
});