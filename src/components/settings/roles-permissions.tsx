import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const PermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
  assigned: z.boolean()
});

const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  permissions: z.array(PermissionSchema)
});

type Permission = z.infer<typeof PermissionSchema>;
type Role = z.infer<typeof RoleSchema>;

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
      console.log("[ROLES] Fetching roles and permissions");
      
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("id, name, description");
        
      if (rolesError) {
        console.error("[ROLES ERROR]", rolesError);
        throw rolesError;
      }
      
      console.log("[ROLES] Roles data:", rolesData);
      
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("permissions")
        .select("id, name, description, resource, action");
        
      if (permissionsError) {
        console.error("[PERMISSIONS ERROR]", permissionsError);
        throw permissionsError;
      }
      
      console.log("[PERMISSIONS] Permissions data:", permissionsData);
      
      const { data: rolePermissionsData, error: rolePermissionsError } = await supabase
        .from("role_permissions")
        .select("role_id, permission_id");
        
      if (rolePermissionsError) {
        console.error("[ROLE PERMISSIONS ERROR]", rolePermissionsError);
        throw rolePermissionsError;
      }
      
      console.log("[ROLE PERMISSIONS] Role-Permissions data:", rolePermissionsData);
      
      try {
        const validatedPermissions = permissionsData.map((permission: any) => 
          PermissionSchema.parse({
            ...permission,
            assigned: false
          })
        );
        
        setPermissions(validatedPermissions);
        
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
        
        const validatedRoles = formattedRoles.map((role: any) => 
          RoleSchema.parse(role)
        );
        
        setRoles(validatedRoles);
      } catch (validationError) {
        console.error("[VALIDATION ERROR]", validationError);
        toast.error("Failed to validate roles/permissions data");
      }
    } catch (error: any) {
      console.error("[ROLES AND PERMISSIONS ERROR]", error);
      toast.error(`Failed to load roles and permissions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleAddRole = async () => {
    try {
      setSubmitting(true);
      
      const roleData = {
        name: formState.name,
        description: formState.description || null
      };
      
      console.log("[ROLES ADD] Creating new role:", roleData);
      
      const { data, error } = await supabase
        .from("roles")
        .insert(roleData)
        .select();
        
      if (error) {
        console.error("[ROLES ADD ERROR]", error);
        throw error;
      }
      
      console.log("[ROLES ADD] Role created:", data);
      toast.success("Role created successfully");
      setNewRoleDialogOpen(false);
      setFormState({ name: "", description: "" });
      fetchRolesAndPermissions();
    } catch (error: any) {
      console.error("[ROLES ADD ERROR]", error);
      toast.error(`Failed to create role: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;
    
    try {
      setSubmitting(true);
      
      const roleData = {
        name: formState.name,
        description: formState.description || null
      };
      
      console.log("[ROLES EDIT] Updating role:", selectedRole.id, roleData);
      
      const { error } = await supabase
        .from("roles")
        .update(roleData)
        .eq("id", selectedRole.id);
        
      if (error) {
        console.error("[ROLES EDIT ERROR]", error);
        throw error;
      }
      
      console.log("[ROLES EDIT] Role updated successfully");
      toast.success("Role updated successfully");
      setEditRoleDialogOpen(false);
      fetchRolesAndPermissions();
    } catch (error: any) {
      console.error("[ROLES EDIT ERROR]", error);
      toast.error(`Failed to update role: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      setSubmitting(true);
      console.log("[ROLES DELETE] Deleting role:", selectedRole.id);
      
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", selectedRole.id);
        
      if (error) {
        console.error("[ROLES DELETE ERROR]", error);
        throw error;
      }
      
      console.log("[ROLES DELETE] Role deleted successfully");
      toast.success("Role deleted successfully");
      setDeleteRoleDialogOpen(false);
      fetchRolesAndPermissions();
    } catch (error: any) {
      console.error("[ROLES DELETE ERROR]", error);
      toast.error(`Failed to delete role: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermissionToggle = async (roleId: string, permissionId: string, isAssigned: boolean) => {
    try {
      console.log("[PERMISSION TOGGLE]", {
        roleId,
        permissionId,
        currentlyAssigned: isAssigned,
        action: isAssigned ? "remove" : "add"
      });
      
      if (isAssigned) {
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .match({ role_id: roleId, permission_id: permissionId });
          
        if (error) {
          console.error("[PERMISSION REMOVE ERROR]", error);
          throw error;
        }
        
        console.log("[PERMISSION REMOVE] Permission removed successfully");
      } else {
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role_id: roleId, permission_id: permissionId });
          
        if (error) {
          console.error("[PERMISSION ADD ERROR]", error);
          throw error;
        }
        
        console.log("[PERMISSION ADD] Permission added successfully");
      }
      
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
      console.error("[PERMISSION TOGGLE ERROR]", error);
      toast.error(`Failed to update permission: ${error.message}`);
      fetchRolesAndPermissions();
    }
  };

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
                    disabled={role.name === "Admin"}
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
                                disabled={role.name === "Admin"}
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
                disabled={selectedRole?.name === "Admin"}
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
