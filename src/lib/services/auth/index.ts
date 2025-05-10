import axios from 'axios';
import { UserRole, UserWithRole } from '@/hooks/use-auth';

// Configure API URL from environment or default to localhost in development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Token management utilities
 */
const TokenService = {
  /**
   * Get token from localStorage
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  /**
   * Save token to localStorage
   */
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  /**
   * Remove token from localStorage
   */
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
};

/**
 * Authentication service for local JWT-based auth
 */
export const AuthService = {
  /**
   * Login user with email and password
   */
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email, 
        password 
      });
      
      // Save token to localStorage
      TokenService.setToken(response.data.token);
      
      return {
        user: response.data.user,
        session: { access_token: response.data.token }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    // For JWT-based auth, just remove the token
    TokenService.removeToken();
    return { error: null };
  },

  /**
   * Get current user data
   */
  getCurrentUser: async (): Promise<UserWithRole | null> => {
    try {
      const token = TokenService.getToken();
      if (!token) return null;

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        ...response.data,
        // Add any fields required by the UserWithRole interface
        id: response.data.id,
        email: response.data.email,
        role: response.data.role as UserRole
      };
    } catch (error) {
      console.error('Get current user error:', error);
      // Remove token if it's invalid
      TokenService.removeToken();
      return null;
    }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const token = TokenService.getToken();
    if (!token) return { data: { session: null } };

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return { data: { session: null } };

      return {
        data: {
          session: {
            access_token: token,
            user
          }
        }
      };
    } catch (error) {
      console.error('Get session error:', error);
      return { data: { session: null } };
    }
  },

  /**
   * Add authorization header to requests
   */
  authHeader: () => {
    const token = TokenService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default AuthService;
