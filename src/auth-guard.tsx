
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './providers/auth-provider';
import { UserRole } from './hooks/use-auth';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { user, loading } = useAuthContext();

  // Show nothing while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
