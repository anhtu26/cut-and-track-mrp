/**
 * Authentication Service
 * 
 * Provides direct authentication functionality for the application
 * without any Supabase dependencies or proxy patterns.
 * 
 * This is a clean implementation for ITAR compliance with local-only authentication.
 */

import { apiClient } from '../api/client';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string | Error;
}

export interface Session {
  user: User | null;
  token: string | null;
}

/**
 * Authentication service for the application
 */
export class AuthService {
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'auth_user';
  
  /**
   * Log in a user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.auth.login(email, password);
      
      if (response.error) {
        return {
          success: false,
          error: response.error
        };
      }
      
      // Store authentication data
      localStorage.setItem(AuthService.TOKEN_KEY, response.data.token);
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(response.data.user));
      
      // Dispatch auth change event
      this.dispatchAuthEvent('login');
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }
  
  /**
   * Log out the current user
   */
  async logout(): Promise<AuthResponse> {
    try {
      await apiClient.auth.logout();
      
      // Clear authentication data
      localStorage.removeItem(AuthService.TOKEN_KEY);
      localStorage.removeItem(AuthService.USER_KEY);
      
      // Dispatch auth change event
      this.dispatchAuthEvent('logout');
      
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    }
  }
  
  /**
   * Get the current session information
   */
  async getSession(): Promise<Session> {
    const token = localStorage.getItem(AuthService.TOKEN_KEY);
    
    if (!token) {
      return { user: null, token: null };
    }
    
    try {
      const response = await apiClient.auth.getUserInfo();
      
      if (response.error) {
        return { user: null, token: null };
      }
      
      return {
        user: response.data,
        token
      };
    } catch (error) {
      console.error('Get session error:', error);
      return { user: null, token: null };
    }
  }
  
  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(AuthService.TOKEN_KEY);
    
    if (!token) {
      return null;
    }
    
    try {
      const response = await apiClient.auth.getUserInfo();
      
      if (response.error) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
  
  /**
   * Get the authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return localStorage.getItem(AuthService.TOKEN_KEY) !== null;
  }
  
  /**
   * Register for authentication change events
   */
  onAuthStateChange(callback: (event: 'login' | 'logout', session: Session | null) => void): () => void {
    const handler = async (event: StorageEvent) => {
      if (event.key === AuthService.TOKEN_KEY) {
        if (!event.newValue) {
          callback('logout', { user: null, token: null });
        } else if (event.newValue !== event.oldValue) {
          const user = JSON.parse(localStorage.getItem(AuthService.USER_KEY) || 'null');
          callback('login', { user, token: event.newValue });
        }
      }
    };
    
    window.addEventListener('storage', handler);
    
    // Initial call with current state
    const token = localStorage.getItem(AuthService.TOKEN_KEY);
    if (token) {
      const user = JSON.parse(localStorage.getItem(AuthService.USER_KEY) || 'null');
      setTimeout(() => callback('login', { user, token }), 0);
    }
    
    // Return unsubscribe function
    return () => window.removeEventListener('storage', handler);
  }
  
  /**
   * Dispatch an authentication event
   */
  private dispatchAuthEvent(type: 'login' | 'logout'): void {
    window.dispatchEvent(new StorageEvent('storage', {
      key: AuthService.TOKEN_KEY,
      newValue: type === 'login' ? localStorage.getItem(AuthService.TOKEN_KEY) : null,
      oldValue: type === 'logout' ? localStorage.getItem(AuthService.TOKEN_KEY) : null,
      storageArea: localStorage
    }));
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export default for convenience
export default authService;
