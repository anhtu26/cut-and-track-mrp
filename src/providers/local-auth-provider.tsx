/**
 * Local Authentication Provider
 * 
 * This component provides authentication context for the application
 * using the local API server for ITAR compliance.
 * 
 * No Supabase dependencies - complete local implementation.
 */

import { createContext, useContext, ReactNode } from 'react';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { User, Session, UserRole } from '@/lib/api/auth-client';

// Auth context interface
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<boolean>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAuthenticated: boolean;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  login: async () => null,
  logout: async () => false,
  hasRole: () => false,
  isAuthenticated: false
});

// Hook for components to access auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 */
export function LocalAuthProvider({ children }: AuthProviderProps) {
  // Use the local auth hook to manage authentication state
  const auth = useLocalAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export default LocalAuthProvider;
