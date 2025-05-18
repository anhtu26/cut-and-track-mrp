/**
 * Authentication Hooks
 * 
 * React hooks for working with the authentication service.
 * These hooks provide a clean, React-friendly way to interact with authentication
 * in functional components.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authService, User, Session } from './auth-service';

// Create an authentication context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => false,
  logout: async () => false,
  isAuthenticated: false
});

/**
 * Authentication provider component props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component
 * Use this at the root of your app to provide authentication context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const session = await authService.getSession();
        
        if (isMounted) {
          setUser(session.user);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      if (isMounted) {
        setUser(session?.user || null);
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);
  
  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error instanceof Error ? response.error.message : 'Authentication failed');
        setError(errorMessage);
        return false;
      }
      
      setUser(response.user || null);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);
  
  // Logout function
  const logout = useCallback(async () => {
    setError(null);
    
    try {
      const response = await authService.logout();
      
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error instanceof Error ? response.error.message : 'Logout failed');
        setError(errorMessage);
        return false;
      }
      
      setUser(null);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook for using authentication in components
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Hook for checking if the user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated, loading } = useAuth();
  return { isAuthenticated, loading };
}

/**
 * Hook for accessing the current user
 */
export function useUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}
