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
      console.log("[SUPABASE REQUEST] Adding operation template with payload:", data);
      
      // Make sure sequence is a number
      const sequence = typeof data.sequence === 'number' ? data.sequence : 
                      parseInt(data.sequence, 10) || 0;
      
      // Handle null vs undefined for optional fields
      const formattedData = {
        part_id: partId,
        name: data.name || '',
        description: data.description || null,
        machining_methods: data.machiningMethods || null,
        setup_instructions: data.setupInstructions || null,
        estimated_duration: data.estimatedDuration ? 
                           Number(data.estimatedDuration) : null,
        sequence: sequence
      };
      
      console.log("[SUPABASE REQUEST] Formatted payload for insert:", formattedData);
      
      try {
        const { data: result, error } = await supabase
          .from('operation_templates')
          .insert(formattedData)
          .select();

        if (error) {
          console.error("[SUPABASE ERROR] Error adding template:", error);
          throw new Error(error.message || "Failed to add operation template");
        }
        
        if (!result || result.length === 0) {
          console.error("[SUPABASE ERROR] No result returned from insert");
          throw new Error("No result returned from operation template creation");
        }
        
        console.log("[SUPABASE RESPONSE] Template created:", result);
        return result;
      } catch (error: any) {
        console.error("[SUPABASE ERROR] Exception:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Operation template added");
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("[MUTATION ERROR] Error adding operation template:", error);
      toast.error(`Failed to add template: ${error.message || "Unknown error"}`);
    }
  });

  // Update operation template mutation
  const { mutateAsync: updateTemplate, isPending: isUpdatingTemplate } = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedTemplate) throw new Error("No template selected");

      console.log("[SUPABASE REQUEST] Updating template:", data);
      
      // Make sure sequence is a number
      const sequence = typeof data.sequence === 'number' ? data.sequence : 
                      parseInt(data.sequence, 10) || 0;
      
      // Handle null vs undefined for optional fields
      const formattedData = {
        name: data.name || '',
        description: data.description || null,
        machining_methods: data.machiningMethods || null,
        setup_instructions: data.setupInstructions || null,
        estimated_duration: data.estimatedDuration ? 
                           Number(data.estimatedDuration) : null,
        sequence: sequence,
        updated_at: new Date().toISOString()
      };
      
      console.log("[SUPABASE REQUEST] Formatted update payload:", formattedData);

      try {
        const { data: result, error } = await supabase
          .from('operation_templates')
          .update(formattedData)
          .eq('id', selectedTemplate.id)
          .select();

        if (error) {
          console.error("[SUPABASE ERROR] Error updating template:", error);
          throw new Error(error.message || "Failed to update operation template");
        }
        
        console.log("[SUPABASE RESPONSE] Template updated:", result);
        
        if (!result || result.length === 0) {
          console.error("[SUPABASE ERROR] No result returned from update");
          throw new Error("No result returned from operation template update");
        }
        
        return result;
      } catch (error: any) {
        console.error("[SUPABASE ERROR] Exception:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Operation template updated");
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      console.error("[MUTATION ERROR] Error updating template:", error);
      toast.error(`Failed to update template: ${error.message || "Unknown error"}`);
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

      if (error) throw new Error(error.message || "Failed to delete template");
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
    try {
      console.log("[TEMPLATE ADD] Starting submission of template:", data);
      await addTemplate(data);
    } catch (error) {
      console.error("[TEMPLATE ADD ERROR] Submission error:", error);
      // Error is already handled in the mutation
    }
  };

  const handleUpdateSubmit = async (data: any): Promise<void> => {
    try {
      console.log("[TEMPLATE UPDATE] Starting update of template:", data);
      await updateTemplate(data);
    } catch (error) {
      console.error("[TEMPLATE UPDATE ERROR] Submission error:", error);
      // Error is already handled in the mutation
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTemplate();
    } catch (error) {
      console.error("Delete template error:", error);
      // Error is already handled in the mutation
    }
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
