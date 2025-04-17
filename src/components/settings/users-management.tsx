
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { UserPlusIcon, PencilIcon, TrashIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { AddUserDialog } from "./add-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UserPermissionsDialog } from "./user-permissions-dialog";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useUserStore } from "@/stores/user-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  job_title: string | null;
  roles: { name: string }[];
}

export function UsersManagement() {
  const { user: currentUser } = useUserStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      
      // Get all user profiles with their roles
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          department,
          job_title,
          auth_users:id(email),
          roles:user_roles(roles(name))
        `);

      if (error) {
        throw error;
      }

      // Format the data to match our User interface
      const formattedUsers = data.map((item: any) => ({
        id: item.id,
        email: item.auth_users?.email || 'Unknown email',
        first_name: item.first_name,
        last_name: item.last_name,
        department: item.department,
        job_title: item.job_title,
        roles: item.roles.map((role: any) => ({ name: role.roles.name }))
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(`Failed to fetch users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Delete the user account
      // Note: This requires admin privileges in Supabase
      const { error } = await supabase.auth.admin.deleteUser(
        selectedUser.id
      );

      if (error) throw error;

      toast.success(`User ${selectedUser.email} deleted successfully`);
      setDeleteConfirmOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setAddUserOpen(true)}>
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Department/Job</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {user.department && <div>{user.department}</div>}
                        {user.job_title && <div className="text-muted-foreground">{user.job_title}</div>}
                        {!user.department && !user.job_title && (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role, index) => (
                            <Badge key={index} variant="outline">
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setPermissionsOpen(true);
                          }}
                          title="Manage permissions"
                        >
                          <ShieldCheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditUserOpen(true);
                          }}
                          title="Edit user"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteConfirmOpen(true);
                          }}
                          title="Delete user"
                          disabled={user.id === currentUser?.id} // Prevent deleting current user
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No users found. Click "Add User" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Dialog */}
      <AddUserDialog 
        open={addUserOpen} 
        onOpenChange={setAddUserOpen}
        onSuccess={fetchUsers}
      />

      {/* Edit User Dialog */}
      {selectedUser && (
        <EditUserDialog 
          open={editUserOpen} 
          onOpenChange={setEditUserOpen}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}

      {/* User Permissions Dialog */}
      {selectedUser && (
        <UserPermissionsDialog 
          open={permissionsOpen} 
          onOpenChange={setPermissionsOpen}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}

      {/* Delete User Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
