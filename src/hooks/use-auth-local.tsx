import { useEffect, useState } from 'react';
import { toast } from "sonner";
import AuthService from '@/lib/services/auth';

export type UserRole = 'Administrator' | 'Manager' | 'Staff' | 'Operator';

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  [key: string]: any;
}

export interface UserSession {
  user: UserWithRole | null;
  session: any | null;
}

/**
 * Custom hook for authentication with local JWT auth system
 * Replaces Supabase authentication with local implementation
 */
export const useAuth = () => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial user session
    const loadUserSession = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await AuthService.getSession();
        setSession(currentSession);
        
        if (currentSession) {
          // Get user data
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error loading user session:', err);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserSession();
    
    // Add event listener for storage changes to handle logout in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (!e.newValue) {
          // Token was removed, log out in this tab too
          setUser(null);
          setSession(null);
        } else if (e.newValue !== e.oldValue) {
          // Token changed, reload user data
          loadUserSession();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      setLoading(true);
      const response = await AuthService.login(email, password);
      
      setSession(response.session);
      setUser(response.user as UserWithRole);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    setError(null);
    try {
      setLoading(true);
      await AuthService.logout();
      
      // Clear user state
      setUser(null);
      setSession(null);
      
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during logout';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    user,
    loading,
    error,
    login,
    logout
  };
};

export default useAuth;
