
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuthContext } from "@/providers/auth-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Login() {
  const { user, login, loading, error } = useAuthContext();
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Show Administrator dialog upon successful login
      setShowAdminDialog(true);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // If user is already logged in, redirect to dashboard
  if (user && !showAdminDialog) {
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
            <p className="font-medium mb-2">Enter Administrator credentials to log in</p>
            <p className="text-xs text-muted-foreground">
              Only Administrator accounts can log in during this phase
            </p>
          </div>
        </div>

        <AuthForm 
          onLogin={handleLogin} 
          error={error}
          isLoading={loading}
        />

        {/* Administrator confirmation dialog */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Administrator Access</DialogTitle>
              <DialogDescription>
                You have successfully logged in as an Administrator.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAdminDialog(false)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
              >
                Continue to Dashboard
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
