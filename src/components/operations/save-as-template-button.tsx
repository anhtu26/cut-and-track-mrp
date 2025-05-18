
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from '@/lib/api/client';;
import { Operation } from "@/types/operation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveAll, AlertTriangle } from "lucide-react";
import { EditTemplateDialog } from "./edit-template-dialog";

interface SaveAsTemplateButtonProps {
  operation: Operation;
  workOrderId: string;
}

export function SaveAsTemplateButton({ operation, workOrderId }: SaveAsTemplateButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch work order to get part ID
  const { data: workOrder, isLoading: isLoadingWorkOrder, error: workOrderError } = useQuery({
    queryKey: ["work-order-for-template", workOrderId],
    queryFn: async () => {
      if (!workOrderId) {
        throw new Error("Work order ID is required");
      }
      
      const { data, error } = await supabase
        .from("work_orders")
        .select("part_id, id")
        .eq("id", workOrderId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error(`Work order ${workOrderId} not found`);
      
      return data;
    },
    enabled: !!workOrderId,
    staleTime: 60000, // Cache for 1 minute
  });

  // Verify part exists
  const { data: part, isLoading: isLoadingPart } = useQuery({
    queryKey: ["part-for-template", workOrder?.part_id],
    queryFn: async () => {
      if (!workOrder?.part_id) return null;
      
      const { data, error } = await supabase
        .from("parts")
        .select("id, name")
        .eq("id", workOrder.part_id)
        .maybeSingle();
        
      if (error) return null;
      return data;
    },
    enabled: !!workOrder?.part_id,
  });

  // Check if template exists
  const { data: existingTemplate, isLoading: isCheckingTemplate } = useQuery({
    queryKey: ["operation-template", workOrder?.part_id, operation?.name],
    queryFn: async () => {
      if (!workOrder?.part_id || !operation?.name) return null;
      
      const { data, error } = await supabase
        .from("operation_templates")
        .select("*")
        .eq("part_id", workOrder.part_id)
        .eq("name", operation.name)
        .maybeSingle();
      
      if (error) return null;
      return data;
    },
    enabled: !!workOrder?.part_id && !!operation?.name && !!part,
  });

  // Handle loading states
  const isLoading = isLoadingWorkOrder || isLoadingPart || isCheckingTemplate;
  
  // Don't show if we're still loading
  if (isLoading) {
    return (
      <Card className="border-dashed border-yellow-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <SaveAll className="mr-2 h-5 w-5 text-yellow-500" />
            Loading work order information...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  // Show error if work order not found
  if (workOrderError || !workOrder) {
    return (
      <Card className="border-dashed border-red-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Could not load work order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to find work order information. Template saving is disabled.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Show error if part not found
  if (!workOrder.part_id || !part) {
    return (
      <Card className="border-dashed border-yellow-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            Cannot save template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This work order does not have a valid part associated with it. Operation templates must be linked to a part.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-dashed border-yellow-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <SaveAll className="mr-2 h-5 w-5 text-yellow-500" />
          Save as Operation Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Save this operation's current configuration as a template for future work orders using this part.
        </p>
        
        {existingTemplate && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-900">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              A template with this name already exists for this part. Saving will update the existing template.
            </p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
          onClick={() => setIsDialogOpen(true)}
        >
          <SaveAll className="mr-2 h-4 w-4" />
          Save as Template
        </Button>
      </CardContent>
      
      {/* Use the new EditTemplateDialog component */}
      <EditTemplateDialog
        operation={operation}
        workOrderId={workOrderId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        existingTemplate={existingTemplate}
      />
    </Card>
  );
}
