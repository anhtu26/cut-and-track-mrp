import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/providers/auth-provider';
import Login from '@/pages/Login';
import AuthService from '@/lib/services/auth';
import { UserRole, UserWithRole } from '@/hooks/use-auth-local';

// Mock the auth service
vi.mock('@/lib/services/auth', () => ({
  default: {
    login: vi.fn(),
    getSession: vi.fn(),
    getCurrentUser: vi.fn()
  }
}));

// Mock React Router's Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as object),
    Navigate: vi.fn(({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />)
  };
});

describe('Login E2E Flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();

    // Default setup: no session
    vi.mocked(AuthService.getSession).mockResolvedValue({
      data: { session: null }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render login page correctly', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify login page elements are displayed
    expect(screen.getByText('CutTrack MRP')).toBeInTheDocument();
    expect(screen.getByText('Manufacturing Resource Planning System')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should login successfully and redirect to dashboard', async () => {
    // Mock successful login
    const mockUser: UserWithRole = { id: '123', email: 'admin@example.com', role: 'Administrator' as UserRole };
    const mockSession = { access_token: 'mock-token', user: mockUser };
    
    vi.mocked(AuthService.login).mockResolvedValue({
      user: mockUser,
      session: mockSession
    });
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Fill login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    
    // Submit form
    fireEvent.click(loginButton);
    
    // Wait for login to complete and redirect
    await waitFor(() => {
      // Check that login API was called with correct credentials
      expect(AuthService.login).toHaveBeenCalledWith('admin@example.com', 'admin123');
      
      // In this scenario, a dialog should appear first showing Administrator access confirmation
      expect(screen.getByText('Administrator Access')).toBeInTheDocument();
      expect(screen.getByText('You have successfully logged in as an Administrator.')).toBeInTheDocument();
      
      // Click "Continue to Dashboard" button
      const continueButton = screen.getByText('Continue to Dashboard');
      fireEvent.click(continueButton);
    });
    
    // After closing dialog, verify redirect happens
    await waitFor(() => {
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/dashboard');
    });
  });
  
  it('should display error message on login failure', async () => {
    // Mock login failure
    const mockError: Error & { response?: { data?: { message?: string } } } = new Error('Invalid credentials');
    mockError.response = { data: { message: 'Invalid email or password' } };
    vi.mocked(AuthService.login).mockRejectedValue(mockError);
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Fill login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Submit form
    fireEvent.click(loginButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    
    // Verify no redirect happened
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should redirect to dashboard if already logged in', async () => {
    // Mock already logged in user
    const mockUser: UserWithRole = { id: '123', email: 'admin@example.com', role: 'Administrator' as UserRole };
    const mockSession = { access_token: 'mock-token', user: mockUser };
    
    vi.mocked(AuthService.getSession).mockResolvedValue({
      data: { session: mockSession }
    });
    
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Should immediately redirect without showing login form
    await waitFor(() => {
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/dashboard');
    });
  });
});
