import { useEffect, useState, useMemo } from 'react';
import { toast } from "sonner";
import { apiClient } from '@/lib/api/client';
import { authService } from '@/lib/api/auth';

// Define UserRole enum for ITAR-compliant local system
export enum UserRole {
  ADMIN = 'Administrator',
  MANAGER = 'Manager',
  OPERATOR = 'Operator',
  INSPECTOR = 'Inspector',
  STAFF = 'Staff'
}

// User and Session types for local authentication
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface Session {
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
  const authService = useMemo(() => ({
    login: async (email: string, password: string) => {
      const response = await apiClient.auth.login(email, password);
      return response.data || { user: null, token: '' };
    },
    getUserRole: async (userId: string) => {
      const response = await apiClient.auth.getUserRole(userId);
      return response.data || { role: UserRole.STAFF };
    },
    logout: async () => {
      await apiClient.auth.logout();
    }
  }), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get user role from the local auth service
  const getUserRole = async (userId: string) => {
    try {
      const response = await apiClient.auth.getUserRole(userId);
      
      if (response.error) {
        console.error('Error fetching user role:', response.error);
        return { data: null, error: response.error.message };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching user role:', error);
      return { data: null, error: 'Failed to fetch user role' };
    }
  };

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
          
          // If user already has a role, use it
          if (user.role) {
            setUser(user);
            setSession(session);
            return;
          }
          
          // Otherwise, try to fetch the role
          try {
            const roleResponse = await apiClient.auth.getUserRole(user.id);
            
            if (roleResponse.error) {
              console.warn('Error fetching user role:', roleResponse.error.message);
              // Continue with default role if role fetch fails
              const userWithDefaultRole = { ...user, role: UserRole.STAFF };
              setUser(userWithDefaultRole);
              setSession(session);
              // Update stored user with default role
              localStorage.setItem('auth_user', JSON.stringify(userWithDefaultRole));
              return;
            }
            
            // Map the role string to UserRole enum
            const roleMap: Record<string, UserRole> = {
              'Administrator': UserRole.ADMIN,
              'Manager': UserRole.MANAGER,
              'Operator': UserRole.OPERATOR,
              'Inspector': UserRole.INSPECTOR,
              'Staff': UserRole.STAFF
            };
            
            const roleValue = roleMap[roleResponse.data?.role] || UserRole.STAFF;
            
            const userWithRole = { 
              ...user, 
              role: roleValue
            };
            
            setUser(userWithRole);
            setSession(session);
            // Update stored user with role
            localStorage.setItem('auth_user', JSON.stringify(userWithRole));
          } catch (error) {
            console.error('Error fetching user role:', error);
            // Continue with default role if role fetch fails
            const userWithDefaultRole = { ...user, role: UserRole.STAFF };
            setUser(userWithDefaultRole);
            setSession(session);
            // Update stored user with default role
            localStorage.setItem('auth_user', JSON.stringify(userWithDefaultRole));
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
      
      // Use the local auth service for login
      const response = await apiClient.auth.login(email, password);
      
      if (response.error) {
        throw new Error(`Login failed: ${response.error.message}`);
      }
      
      if (!response?.data?.user) {
        throw new Error('Login failed: No user data received');
      }

      // Create session data
      const session = { access_token: response.data.token };
      
      // Fetch user's role
      let userRole = UserRole.STAFF;
      try {
        const roleResponse = await apiClient.auth.getUserRole(response.data.user.id);
        
        if (roleResponse.error) {
          console.warn('Error fetching user role:', roleResponse.error.message);
        } else if (roleResponse.data?.role) {
          // Map the role string to UserRole enum
          const roleMap: Record<string, UserRole> = {
            'Administrator': UserRole.ADMIN,
            'Manager': UserRole.MANAGER,
            'Operator': UserRole.OPERATOR,
            'Inspector': UserRole.INSPECTOR,
            'Staff': UserRole.STAFF
          };
          
          userRole = roleMap[roleResponse.data.role] || UserRole.STAFF;
        }
      } catch (roleError) {
        console.warn('Could not fetch user role, using default role:', roleError);
      }
      
      // Create user with role
      const userWithRole = { 
        ...response.data.user, 
        role: userRole
      };
      
      // Save session and user to localStorage
      localStorage.setItem('auth_session', JSON.stringify(session));
      localStorage.setItem('auth_user', JSON.stringify(userWithRole));
      
      // Update state
      setUser(userWithRole);
      setSession(session);

      return { user: userWithRole, session };
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
      
      // Use the local auth service for logout
      await apiClient.auth.logout();
      
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
