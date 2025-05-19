
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import AuthService from "@/lib/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  // Check if user is already logged in
  useState(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await AuthService.getCurrentUser();
          if (userData) {
            setUser(userData);
          }
        } catch (err) {
          // Invalid token, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
    };
    
    checkAuth();
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setLoading(true);
      
      console.log(`Attempting to login with: ${email}`);
      const response = await AuthService.login(email, password);
      
      console.log('Login successful:', response);
      setUser(response.user);
      
      // Show success dialog
      toast.success("Login successful!");
      setShowAdminDialog(true);
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight">CUT  CUT  CUT</h1>
          <p className="mt-2 text-muted-foreground">
            Manufacturing Resource Planning System
          </p>
          
          <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">Enter credentials to log in</p>
            <p className="text-xs text-muted-foreground">
              Default admin: admin@example.com / admin123
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {/* Administrator confirmation dialog */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Successful</DialogTitle>
              <DialogDescription>
                You have successfully logged in as {user?.role || 'Administrator'}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowAdminDialog(false)}
              >
                Continue to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
