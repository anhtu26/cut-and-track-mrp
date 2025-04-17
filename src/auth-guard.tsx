
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from './stores/user-store';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  // Use useState to track client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Safe access to user store with client-side check
  const user = typeof window !== 'undefined' ? useUserStore(state => state.user) : null;
  
  // Set client-side flag after mount
  useEffect(() => {
    setIsClient(true);
    
    // Log for debugging
    if (!user) {
      console.log("[AUTH GUARD] No user found, will redirect to login");
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.log("[AUTH GUARD] User lacks required role", {
        userRole: user.role,
        requiredRoles: allowedRoles
      });
    }
  }, [user, allowedRoles]);

  // During server-side rendering or before client initialization, return null
  if (!isClient) {
    return null;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Logged in and authorized
  return <>{children}</>;
};

export default AuthGuard;
