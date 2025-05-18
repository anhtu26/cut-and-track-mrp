/**
 * Local Authentication Client
 * 
 * This module provides a clean, direct authentication client that interacts
 * with the local API server for ITAR-compliant authentication.
 * 
 * NO SUPABASE DEPENDENCIES - This is a complete replacement.
 */

// API base URL from environment with fallback for Docker
const API_URL = process.env.VITE_API_URL 
  ? `${process.env.VITE_API_URL}/api` 
  : 'http://localhost:3002/api';

// Local storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Types
export enum UserRole {
  ADMIN = 'Administrator',
  MANAGER = 'Manager',
  OPERATOR = 'Operator',
  INSPECTOR = 'Inspector',
  STAFF = 'Staff'
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole | string;
}

export interface Session {
  access_token: string;
}

export interface AuthResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Authentication client for local API server
 */
export const authClient = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: null,
          error: new Error(data.message || 'Login failed')
        };
      }
      
      // Store auth data in localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      return {
        data: {
          user: data.user,
          token: data.token
        },
        error: null
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown login error')
      };
    }
  },
  
  /**
   * Log out the current user
   */
  async logout(): Promise<AuthResponse<{ success: boolean }>> {
    try {
      // Clear local storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      return {
        data: { success: true },
        error: null
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown logout error')
      };
    }
  },
  
  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<AuthResponse<User>> {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        return {
          data: null,
          error: new Error('No authentication token found')
        };
      }
      
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Clear invalid token
        if (response.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
        
        return {
          data: null,
          error: new Error(data.message || 'Failed to get user data')
        };
      }
      
      return {
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error getting user data')
      };
    }
  },
  
  /**
   * Get the current session if authenticated
   */
  async getSession(): Promise<AuthResponse<{ session: Session | null }>> {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        return {
          data: { session: null },
          error: null
        };
      }
      
      // Validate token by getting user data
      const userResponse = await this.getCurrentUser();
      
      if (userResponse.error || !userResponse.data) {
        return {
          data: { session: null },
          error: userResponse.error
        };
      }
      
      return {
        data: {
          session: {
            access_token: token
          }
        },
        error: null
      };
    } catch (error) {
      console.error('Get session error:', error);
      return {
        data: { session: null },
        error: error instanceof Error ? error : new Error('Unknown error getting session')
      };
    }
  },
  
  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): { Authorization?: string } {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authClient;
