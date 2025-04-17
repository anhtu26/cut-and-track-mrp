
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";

// Define Zod schemas for validation
const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Role name is required"),
  description: z.string().nullable(),
  assigned: z.boolean()
});

const UserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role_id: z.string().uuid()
});

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Invalid email"),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  roles: z.array(z.object({ name: z.string() }))
});

type Role = z.infer<typeof RoleSchema>;
type User = z.infer<typeof UserSchema>;

interface UserPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

export function UserPermissionsDialog({ open, onOpenChange, user, onSuccess }: UserPermissionsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  
  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open, user.id]);

  async function fetchRoles() {
    try {
      setLoading(true);
      console.log("[USER PERMISSIONS] Fetching roles for user:", user.id);
      
      // Fetch all roles with explicit table aliases
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("roles.id, roles.name, roles.description");
        
      if (rolesError) {
        console.error("[USER PERMISSIONS ERROR] Failed to fetch roles:", rolesError);
        throw rolesError;
      }

      console.log("[USER PERMISSIONS] Available roles:", rolesData);

      // Fetch user's current roles with explicit table aliases
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id);
        
      if (userRolesError) {
        console.error("[USER PERMISSIONS ERROR] Failed to fetch user roles:", userRolesError);
        throw userRolesError;
      }
      
      console.log("[USER PERMISSIONS] User roles data:", userRolesData);
      
      // Type-safe extraction of role IDs
      // Parse the data through Zod schema to ensure type safety
      const validUserRoles = userRolesData.map(role => {
        try {
          // Validate the data format first
          const validRole = { user_id: user.id, role_id: role.role_id };
          // Now parse it with Zod
          return UserRoleSchema.parse(validRole).role_id;
        } catch (validationError) {
          console.error("[USER ROLES VALIDATION ERROR]", validationError);
          return null; // Skip invalid entries
        }
      }).filter(Boolean) as string[]; // Filter out nulls and assert type
      
      setUserRoles(validUserRoles);
      
      // Format roles with assignment status
      const formattedRoles = rolesData.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        assigned: validUserRoles.includes(role.id)
      }));
      
      // Validate roles with Zod
      const validRoles: Role[] = [];
      for (const role of formattedRoles) {
        try {
          const validRole = RoleSchema.parse(role);
          validRoles.push(validRole);
        } catch (validationError) {
          console.error("[ROLES VALIDATION ERROR]", validationError);
          // Continue with next role
        }
      }
      
      console.log("[USER PERMISSIONS] Formatted roles:", validRoles);
      setRoles(validRoles);
    } catch (error: any) {
      console.error("[USER PERMISSIONS ERROR] Error fetching roles:", error);
      toast.error(`Failed to fetch roles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleRoleToggle = (roleId: string, checked: CheckedState) => {
    setRoles(prev => 
      prev.map(role => 
        role.id === roleId ? { ...role, assigned: checked === true } : role
      )
    );
  };

  async function handleSave() {
    try {
      setSaving(true);
      console.log("[USER PERMISSIONS SAVE] Updating roles for user:", user.id);
      
      // Find roles that were added
      const rolesToAdd = roles.filter(role => 
        role.assigned && !userRoles.includes(role.id)
      );
      
      // Find roles that were removed
      const rolesToRemove = userRoles.filter(roleId => 
        !roles.find(role => role.id === roleId && role.assigned)
      );
      
      console.log("[USER PERMISSIONS SAVE] Roles to add:", rolesToAdd);
      console.log("[USER PERMISSIONS SAVE] Roles to remove:", rolesToRemove);
      
      // Add new role assignments
      if (rolesToAdd.length > 0) {
        const newUserRoles = rolesToAdd.map(role => ({
          user_id: user.id,
          role_id: role.id
        }));
        
        const { error: addError } = await supabase
          .from("user_roles")
          .insert(newUserRoles);
          
        if (addError) {
          console.error("[USER PERMISSIONS SAVE ERROR] Failed to add roles:", addError);
          throw addError;
        }
        
        console.log("[USER PERMISSIONS SAVE] Added roles successfully");
      }
      
      // Remove role assignments
      for (const roleId of rolesToRemove) {
        const { error: removeError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id)
          .eq("role_id", roleId);
          
        if (removeError) {
          console.error("[USER PERMISSIONS SAVE ERROR] Failed to remove role:", removeError);
          throw removeError;
        }
        
        console.log("[USER PERMISSIONS SAVE] Removed role successfully:", roleId);
      }
      
      toast.success("User permissions updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("[USER PERMISSIONS SAVE ERROR] Error updating permissions:", error);
      toast.error(`Failed to update permissions: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Permissions</DialogTitle>
          <DialogDescription>
            Manage roles and permissions for {user.first_name} {user.last_name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[250px]" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2 p-4 border rounded-md">
                  <div className="flex-1">
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="text-base font-medium"
                    >
                      {role.name}
                    </Label>
                    {role.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    )}
                  </div>
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={role.assigned}
                    onCheckedChange={(checked) => handleRoleToggle(role.id, checked)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
