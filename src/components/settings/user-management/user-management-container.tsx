
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { UserTable } from "./user-table";
import { DeleteUserDialog } from "./delete-user-dialog";
import { AddUserDialog } from "../add-user-dialog";
import { EditUserDialog } from "../edit-user-dialog";
import { UserPermissionsDialog } from "../user-permissions-dialog";
import { User, UserSchema, PartialUserData } from "./types";

export function UsersManagementContainer() {
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
      console.log("[USERS] Fetching user profiles");
      
      // Get all user profiles with their roles, using explicit table aliases
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
        console.error('[USERS ERROR]', error);
        toast.error(`Failed to fetch users: ${error.message}`);
        return;
      }

      console.log('[USERS] Raw data:', data);

      // Format the data to match our User interface
      const formattedUsers = data
        .filter((item: any) => item && item.id) // Filter out items without an id
        .map((item: any) => {
          // Ensure required fields exist before creating the user object
          if (!item || !item.id || !item.auth_users?.email) {
            console.warn('[USERS WARNING] Skipping invalid user data:', item);
            return null;
          }
          
          // Create a properly structured user object with required fields
          const userData: PartialUserData = {
            id: item.id, // Required
            email: item.auth_users?.email || 'Unknown email', // Required with fallback
            first_name: item.first_name,
            last_name: item.last_name,
            department: item.department,
            job_title: item.job_title,
            roles: Array.isArray(item.roles) ? item.roles.map((role: any) => ({ 
              name: role.roles?.name || 'Unknown role' 
            })) : []
          };
          
          console.log('[USERS] Processing user:', userData);
          return userData;
        })
        .filter((user): user is PartialUserData => user !== null); // Filter out null entries and assert type

      console.log('[USERS] Formatted users:', formattedUsers);

      // Validate users with Zod
      const validatedUsers: User[] = [];
      for (const userData of formattedUsers) {
        try {
          // Explicitly pass to Zod for validation
          const validUser = UserSchema.parse(userData);
          validatedUsers.push(validUser);
        } catch (validationError) {
          console.error('[USERS VALIDATION ERROR]', validationError);
          // Continue with next user
        }
      }

      setUsers(validatedUsers);
    } catch (error: any) {
      console.error('[USERS ERROR]', error);
      toast.error(`Failed to fetch users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleAddUser = () => {
    setAddUserOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserOpen(true);
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setPermissionsOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-4">
      <UserTable
        users={users}
        loading={loading}
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
        onManagePermissions={handleManagePermissions}
        onDeleteUser={handleDeleteUser}
      />

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
      <DeleteUserDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
