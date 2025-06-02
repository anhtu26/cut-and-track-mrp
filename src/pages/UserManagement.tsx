
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from '@/lib/api/client';
import { User as ApiUser } from '@/types';
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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// Local interface for UI representation of users
interface UserWithRoleEnum {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string; // Make optional to match API structure
}

// Map between UserRole enum and API user role strings
const mapRoleToApiRole = (role: UserRole): 'admin' | 'manager' | 'operator' | 'inspector' => {
  switch (role) {
    case UserRole.ADMIN:
      return 'admin';
    case UserRole.MANAGER:
      return 'manager';
    case UserRole.OPERATOR:
      return 'operator';
    case UserRole.INSPECTOR:
      return 'inspector';
    default:
      return 'operator'; // Default fallback
  }
};

// Map from API role string to UserRole enum
const mapApiRoleToRole = (role: string): UserRole => {
  switch (role) {
    case 'admin':
      return UserRole.ADMIN;
    case 'manager':
      return UserRole.MANAGER;
    case 'operator':
      return UserRole.OPERATOR;
    case 'inspector':
      return UserRole.INSPECTOR;
    default:
      return UserRole.STAFF;
  }
};

export default function UserManagement() {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoleEnum | null>(null);
  const { session, user: currentUser } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await apiClient.users.getAll();

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
        return [];
      }

      console.log("Fetched users:", data);
      // Map API user roles to UserRole enum
      return (data || []).map((user: ApiUser) => ({
        ...user,
        role: mapApiRoleToRole(user.role),
        created_at: user.created_at || new Date().toISOString() // Ensure created_at exists
      })) as UserWithRoleEnum[];
    },
  });

  // Filter out the current Administrator user from the display list
  const filteredUsers = users.filter(u => u.id !== currentUser?.id);

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        const { error } = await apiClient.users.delete(userId);

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
        // Convert from UserRole enum to API role string
        const apiRole = mapRoleToApiRole(role);
        const { error } = await apiClient.users.update(userId, { role: apiRole });

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
      // Convert from UserRole enum to API role string
      const apiRole = mapRoleToApiRole(role);
      // Use local API to create the user
      const { data, error } = await apiClient.users.create({ email, password, role: apiRole });
      
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

  const handleEditUser = (user: UserWithRoleEnum) => {
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

  const handleDeleteUser = (user: UserWithRoleEnum) => {
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
          ) : filteredUsers.length === 0 ? (
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          user.role === UserRole.ADMIN 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : user.role === UserRole.MANAGER
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : user.role === UserRole.STAFF
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            user={selectedUser as any}
            onSubmit={handleUpdateUser}
          />
          
          <DeleteUserDialog
            open={deleteUserDialogOpen}
            onOpenChange={setDeleteUserDialogOpen}
            user={selectedUser as any}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  );
}
