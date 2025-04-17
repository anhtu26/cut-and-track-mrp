
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  assigned: boolean;
}

export function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleDialogOpen, setNewRoleDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  async function fetchRolesAndPermissions() {
    try {
      setLoading(true);
      
      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*");
        
      if (rolesError) throw rolesError;
      
      // Fetch all permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("permissions")
        .select("*");
        
      if (permissionsError) throw permissionsError;
      
      // Fetch role-permissions mapping
      const { data: rolePermissionsData, error: rolePermissionsError } = await supabase
        .from("role_permissions")
        .select("*");
        
      if (rolePermissionsError) throw rolePermissionsError;
      
      // Format data
      const formattedRoles = rolesData.map((role: any) => {
        const rolePermissions = rolePermissionsData
          .filter((rp: any) => rp.role_id === role.id)
          .map((rp: any) => rp.permission_id);
          
        const assignedPermissions = permissionsData.map((permission: any) => ({
          ...permission,
          assigned: rolePermissions.includes(permission.id)
        }));
        
        return {
          ...role,
          permissions: assignedPermissions
        };
      });
      
      setRoles(formattedRoles);
      setPermissions(permissionsData);
    } catch (error: any) {
      console.error("Error fetching roles and permissions:", error);
      toast.error(`Failed to load roles and permissions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleAddRole = async () => {
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from("roles")
        .insert({
          name: formState.name,
          description: formState.description || null
        })
        .select();
        
      if (error) throw error;
      
      toast.success("Role created successfully");
      setNewRoleDialogOpen(false);
      setFormState({ name: "", description: "" });
      fetchRolesAndPermissions();
    } catch (error: any) {
      console.error("Error creating role:", error);
      toast.error(`Failed to create role: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("roles")
        .update({
          name: formState.name,
          description: formState.description || null
        })
        .eq("id", selectedRole.id);
        
      if (error) throw error;
      
      toast.success("Role updated successfully");
      setEditRoleDialogOpen(false);
      fetchRolesAndPermissions();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(`Failed to update role: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", selectedRole.id);
        
      if (error) throw error;
      
      toast.success("Role deleted successfully");
      setDeleteRoleDialogOpen(false);
      fetchRolesAndPermissions();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast.error(`Failed to delete role: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermissionToggle = async (roleId: string, permissionId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        // Remove permission from role
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .match({ role_id: roleId, permission_id: permissionId });
          
        if (error) throw error;
      } else {
        // Add permission to role
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role_id: roleId, permission_id: permissionId });
          
        if (error) throw error;
      }
      
      // Update local state
      setRoles(roles.map(role => {
        if (role.id === roleId) {
          return {
            ...role,
            permissions: role.permissions.map(permission => {
              if (permission.id === permissionId) {
                return { ...permission, assigned: !isAssigned };
              }
              return permission;
            })
          };
        }
        return role;
      }));
      
      toast.success(`Permission ${isAssigned ? "removed from" : "added to"} role`);
    } catch (error: any) {
      console.error("Error toggling permission:", error);
      toast.error(`Failed to update permission: ${error.message}`);
      // Refresh data to ensure consistent state
      fetchRolesAndPermissions();
    }
  };

  // Group permissions by resource for better organization
  const groupedPermissions = permissions.reduce((acc: Record<string, Permission[]>, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Roles</h2>
        <Button onClick={() => setNewRoleDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No roles found</p>
        </div>
      ) : (
        <div>
          {roles.map((role) => (
            <div key={role.id} className="mb-6 border rounded-md overflow-hidden">
              <div className="flex justify-between items-center bg-muted p-4">
                <div>
                  <h3 className="font-medium text-lg">{role.name}</h3>
                  {role.description && (
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedRole(role);
                      setFormState({ name: role.name, description: role.description || "" });
                      setEditRoleDialogOpen(true);
                    }}
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedRole(role);
                      setDeleteRoleDialogOpen(true);
                    }}
                    disabled={role.name === "Admin"} // Prevent deleting Admin role
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="text-sm font-medium mb-4">Permissions</h4>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{resource}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {resourcePermissions.map((permission) => {
                          const isAssigned = role.permissions.find(p => p.id === permission.id)?.assigned || false;
                          return (
                            <div 
                              key={permission.id} 
                              className="flex items-center justify-between border rounded-md p-3"
                            >
                              <div>
                                <Label 
                                  htmlFor={`${role.id}-${permission.id}`}
                                  className="text-sm font-medium"
                                >
                                  {permission.name}
                                </Label>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                              <Checkbox
                                id={`${role.id}-${permission.id}`}
                                checked={isAssigned}
                                onCheckedChange={() => handlePermissionToggle(role.id, permission.id, isAssigned)}
                                disabled={role.name === "Admin"} // Admin always has all permissions
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Role Dialog */}
      <Dialog open={newRoleDialogOpen} onOpenChange={setNewRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Create a new role with specific permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="Enter role name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Enter role description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewRoleDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddRole}
              disabled={!formState.name.trim() || submitting}
            >
              {submitting ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                placeholder="Enter role name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                disabled={selectedRole?.name === "Admin"} // Prevent editing Admin role name
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                placeholder="Enter role description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditRoleDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditRole}
              disabled={!formState.name.trim() || submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <Dialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteRoleDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteRole}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
