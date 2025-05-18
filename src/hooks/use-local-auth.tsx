/**
 * Local Authentication Hook
 * 
 * This hook provides authentication functionality using the local API server
 * without any Supabase dependencies for ITAR compliance.
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authClient, User, Session, UserRole } from '@/lib/api/auth-client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for authentication with local JWT auth system
 */
export function useLocalAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial auth state on mount
  useEffect(() => {
    async function loadAuthState() {
      try {
        setLoading(true);
        
        // Check for existing session
        const sessionResponse = await authClient.getSession();
        
        if (sessionResponse.error) {
          console.warn('Session error:', sessionResponse.error);
          setError(sessionResponse.error.message);
          return;
        }
        
        if (sessionResponse.data?.session) {
          setSession(sessionResponse.data.session);
          
          // Get user data
          const userResponse = await authClient.getCurrentUser();
          
          if (userResponse.error) {
            console.warn('User data error:', userResponse.error);
            setError(userResponse.error.message);
            return;
          }
          
          if (userResponse.data) {
            setUser(userResponse.data);
          }
        }
      } catch (err) {
        console.error('Auth state loading error:', err);
        setError(err instanceof Error ? err.message : 'Unknown authentication error');
      } finally {
        setLoading(false);
      }
    }
    
    loadAuthState();
    
    // Listen for storage events to sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (!e.newValue) {
          // Token removed, log out in this tab too
          setUser(null);
          setSession(null);
        } else if (e.newValue !== e.oldValue) {
          // Token changed, reload auth state
          loadAuthState();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  /**
   * Log in with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authClient.login(email, password);
      
      if (response.error) {
        setError(response.error.message);
        toast.error(`Login failed: ${response.error.message}`);
        return null;
      }
      
      if (!response.data) {
        setError('No data received from login');
        toast.error('Login failed: No data received');
        return null;
      }
      
      // Set auth state
      setSession({ access_token: response.data.token });
      setUser(response.data.user);
      
      toast.success('Login successful');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown login error';
      setError(errorMessage);
      toast.error(`Login failed: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Log out the current user
   */
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authClient.logout();
      
      if (response.error) {
        setError(response.error.message);
        toast.error(`Logout failed: ${response.error.message}`);
        return false;
      }
      
      // Clear auth state
      setUser(null);
      setSession(null);
      
      toast.success('Logged out successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown logout error';
      setError(errorMessage);
      toast.error(`Logout failed: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Check if user has required role
   */
  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (!user) return false;
    
    const userRole = user.role;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => role === userRole);
    }
    
    return requiredRole === userRole;
  };
  
  return {
    user,
    session,
    loading,
    error,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user
  };
}

export default useLocalAuth;
