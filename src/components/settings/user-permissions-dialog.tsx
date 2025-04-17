
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: { name: string }[];
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  assigned: boolean;
}

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
      
      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("id, name, description");
        
      if (rolesError) throw rolesError;

      // Fetch user's current roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id);
        
      if (userRolesError) throw userRolesError;
      
      // Extract role IDs assigned to the user
      const assignedRoleIds = userRolesData.map(ur => ur.role_id);
      setUserRoles(assignedRoleIds);
      
      // Format roles with assignment status
      const formattedRoles = rolesData.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        assigned: assignedRoleIds.includes(role.id)
      }));
      
      setRoles(formattedRoles);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
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
      
      // Find roles that were added
      const rolesToAdd = roles.filter(role => 
        role.assigned && !userRoles.includes(role.id)
      );
      
      // Find roles that were removed
      const rolesToRemove = userRoles.filter(roleId => 
        !roles.find(role => role.id === roleId && role.assigned)
      );
      
      // Add new role assignments
      if (rolesToAdd.length > 0) {
        const newUserRoles = rolesToAdd.map(role => ({
          user_id: user.id,
          role_id: role.id
        }));
        
        const { error: addError } = await supabase
          .from("user_roles")
          .insert(newUserRoles);
          
        if (addError) throw addError;
      }
      
      // Remove role assignments
      for (const roleId of rolesToRemove) {
        const { error: removeError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id)
          .eq("role_id", roleId);
          
        if (removeError) throw removeError;
      }
      
      toast.success("User permissions updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating user permissions:", error);
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
