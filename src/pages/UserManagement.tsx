
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/hooks/use-auth";
import { AddUserDialog } from "@/components/user-management/add-user-dialog";
import { EditUserDialog } from "@/components/user-management/edit-user-dialog";
import { DeleteUserDialog } from "@/components/user-management/delete-user-dialog";
import { useAuthContext } from "@/providers/auth-provider";

interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export default function UserManagement() {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { session } = useAuthContext();
  const queryClient = useQueryClient();

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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        const { error } = await supabase.functions.invoke('delete-user', {
          body: JSON.stringify({ userId }),
        });

        if (error) throw error;
        
        return userId;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(`User deleted successfully`);
      refetch();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      try {
        const { error } = await supabase.functions.invoke('update-user', {
          body: JSON.stringify({ userId, role }),
        });

        if (error) throw error;
        
        return { userId, role };
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(`User updated successfully`);
      refetch();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    },
  });

  const handleAddUser = async (email: string, password: string, role: UserRole) => {
    try {
      // Use Supabase Functions to create the user
      const { data: result, error } = await supabase.functions.invoke('create-user', {
        body: JSON.stringify({ email, password, role }),
      });
      
      if (error) {
        throw error;
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

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserDialogOpen(true);
  };

  const handleUpdateUser = async (role: UserRole) => {
    if (!selectedUser) return false;
    
    try {
      await updateUserMutation.mutateAsync({ userId: selectedUser.id, role });
      setEditUserDialogOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteUserDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return false;
    
    try {
      await deleteUserMutation.mutateAsync(selectedUser.id);
      setDeleteUserDialogOpen(false);
      return true;
    } catch (error) {
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
                    <th className="text-left py-3 px-4">Actions</th>
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
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditUser(user)}
                            disabled={user.role === 'Administrator' && users.filter(u => u.role === 'Administrator').length <= 1}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.role === 'Administrator' && users.filter(u => u.role === 'Administrator').length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
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
      
      {selectedUser && (
        <>
          <EditUserDialog
            open={editUserDialogOpen}
            onOpenChange={setEditUserDialogOpen}
            user={selectedUser}
            onSubmit={handleUpdateUser}
          />
          
          <DeleteUserDialog
            open={deleteUserDialogOpen}
            onOpenChange={setDeleteUserDialogOpen}
            user={selectedUser}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  );
}
