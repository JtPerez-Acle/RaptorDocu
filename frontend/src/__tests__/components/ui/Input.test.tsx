import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  test('renders input with default props', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  test('renders input with label', () => {
    render(<Input label="Email Address" />);
    
    const label = screen.getByText('Email Address');
    expect(label).toBeInTheDocument();
    
    // Should have associated the label with the input
    const input = screen.getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
  });

  test('renders input with error message', () => {
    render(<Input label="Username" error="Username is required" />);
    
    const errorMessage = screen.getByText('Username is required');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
    
    // Input should have error styling
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('renders input with helper text', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    
    const helperText = screen.getByText('Must be at least 8 characters');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-gray-500');
  });

  test('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input value="initial" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'updated' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('passes through additional props', () => {
    render(
      <Input
        type="email"
        placeholder="Enter your email"
        required
        data-testid="email-input"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('data-testid', 'email-input');
  });

  test('error takes precedence over helper text', () => {
    render(
      <Input
        label="Username"
        helperText="Choose a unique username"
        error="This username is already taken"
      />
    );
    
    // Should show error, not helper text
    expect(screen.getByText('This username is already taken')).toBeInTheDocument();
    expect(screen.queryByText('Choose a unique username')).not.toBeInTheDocument();
  });
});