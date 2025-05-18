/**
 * Authentication Service
 * 
 * Direct implementation for local authentication with no Supabase dependencies.
 * This replaces all Supabase authentication with a clean implementation
 * that works directly with our local API server.
 */

// API base URL from environment with fallback for Docker
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:3002/api';

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface Session {
  access_token: string;
  user: User;
}

export interface AuthResponse<T> {
  data: T | null;
  error: Error | null;
}

// Local storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse<{ user: User; session: Session }>> {
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
    
    // Return data in the format expected by the application
    return {
      data: {
        user: data.user,
        session: {
          access_token: data.token,
          user: data.user
        }
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
}

/**
 * Log out the current user
 */
export async function logout(): Promise<AuthResponse<null>> {
  try {
    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    return {
      data: null,
      error: null
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown logout error')
    };
  }
}

/**
 * Get current user session
 */
export async function getSession(): Promise<AuthResponse<{ session: Session | null }>> {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (!token || !userStr) {
      return {
        data: { session: null },
        error: null
      };
    }
    
    try {
      const user = JSON.parse(userStr) as User;
      
      return {
        data: {
          session: {
            access_token: token,
            user
          }
        },
        error: null
      };
    } catch (e) {
      // Invalid user data in localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      return {
        data: { session: null },
        error: new Error('Invalid session data')
      };
    }
  } catch (error) {
    console.error('Get session error:', error);
    return {
      data: { session: null },
      error: error instanceof Error ? error : new Error('Unknown error getting session')
    };
  }
}

/**
 * Get the current user
 */
export async function getUser(): Promise<AuthResponse<User | null>> {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    
    if (!userStr) {
      return {
        data: null,
        error: null
      };
    }
    
    try {
      const user = JSON.parse(userStr) as User;
      
      // Verify the user against the API
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (token) {
        // Optional: verify token is still valid by making API request
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // Token invalid, clear storage
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          
          return {
            data: null,
            error: new Error('Session expired')
          };
        }
      }
      
      return {
        data: user,
        error: null
      };
    } catch (e) {
      // Invalid user data in localStorage
      localStorage.removeItem(USER_KEY);
      
      return {
        data: null,
        error: new Error('Invalid user data')
      };
    }
  } catch (error) {
    console.error('Get user error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error getting user')
    };
  }
}

// Export all authentication functions
export const auth = {
  login,
  logout,
  getSession,
  getUser
};

export default auth;
