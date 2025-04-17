
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PlusIcon, UserPlusIcon, PencilIcon, TrashIcon, UsersIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserGroup {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export function UserGroups() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      setLoading(true);
      
      // Fetch all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("user_groups")
        .select("*");
        
      if (groupsError) throw groupsError;
      
      // Fetch member counts for each group
      const groupsWithCounts = await Promise.all(
        groupsData.map(async (group: any) => {
          const { count, error } = await supabase
            .from("user_group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);
            
          if (error) {
            console.error("Error fetching member count:", error);
            return {
              ...group,
              memberCount: 0
            };
          }
          
          return {
            ...group,
            memberCount: count || 0
          };
        })
      );
      
      setGroups(groupsWithCounts);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast.error(`Failed to fetch groups: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleAddGroup = async () => {
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from("user_groups")
        .insert({
          name: formState.name,
          description: formState.description || null
        })
        .select();
        
      if (error) throw error;
      
      toast.success("Group created successfully");
      setNewGroupDialogOpen(false);
      setFormState({ name: "", description: "" });
      fetchGroups();
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(`Failed to create group: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("user_groups")
        .update({
          name: formState.name,
          description: formState.description || null
        })
        .eq("id", selectedGroup.id);
        
      if (error) throw error;
      
      toast.success("Group updated successfully");
      setEditGroupDialogOpen(false);
      fetchGroups();
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast.error(`Failed to update group: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("user_groups")
        .delete()
        .eq("id", selectedGroup.id);
        
      if (error) throw error;
      
      toast.success("Group deleted successfully");
      setDeleteGroupDialogOpen(false);
      fetchGroups();
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error(`Failed to delete group: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Groups</h2>
        <Button onClick={() => setNewGroupDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="font-medium text-lg">No Groups</h3>
          <p className="text-muted-foreground mb-4">Create a group to manage users collectively</p>
          <Button onClick={() => setNewGroupDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id} className="border rounded-md overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{group.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                    </Badge>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedGroup(group);
                        setFormState({
                          name: group.name,
                          description: group.description || ""
                        });
                        setEditGroupDialogOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedGroup(group);
                        setDeleteGroupDialogOpen(true);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {group.description}
                  </p>
                )}
              </div>
              <div className="border-t p-4 bg-muted/50 flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  // TODO: Implement manage members functionality
                  onClick={() => toast.info("User group member management will be implemented soon")}
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Manage Members
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Group Dialog */}
      <Dialog open={newGroupDialogOpen} onOpenChange={setNewGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new user group to manage permissions collectively.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Description</Label>
              <Textarea
                id="group-description"
                placeholder="Enter group description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewGroupDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddGroup}
              disabled={!formState.name.trim() || submitting}
            >
              {submitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={editGroupDialogOpen} onOpenChange={setEditGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Group Name</Label>
              <Input
                id="edit-group-name"
                placeholder="Enter group name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-description">Description</Label>
              <Textarea
                id="edit-group-description"
                placeholder="Enter group description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditGroupDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditGroup}
              disabled={!formState.name.trim() || submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <Dialog open={deleteGroupDialogOpen} onOpenChange={setDeleteGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the group "{selectedGroup?.name}"? This will remove all users from this group. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteGroupDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
