
import { useState } from "react";
import { OperationTemplate } from "@/types/part";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OperationTemplateForm } from "./operation-template-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface OperationTemplatesListProps {
  partId: string;
  templates: OperationTemplate[];
}

export function OperationTemplatesList({ partId, templates }: OperationTemplatesListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OperationTemplate | null>(null);
  const queryClient = useQueryClient();

  // Add operation template mutation
  const { mutateAsync: addTemplate, isPending: isAddingTemplate } = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('operation_templates')
        .insert({
          part_id: partId,
          name: data.name,
          description: data.description || null,
          machining_methods: data.machiningMethods || null,
          setup_instructions: data.setupInstructions || null,
          estimated_duration: data.estimatedDuration || null,
          sequence: data.sequence
        })
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Operation template added");
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error adding operation template:", error);
      toast.error(`Failed to add template: ${error.message}`);
    }
  });

  // Update operation template mutation
  const { mutateAsync: updateTemplate, isPending: isUpdatingTemplate } = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedTemplate) throw new Error("No template selected");

      const { data: result, error } = await supabase
        .from('operation_templates')
        .update({
          name: data.name,
          description: data.description || null,
          machining_methods: data.machiningMethods || null,
          setup_instructions: data.setupInstructions || null,
          estimated_duration: data.estimatedDuration || null,
          sequence: data.sequence,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Operation template updated");
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      console.error("Error updating operation template:", error);
      toast.error(`Failed to update template: ${error.message}`);
    }
  });

  // Delete operation template mutation
  const { mutateAsync: deleteTemplate, isPending: isDeletingTemplate } = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate) throw new Error("No template selected");

      const { error } = await supabase
        .from('operation_templates')
        .delete()
        .eq('id', selectedTemplate.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Operation template deleted");
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      console.error("Error deleting operation template:", error);
      toast.error(`Failed to delete template: ${error.message}`);
    }
  });

  // Sort templates by sequence number
  const sortedTemplates = [...templates].sort((a, b) => a.sequence - b.sequence);

  const handleAddSubmit = async (data: any): Promise<void> => {
    await addTemplate(data);
  };

  const handleUpdateSubmit = async (data: any): Promise<void> => {
    await updateTemplate(data);
  };

  const handleDeleteConfirm = async () => {
    await deleteTemplate();
  };

  const openEditDialog = (template: OperationTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (template: OperationTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Operation Templates</h3>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      {sortedTemplates.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sequence</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Est. Duration (min)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.sequence}</TableCell>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.description || "—"}</TableCell>
                <TableCell>{template.estimatedDuration || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => openDeleteDialog(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 border rounded-md bg-muted/20">
          <p className="text-sm text-muted-foreground">No operation templates defined for this part.</p>
        </div>
      )}

      {/* Add Operation Template Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Operation Template</DialogTitle>
            <DialogDescription>
              Create an operation template for this part. Operation templates will be used to
              automatically create operations when a work order is created for this part.
            </DialogDescription>
          </DialogHeader>
          <OperationTemplateForm
            partId={partId}
            onSubmit={handleAddSubmit}
            isSubmitting={isAddingTemplate}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Operation Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Operation Template</DialogTitle>
            <DialogDescription>
              Update the details for this operation template.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <OperationTemplateForm
              partId={partId}
              initialData={selectedTemplate}
              onSubmit={handleUpdateSubmit}
              isSubmitting={isUpdatingTemplate}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Operation Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this operation template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingTemplate}
            >
              {isDeletingTemplate ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
