/**
 * Clean Authentication Implementation
 * 
 * This file provides a clean implementation of authentication functions needed by the application.
 * It uses the new authentication service to handle authentication operations and provides
 * Supabase-compatible interfaces for existing code during migration.
 * 
 * This implementation is designed to work with the local API server for ITAR compliance.
 */

import { authService } from './auth/auth-service';

/**
 * Implementation of Supabase's signInWithPassword function
 * using our clean authentication service
 */
export const signInWithPassword = async (credentials: { email: string; password: string }) => {
  try {
    const response = await authService.login(credentials.email, credentials.password);
    
    if (!response.success) {
      return {
        data: { user: null, session: null },
        error: new Error(typeof response.error === 'string' ? response.error : 'Authentication failed')
      };
    }
    
    return {
      data: {
        user: response.user,
        session: { access_token: response.token }
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
 * Implementation of Supabase's signOut function
 * using our clean authentication service
 */
export const signOut = async () => {
  try {
    await authService.logout();
    return { error: null };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { error: new Error(error.message || 'Logout failed') };
  }
};

/**
 * Get the current user's session
 */
export const getSession = async () => {
  try {
    const session = await authService.getSession();
    
    if (!session.user) {
      return { data: { session: null } };
    }
    
    return {
      data: {
        session: {
          access_token: session.token,
          user: session.user
        }
      }
    };
  } catch (error) {
    console.error('Get session error:', error);
    return { data: { session: null } };
  }
};

/**
 * Get the current user
 */
export const getUser = async () => {
  try {
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return { data: { user: null } };
    }
    
    return {
      data: { user },
      error: null
    };
  } catch (error) {
    console.error('Get user error:', error);
    return { data: { user: null }, error };
  }
};

/**
 * Create a complete auth object with all the necessary functions
 * This object is compatible with the Supabase auth interface for easy migration
 */
export const auth = {
  signInWithPassword,
  signOut,
  getSession,
  getUser
};

export default auth;
