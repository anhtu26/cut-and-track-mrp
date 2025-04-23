import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Operation } from "@/types/operation";
import { OperationTemplate } from "@/types/part";
import { toast } from "@/components/ui/sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateForm, TemplateFormValues, useTemplateForm } from "./template/template-form";

// Import the operation service
import OperationService from "@/lib/services/operation/operation-service";

interface EditTemplateDialogProps {
  operation: Operation;
  workOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTemplate?: OperationTemplate;
}

export function EditTemplateDialog({ 
  operation, 
  workOrderId, 
  open, 
  onOpenChange,
  existingTemplate 
}: EditTemplateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Use the template form hook
  const form = useTemplateForm(operation, existingTemplate);

  // Update form when operation changes
  useEffect(() => {
    form.reset({
      name: operation.name,
      description: operation.description || "",
      machiningMethods: operation.machiningMethods || "",
      setupInstructions: operation.setupInstructions || "",
      sequence: operation.sequence,
      estimatedDuration: operation.actualStartTime && operation.actualEndTime
        ? Math.round((new Date(operation.actualEndTime).getTime() - new Date(operation.actualStartTime).getTime()) / (1000 * 60))
        : existingTemplate?.estimatedDuration,
      includeDocuments: true,
    });
  }, [operation, existingTemplate, form]);

  // Create save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      // Get the part ID from the work order
      const response = await fetch(`/api/work-orders/${workOrderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch work order");
      }
      
      const workOrder = await response.json();
      if (!workOrder.part_id) {
        throw new Error("Work order has no associated part");
      }
      
      // Create template data
      const templateData = {
        name: values.name,
        description: values.description || null,
        machining_methods: values.machiningMethods || null,
        setup_instructions: values.setupInstructions || null,
        sequence: values.sequence,
        estimated_duration: values.estimatedDuration || null,
        part_id: workOrder.part_id,
      };
      
      // Update or create template using the operation service
      if (existingTemplate) {
        // Update existing template
        await OperationService.syncOperationToPartTemplate(
          operation.id,
          workOrder.part_id,
          values.name,
          {
            ...templateData,
            updated_at: new Date().toISOString()
          }
        );
      } else {
        // Create new template
        await OperationService.syncOperationToPartTemplate(
          operation.id,
          workOrder.part_id,
          values.name,
          {
            ...templateData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
      }
      
      // Return the part ID for invalidation
      return { partId: workOrder.part_id };
    },
    onSuccess: (data) => {
      // Show success message
      toast.success(existingTemplate 
        ? "Template updated successfully" 
        : "Operation saved as template"
      );
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["part", data.partId] });
      queryClient.invalidateQueries({ queryKey: ["operation-templates"] });
      
      // Close dialog
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Error saving template:", error);
      toast.error(`Failed to save template: ${error.message || "Unknown error"}`);
    }
  });

  // Handle form submission
  const onSubmit = async (values: TemplateFormValues) => {
    setIsSubmitting(true);
    
    try {
      await saveTemplateMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingTemplate ? "Edit Operation Template" : "Save as Operation Template"}
          </DialogTitle>
          <DialogDescription>
            {existingTemplate 
              ? "Update the details for this operation template." 
              : "Save this operation's configuration as a template for future work orders using this part."}
          </DialogDescription>
        </DialogHeader>
        
        {/* Use the extracted TemplateForm component */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TemplateForm 
            operation={operation} 
            existingTemplate={existingTemplate} 
            form={form} 
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || saveTemplateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || saveTemplateMutation.isPending}
            >
              {(isSubmitting || saveTemplateMutation.isPending)
                ? "Saving..." 
                : existingTemplate 
                  ? "Update Template" 
                  : "Save as Template"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
