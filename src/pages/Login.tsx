
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
import { useUserStore } from "@/stores/user-store";

export default function Login() {
  const { user, login, isLoading, error } = useUserStore();

  const handleLogin = (email: string, password: string) => {
    login(email, password);
  };

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">CutTrack MRP</h1>
          <p className="mt-2 text-muted-foreground">
            Manufacturing Resource Planning System
          </p>
          
          <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">Available test accounts:</p>
            <ul className="space-y-1 text-xs text-left">
              <li>Admin: admin@example.com / admin</li>
              <li>Manager: manager@example.com / manager</li>
              <li>Machinist: machinist@example.com / machinist</li>
              <li>Sales: sales@example.com / sales</li>
            </ul>
          </div>
        </div>

        <AuthForm 
          onLogin={handleLogin} 
          error={error}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
