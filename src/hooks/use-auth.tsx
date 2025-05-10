
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { signInWithPassword, signOut, getUserRole, UserRole } from '@/lib/services/auth/mock-auth';

// Mock Session and User types to replace Supabase types
interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  access_token: string;
}

// Using UserRole enum imported from mock-auth

export interface UserWithRole extends User {
  role: UserRole;
}

export interface UserSession {
  user: UserWithRole | null;
  session: Session | null;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Check for active session from localStorage
    const checkSession = async () => {
      const savedSession = localStorage.getItem('auth_session');
      const savedUser = localStorage.getItem('auth_user');
      
      if (savedSession && savedUser) {
        try {
          const session = JSON.parse(savedSession);
          const user = JSON.parse(savedUser);
          
          // Get user role
          const { data: userData, error: roleError } = await getUserRole(user.id);
          
          if (roleError) {
            console.error('Error fetching user role:', roleError);
            setUser(null);
            setSession(null);
            localStorage.removeItem('auth_session');
            localStorage.removeItem('auth_user');
          } else {
            const userWithRole = { ...user, role: userData?.role || UserRole.STAFF };
            setUser(userWithRole);
            setSession(session);
          }
        } catch (error) {
          console.error('Error parsing saved session:', error);
          localStorage.removeItem('auth_session');
          localStorage.removeItem('auth_user');
        }
      }
      
      setLoading(false);
    };

    checkSession();

    // No need for subscription in mock auth
    return () => {
      // Cleanup if needed
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      setLoading(true);
      const { data, error } = await signInWithPassword({ email, password });

      if (error) throw error;

      // Fetch user's role
      const { data: userData, error: roleError } = await getUserRole(data.user.id);

      if (roleError) throw roleError;
      
      // Save session and user to localStorage
      localStorage.setItem('auth_session', JSON.stringify(data.session));
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      // Update state
      const userWithRole = { ...data.user, role: userData?.role || UserRole.STAFF };
      setUser(userWithRole);
      setSession(data.session);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      setLoading(true);
      const { error } = await signOut();
      if (error) throw error;
      
      // Clear local storage
      localStorage.removeItem('auth_session');
      localStorage.removeItem('auth_user');
      
      // Update state
      setUser(null);
      setSession(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during logout';
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
