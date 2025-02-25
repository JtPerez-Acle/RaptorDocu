import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card Component', () => {
  test('renders card with children', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders card with title', () => {
    render(
      <Card title="Card Title">
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(
      <Card className="custom-class">
        <p>Test content</p>
      </Card>
    );
    
    const card = screen.getByText('Test content').parentElement?.parentElement;
    expect(card).toHaveClass('custom-class');
  });

  test('renders card with complex children', () => {
    render(
      <Card title="Complex Card">
        <div data-testid="complex-content">
          <h3>Heading</h3>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <button>Click me</button>
        </div>
      </Card>
    );
    
    expect(screen.getByText('Complex Card')).toBeInTheDocument();
    expect(screen.getByTestId('complex-content')).toBeInTheDocument();
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});