
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateOperationInput } from "@/types/operation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Save } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { OperationForm } from "@/components/operations/operation-form";
import { useOperation } from "@/hooks/useOperation";
import { updateOperation } from "@/lib/operation-service";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export default function EditOperation() {
  const { workOrderId, operationId } = useParams<{ workOrderId: string, operationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: operation, isLoading, error } = useOperation(operationId);
  const [syncToTemplate, setSyncToTemplate] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (updatedOperation: UpdateOperationInput) => {
      console.log("[UPDATE OPERATION] Updating with data:", updatedOperation);
      
      if (!operationId) {
        throw new Error("Operation ID is required");
      }
      
      // Use the centralized operation service for updates
      return await updateOperation(operationId, updatedOperation, {
        syncToTemplate: syncToTemplate
      });
    },
    onSuccess: () => {
      // Show different toast message based on sync option
      if (syncToTemplate) {
        toast.success("Operation updated and synced to part library");
        // Invalidate part queries to reflect template changes
        queryClient.invalidateQueries({ queryKey: ["part"] });
      } else {
        toast.success("Operation updated successfully");
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
      
      // Navigate back to work order
      navigate(`/work-orders/${workOrderId}`);
    },
    onError: (error: any) => {
      console.error("[UPDATE OPERATION ERROR]", error);
      toast.error(`Failed to update operation: ${error.message || "Unknown error"}`);
    },
  });

  const handleSubmit = async (data: UpdateOperationInput) => {
    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading operation details...</p>
      </div>
    );
  }

  if (error || !operation) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading operation: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button variant="outline" asChild>
          <Link to={`/work-orders/${workOrderId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Order
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link to={`/work-orders/${workOrderId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Work Order
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorBoundary fallback={
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Form</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                There was an error loading the operation form. Please try refreshing the page.
              </p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => navigate(`/work-orders/${workOrderId}`)}
              >
                Return to Work Order
              </Button>
            </div>
          }>
            {/* Add sync to template option */}
            <div className="mb-6 p-4 border rounded-md bg-amber-50 dark:bg-amber-950/20">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sync-to-template" 
                  checked={syncToTemplate}
                  onCheckedChange={(checked) => setSyncToTemplate(checked === true)}
                />
                <label 
                  htmlFor="sync-to-template" 
                  className="text-sm font-medium leading-none cursor-pointer flex items-center"
                >
                  <Save className="h-4 w-4 mr-2 text-amber-600" />
                  Save changes to Part Library template
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2 ml-6">
                When checked, any changes made to this operation will also update the corresponding template in the part library.
                This ensures consistency between work orders and the part library.
              </p>
            </div>
            
            <OperationForm
              workOrderId={workOrderId || ''}
              operation={operation}
              onSubmit={handleSubmit}
              isSubmitting={updateMutation.isPending}
            />
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
