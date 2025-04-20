
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "@/types/operation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { SaveAll, AlertTriangle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface SaveAsTemplateButtonProps {
  operation: Operation;
  workOrderId: string;
}

export function SaveAsTemplateButton({ operation, workOrderId }: SaveAsTemplateButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch work order to get part ID
  const { data: workOrder } = useQuery({
    queryKey: ["work-order", workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("part_id")
        .eq("id", workOrderId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId,
  });

  // Check if template exists
  const { data: existingTemplate, isLoading: isCheckingTemplate } = useQuery({
    queryKey: ["operation-template", workOrder?.part_id, operation.name],
    queryFn: async () => {
      if (!workOrder?.part_id) return null;
      
      const { data, error } = await supabase
        .from("operation_templates")
        .select("*")
        .eq("part_id", workOrder.part_id)
        .eq("name", operation.name)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!workOrder?.part_id && !!operation.name,
  });

  const { mutateAsync: saveAsTemplate, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!workOrder?.part_id) throw new Error("Part ID is required");
      
      // Prepare template data
      const templateData = {
        name: operation.name,
        description: operation.description || null,
        machining_methods: operation.machiningMethods || null,
        setup_instructions: operation.setupInstructions || null,
        sequence: operation.sequence,
        estimated_duration: operation.actualEndTime && operation.actualStartTime 
          ? Math.round((new Date(operation.actualEndTime).getTime() - new Date(operation.actualStartTime).getTime()) / (1000 * 60))
          : null,
        part_id: workOrder.part_id,
      };
      
      console.log("Saving operation as template:", templateData);
      
      let result;
      
      if (existingTemplate?.id) {
        // Update existing template
        const { data, error } = await supabase
          .from("operation_templates")
          .update(templateData)
          .eq("id", existingTemplate.id)
          .select();
        
        if (error) throw error;
        result = { data, updated: true };
      } else {
        // Create new template
        const { data, error } = await supabase
          .from("operation_templates")
          .insert(templateData)
          .select();
        
        if (error) throw error;
        result = { data, updated: false };
      }
      
      return result;
    },
    onSuccess: (result) => {
      if (result.updated) {
        toast.success("Operation template updated successfully");
      } else {
        toast.success("Operation saved as template");
      }
      
      queryClient.invalidateQueries({ queryKey: ["part", workOrder?.part_id] });
      setIsDialogOpen(false);
      setIsConfirmed(false);
    },
    onError: (error: any) => {
      console.error("Error saving operation as template:", error);
      toast.error(`Failed to save template: ${error.message || "Unknown error"}`);
    },
  });

  // Don't show if we can't determine the part ID
  if (!workOrder?.part_id) return null;
  
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
          disabled={isSaving || isCheckingTemplate}
        >
          <SaveAll className="mr-2 h-4 w-4" />
          Save as Template
        </Button>
      </CardContent>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Operation as Template</AlertDialogTitle>
            <AlertDialogDescription>
              {existingTemplate 
                ? "This will update the existing template with the current operation's configuration. Future work orders for this part will use this updated template."
                : "This will save the current operation configuration as a new template for this part. Future work orders for this part will use this template."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id="confirm"
                checked={isConfirmed} 
                onCheckedChange={(checked) => setIsConfirmed(checked === true)}
              />
              <label 
                htmlFor="confirm" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this will {existingTemplate ? "update" : "create"} a template for all future work orders
              </label>
            </div>
            
            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
              <p className="font-medium mb-1">Changes will include:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Operation name: {operation.name}</li>
                {operation.description && <li>Description</li>}
                {operation.machiningMethods && <li>Machining methods</li>}
                {operation.setupInstructions && <li>Setup instructions</li>}
                <li>Sequence: {operation.sequence}</li>
              </ul>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => saveAsTemplate()}
              disabled={!isConfirmed || isSaving}
              className="bg-primary"
            >
              {isSaving ? "Saving..." : (existingTemplate ? "Update Template" : "Save Template")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
