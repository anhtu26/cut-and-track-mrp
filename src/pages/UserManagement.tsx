
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/hooks/use-auth";
import { AddUserDialog } from "@/components/user-management/add-user-dialog";
import { useAuthContext } from "@/providers/auth-provider";

interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export default function UserManagement() {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const { session } = useAuthContext();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
        return [];
      }

      return data as User[];
    },
  });

  const handleAddUser = async (email: string, password: string, role: UserRole) => {
    try {
      // Use the Edge Function to create the user
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-user`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      toast.success(`User ${email} created successfully with role ${role}`);
      refetch();
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create user");
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={() => setAddUserDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user access and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setAddUserDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first user
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          user.role === 'Administrator' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : user.role === 'Manager'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : user.role === 'Staff'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onSubmit={handleAddUser}
      />
    </div>
  );
}
