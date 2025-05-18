import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from './auth-form';

describe('AuthForm', () => {
  it('renders the form correctly', () => {
    // Mock the login function
    const mockLogin = vi.fn();
    
    // Render the component
    render(<AuthForm onLogin={mockLogin} />);
    
    // Check if important elements are rendered
    expect(screen.getByText('Login to CutTrack MRP')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  it('shows error message when provided', () => {
    // Mock the login function
    const mockLogin = vi.fn();
    const errorMessage = 'Invalid credentials';
    
    // Render the component with error
    render(<AuthForm onLogin={mockLogin} error={errorMessage} />);
    
    // Check if error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  
  it('shows loading state when isLoading is true', () => {
    // Mock the login function
    const mockLogin = vi.fn();
    
    // Render the component with loading state
    render(<AuthForm onLogin={mockLogin} isLoading={true} />);
    
    // Check if button text changes and button is disabled
    const loginButton = screen.getByRole('button', { name: /logging in/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });
  
  it('submits the form with email and password', async () => {
    // Mock the login function
    const mockLogin = vi.fn();
    
    // Render the component
    render(<AuthForm onLogin={mockLogin} />);
    
    // Fill out the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    
    // Submit the form
    fireEvent.click(loginButton);
    
    // Check if login function was called with correct args
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'admin123');
    });
  });
  
  it('requires email and password fields', () => {
    // Mock the login function
    const mockLogin = vi.fn();
    
    // Render the component
    render(<AuthForm onLogin={mockLogin} />);
    
    // Get the email and password inputs
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Check if they have required attribute
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });
});
