
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-20 w-20 text-destructive" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Access Denied</h1>
        <p className="mt-3 text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
