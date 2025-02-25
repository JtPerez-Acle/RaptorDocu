import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, target, rel }: { children: React.ReactNode; href: string; target?: string; rel?: string }) => (
    <a href={href} target={target} rel={rel}>{children}</a>
  );
});

describe('Header Component', () => {
  test('renders the app name', () => {
    render(<Header />);
    
    expect(screen.getByText('RAPTOR Documentation Assistant')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<Header />);
    
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    
    const monitoringLink = screen.getByText('Monitoring');
    expect(monitoringLink).toBeInTheDocument();
    expect(monitoringLink.closest('a')).toHaveAttribute('href', '/monitoring');
    
    const githubLink = screen.getByText('GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/username/raptor-docu');
    expect(githubLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(githubLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('has appropriate styling', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-slate-800');
    expect(header).toHaveClass('text-white');
  });

  test('renders the logo icon', () => {
    render(<Header />);
    
    // Find SVG element
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-blue-400');
  });
});