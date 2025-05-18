/**
 * Authentication Integration Tests
 * 
 * This file contains integration tests for the local authentication system
 * to verify that the migration from Supabase to local API was successful.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient } from '../src/lib/api/client';
import { authService } from '../src/lib/api/auth';
import { UserRole } from '../src/hooks/use-auth';

// Mock the API client
vi.mock('../src/lib/api/client', () => ({
  apiClient: {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      getUserRole: vi.fn(),
      register: vi.fn()
    }
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Local Authentication System', () => {
  // Reset mocks and localStorage before each test
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  describe('authService', () => {
    it('should login successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      const mockToken = 'test-token';
      
      vi.mocked(apiClient.auth.login).mockResolvedValue({
        data: { user: mockUser, token: mockToken },
        error: null
      });
      
      const result = await authService.login('test@example.com', 'password');
      
      expect(result).toEqual({ user: mockUser, token: mockToken });
      expect(apiClient.auth.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(localStorage.getItem('mrp_auth_token')).toBe(mockToken);
      expect(localStorage.getItem('mrp_auth_user')).toBe(JSON.stringify(mockUser));
    });
    
    it('should throw an error when login fails', async () => {
      vi.mocked(apiClient.auth.login).mockResolvedValue({
        data: null,
        error: { name: 'ApiError', message: 'Invalid credentials', code: 'AUTH_ERROR', details: '' }
      });
      
      await expect(authService.login('test@example.com', 'wrong-password'))
        .rejects.toThrow('Invalid credentials');
      
      expect(apiClient.auth.login).toHaveBeenCalledWith('test@example.com', 'wrong-password');
      expect(localStorage.getItem('mrp_auth_token')).toBeNull();
      expect(localStorage.getItem('mrp_auth_user')).toBeNull();
    });
    
    it('should logout successfully', async () => {
      // Setup initial state
      localStorage.setItem('mrp_auth_token', 'test-token');
      localStorage.setItem('mrp_auth_user', JSON.stringify({ id: '123', email: 'test@example.com' }));
      
      await authService.logout();
      
      expect(apiClient.auth.logout).toHaveBeenCalled();
      expect(localStorage.getItem('mrp_auth_token')).toBeNull();
      expect(localStorage.getItem('mrp_auth_user')).toBeNull();
    });
    
    it('should get user role successfully', async () => {
      const userId = '123';
      const mockRole = UserRole.ADMIN;
      
      vi.mocked(apiClient.auth.getUserRole).mockResolvedValue({
        data: { role: mockRole },
        error: null
      });
      
      const result = await authService.getUserRole(userId);
      
      expect(result).toEqual({ role: mockRole });
      expect(apiClient.auth.getUserRole).toHaveBeenCalledWith(userId);
    });
    
    it('should throw an error when getting user role fails', async () => {
      const userId = '123';
      
      vi.mocked(apiClient.auth.getUserRole).mockResolvedValue({
        data: null,
        error: { name: 'ApiError', message: 'User not found', code: 'NOT_FOUND', details: '' }
      });
      
      await expect(authService.getUserRole(userId))
        .rejects.toThrow('User not found');
      
      expect(apiClient.auth.getUserRole).toHaveBeenCalledWith(userId);
    });
    
    it('should check if user is authenticated', () => {
      // Not authenticated initially
      expect(authService.isAuthenticated()).toBe(false);
      
      // Set token to simulate authenticated user
      localStorage.setItem('mrp_auth_token', 'test-token');
      
      // Should now be authenticated
      expect(authService.isAuthenticated()).toBe(true);
      
      // Remove token to simulate logout
      localStorage.removeItem('mrp_auth_token');
      
      // Should no longer be authenticated
      expect(authService.isAuthenticated()).toBe(false);
    });
    
    it('should get current user from localStorage', () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      
      // No user initially
      expect(authService.getCurrentUser()).toBeNull();
      
      // Set user in localStorage
      localStorage.setItem('mrp_auth_user', JSON.stringify(mockUser));
      
      // Should return the user
      expect(authService.getCurrentUser()).toEqual(mockUser);
      
      // Remove user from localStorage
      localStorage.removeItem('mrp_auth_user');
      
      // Should return null again
      expect(authService.getCurrentUser()).toBeNull();
    });
  });
});
