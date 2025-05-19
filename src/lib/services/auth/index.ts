import axios from 'axios';
import { UserRole, UserWithRole } from '@/hooks/use-auth';

// Configure API URL from environment or default to localhost for browser access
// IMPORTANT: Always use localhost for browser access, not Docker hostnames
const API_URL = 'http://localhost:3002';
console.log('Local API client initialized with URL:', API_URL);

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
   * Save user to localStorage
   */
  setUser: (user: any): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  },

  /**
   * Get user from localStorage
   */
  getUser: (): any => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  },

  /**
   * Remove token and user from localStorage
   */
  removeAuth: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
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
      console.log(`Attempting to login with email: ${email}`);
      const response = await axios.post(`${API_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      console.log('Login response:', response.data);
      
      // Save token and user to localStorage
      TokenService.setToken(response.data.token);
      TokenService.setUser(response.data.user);
      
      return {
        user: response.data.user,
        session: { access_token: response.data.token }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    // For JWT-based auth, just remove the token and user
    TokenService.removeAuth();
    return { error: null };
  },

  /**
   * Get current user data
   */
  getCurrentUser: async (): Promise<UserWithRole | null> => {
    try {
      const token = TokenService.getToken();
      if (!token) return null;

      // First try to get from localStorage to avoid unnecessary API calls
      const cachedUser = TokenService.getUser();
      if (cachedUser) {
        return {
          ...cachedUser,
          id: cachedUser.id,
          email: cachedUser.email,
          role: cachedUser.role as UserRole
        };
      }

      // If not in localStorage, fetch from API
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = {
        ...response.data,
        id: response.data.id,
        email: response.data.email,
        role: response.data.role as UserRole
      };

      // Cache the user
      TokenService.setUser(user);

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      // Remove token if it's invalid
      TokenService.removeAuth();
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
