/**
 * Supabase Authentication Proxy
 * 
 * This file provides proxy functions that mimic the Supabase Auth API
 * but redirect to our local authentication implementation.
 * This helps with the migration from Supabase to local authentication
 * without having to change all references at once.
 */

import axios from 'axios';

// Configure API URL from environment or default to Docker container API server
const API_URL = process.env.VITE_API_URL || 'http://localhost:3002/api';

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
 * Direct implementation of authentication functions
 * to avoid circular dependencies
 */

/**
 * Login with email and password
 */
async function login(email: string, password: string) {
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
}

/**
 * Logout user
 */
async function logout() {
  // For JWT-based auth, just remove the token
  TokenService.removeToken();
  return { error: null };
}

/**
 * Get current user data
 */
async function getCurrentUser() {
  try {
    const token = TokenService.getToken();
    if (!token) return null;

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      ...response.data,
      id: response.data.id,
      email: response.data.email,
      role: response.data.role
    };
  } catch (error) {
    console.error('Get current user error:', error);
    // Remove token if it's invalid
    TokenService.removeToken();
    return null;
  }
}

/**
 * Get current session
 */
async function getSession() {
  const token = TokenService.getToken();
  if (!token) return { data: { session: null } };

  try {
    const user = await getCurrentUser();
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
}

/**
 * Proxy for Supabase's signInWithPassword function
 */
export const signInWithPassword = async (credentials: { email: string; password: string }) => {
  try {
    const response = await login(credentials.email, credentials.password);
    
    return {
      data: {
        user: response.user,
        session: response.session
      },
      error: null
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      data: { user: null, session: null },
      error: new Error(error.message || 'Authentication failed')
    };
  }
};

/**
 * Proxy for Supabase's signOut function
 */
export const signOut = async () => {
  try {
    await logout();
    return { error: null };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { error: new Error(error.message || 'Logout failed') };
  }
};

/**
 * Export a complete Supabase Auth API proxy
 */
export const supabaseAuthProxy = {
  signInWithPassword,
  signOut,
  getSession: async () => {
    try {
      const sessionData = await getSession();
      return sessionData;
    } catch (error) {
      console.error('Get session error:', error);
      return { data: { session: null }, error };
    }
  },
  getUser: async () => {
    try {
      const user = await getCurrentUser();
      return { data: { user }, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return { data: { user: null }, error };
    }
  }
};

export default supabaseAuthProxy;
