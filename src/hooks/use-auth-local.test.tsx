import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, UserRole } from './use-auth';
import { apiClient } from '@/lib/api/client';

// Mock the apiClient
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      getUserRole: vi.fn(),
      // Add other auth methods if they are used by useAuth during initialization or other tested flows
    }
    // Mock other parts of apiClient if necessary for these tests
  }
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    
    // Default mocks for initial session check
        // Default mocks for initial session check (localStorage is empty by default in tests)
    // No explicit getSession or getCurrentUser in the new useAuth, it reads from localStorage
    // and calls getUserRole if a user is found without a role.
    // For a clean initial state, localStorage.clear() in beforeEach is sufficient.
    // If a test requires an initial populated localStorage, it should set it up.
    vi.mocked(apiClient.auth.getUserRole).mockResolvedValue({ 
      data: { role: UserRole.STAFF }, 
      error: null 
    });
  });
  
  it('should initialize with null user and session', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Initially loading should be true
    expect(result.current.loading).toBe(true);
    
    // Wait for initial session check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.error).toBeNull();
  });
  
  it('should login successfully and store session/user in localStorage', async () => {
    // Mock successful login from apiClient
    const rawMockUser = { id: '123', email: 'admin@example.com', name: 'Admin User' }; // User data from API
    const mockToken = 'mock-jwt-token';
    const mockRole = UserRole.ADMIN;

    vi.mocked(apiClient.auth.login).mockResolvedValue({
      data: { user: rawMockUser, token: mockToken },
      error: null
    });

    vi.mocked(apiClient.auth.getUserRole).mockResolvedValue({
      data: { role: mockRole },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    // Wait for initial loading to finish (if any setup in useEffect needs to complete)
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Perform login
    await act(async () => {
      await result.current.login('admin@example.com', 'password');
    });

    // Expected user and session structure in useAuth state
    const expectedUserInState = { ...rawMockUser, role: mockRole };
    const expectedSessionInState = { access_token: mockToken };

    // Check that state was updated correctly
    expect(result.current.user).toEqual(expectedUserInState);
    expect(result.current.session).toEqual(expectedSessionInState);
    expect(result.current.error).toBeNull();

    // Verify apiClient.auth.login was called
    expect(apiClient.auth.login).toHaveBeenCalledWith('admin@example.com', 'password');
    // Verify apiClient.auth.getUserRole was called after successful login
    expect(apiClient.auth.getUserRole).toHaveBeenCalledWith(rawMockUser.id);

    // Verify localStorage was set
    expect(localStorage.getItem('auth_session')).toEqual(JSON.stringify(expectedSessionInState));
    expect(localStorage.getItem('auth_user')).toEqual(JSON.stringify(expectedUserInState));
  });
  
  it('should handle login errors', async () => {
    // Mock login error from apiClient - API returns an error structure
    vi.mocked(apiClient.auth.login).mockResolvedValue({
      data: null, // This causes useAuth's memoized authService.login to return {user: null, token: ''}
      error: { name: 'ApiError', message: 'Invalid credentials from API', code: 'AUTH_ERROR', details: '' }
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Attempt login
    await act(async () => {
      try {
        await result.current.login('wrong@example.com', 'wrongpass');
      } catch (error) {
        // Error is expected to be thrown by useAuth's login and caught here
        expect(error.message).toBe('Login failed: No user data received');
      }
    });

    // Error message set in useAuth state
    expect(result.current.error).toBe('Login failed: No user data received');
    
    // User and session should remain null
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();

    // localStorage should not be set
    expect(localStorage.getItem('auth_session')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
  
  it('should logout successfully and clear localStorage', async () => {
    // Setup initial authenticated state in localStorage for the hook to load
    const initialUser = { id: '123', email: 'admin@example.com', role: UserRole.ADMIN, name: 'Test User' };
    const initialSession = { access_token: 'mock-token-for-logout' };
    localStorage.setItem('auth_user', JSON.stringify(initialUser));
    localStorage.setItem('auth_session', JSON.stringify(initialSession));

    // apiClient.auth.logout is async, so we mock a resolved promise.
    vi.mocked(apiClient.auth.logout).mockResolvedValue(undefined);
    
    // getUserRole might be called if role isn't in stored user, ensure it doesn't fail.
    vi.mocked(apiClient.auth.getUserRole).mockResolvedValue({ 
      data: { role: initialUser.role }, 
      error: null 
    });

    const { result } = renderHook(() => useAuth());

    // Wait for auth state to be loaded from localStorage
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(initialUser);
      expect(result.current.session).toEqual(initialSession);
    });

    // Perform logout
    await act(async () => {
      await result.current.logout();
    });

    // Check that state was reset in the hook
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    
    // Verify apiClient.auth.logout was called
    expect(apiClient.auth.logout).toHaveBeenCalled();

    // Verify localStorage was cleared
    expect(localStorage.getItem('auth_session')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should initialize with an existing session from localStorage and fetch user role', async () => {
    // Setup initial user (without role) and session in localStorage
    const storedUser = { id: '456', email: 'cached@example.com', name: 'Cached User' };
    const storedSession = { access_token: 'cached-token' };
    localStorage.setItem('auth_user', JSON.stringify(storedUser));
    localStorage.setItem('auth_session', JSON.stringify(storedSession));

    const fetchedRole = UserRole.MANAGER;
    vi.mocked(apiClient.auth.getUserRole).mockResolvedValue({
      data: { role: fetchedRole },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    // Wait for loading to finish (session check and role fetch)
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify getUserRole was called for the stored user
    expect(apiClient.auth.getUserRole).toHaveBeenCalledWith(storedUser.id);

    // Check that state was updated correctly
    const expectedUserInState = { ...storedUser, role: fetchedRole };
    expect(result.current.user).toEqual(expectedUserInState);
    expect(result.current.session).toEqual(storedSession);
    expect(result.current.error).toBeNull();

    // Verify localStorage for auth_user was updated with the role
    expect(JSON.parse(localStorage.getItem('auth_user') || '{}')).toEqual(expectedUserInState);
  });
});
