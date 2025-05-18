import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { AuthService } from './index';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  // Clear localStorage and reset axios mocks between tests
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      // Mock response data
      const mockUser = {
        id: '123',
        email: 'admin@example.com',
        role: 'Administrator'
      };
      
      const mockToken = 'fake-jwt-token';
      const mockResponse = {
        data: {
          user: mockUser,
          token: mockToken
        }
      };
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      // Call login method
      const result = await AuthService.login('admin@example.com', 'admin123');
      
      // Verify axios was called with correct params
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'), 
        { email: 'admin@example.com', password: 'admin123' }
      );
      
      // Verify returned data
      expect(result).toEqual({
        user: mockUser,
        session: { access_token: mockToken }
      });
      
      // Verify token was saved to localStorage
      expect(localStorage.getItem('auth_token')).toBe(mockToken);
    });
    
    it('should handle login failure', async () => {
      // Mock error response
      const mockError = new Error('Invalid credentials');
      mockedAxios.post.mockRejectedValueOnce(mockError);
      
      // Call login method and expect it to throw
      await expect(AuthService.login('wrong@example.com', 'wrongpassword'))
        .rejects.toThrow();
      
      // Verify no token was saved
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });
  
  describe('getCurrentUser', () => {
    it('should get current user when token exists', async () => {
      // Setup token in localStorage
      localStorage.setItem('auth_token', 'fake-token');
      
      // Mock response
      const mockUser = {
        id: '123',
        email: 'admin@example.com',
        role: 'Administrator'
      };
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockUser });
      
      // Call getCurrentUser
      const result = await AuthService.getCurrentUser();
      
      // Verify axios was called with correct headers
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' }
        })
      );
      
      // Verify returned data
      expect(result).toEqual(mockUser);
    });
    
    it('should return null when no token exists', async () => {
      // Ensure no token in localStorage
      localStorage.removeItem('auth_token');
      
      // Call getCurrentUser
      const result = await AuthService.getCurrentUser();
      
      // Verify axios was not called
      expect(mockedAxios.get).not.toHaveBeenCalled();
      
      // Verify null was returned
      expect(result).toBeNull();
    });
  });
  
  describe('logout', () => {
    it('should remove token from localStorage', async () => {
      // Setup token in localStorage
      localStorage.setItem('auth_token', 'fake-token');
      
      // Call logout
      await AuthService.logout();
      
      // Verify token was removed
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });
});
