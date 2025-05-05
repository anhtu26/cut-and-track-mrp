import { useState, useEffect } from "react";
import { Operation } from "@/types/operation";
import { OperationTemplate } from "@/types/part";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { OperationTemplateForm } from "./template/operation-template-form";

interface EditTemplateDialogProps {
  operation: Operation;
  workOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTemplate?: OperationTemplate;
}

/**
 * Dialog for editing or creating operation templates
 * Uses the refactored OperationTemplateForm component which handles document syncing properly
 */
export function EditTemplateDialog({ 
  operation, 
  workOrderId, 
  open, 
  onOpenChange,
  existingTemplate 
}: EditTemplateDialogProps) {
  // State to track when we're fetching part ID
  const [partId, setPartId] = useState<string | null>(null);
  
  // Fetch part ID from work order when the dialog opens
  useEffect(() => {
    const fetchPartId = async () => {
      if (open && workOrderId) {
        try {
          const { data, error } = await supabase
            .from('work_orders')
            .select('part_id')
            .eq('id', workOrderId)
            .maybeSingle();
            
          if (error) throw error;
          if (data?.part_id) {
            setPartId(data.part_id);
          }
        } catch (error) {
          console.error('Error fetching part ID:', error);
          // Could show a toast error here if needed
        }
      }
    };
    
    fetchPartId();
  }, [open, workOrderId]);
  
  // Handle form submission success
  const handleFormSubmitted = async (data: any): Promise<void> => {
    // Close the dialog when form is submitted successfully
    onOpenChange(false);
  };
  
  // Handle dialog close
  const handleCancel = () => {
    onOpenChange(false);
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
        
        {/* Use the new OperationTemplateForm component */}
        <OperationTemplateForm
          partId={partId || ""}  
          operation={operation}
          existingTemplate={existingTemplate}
          onSubmit={handleFormSubmitted}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
