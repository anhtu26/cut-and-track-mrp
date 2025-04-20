
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UpdateOperationInput } from "@/types/operation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { OperationForm } from "@/components/operations/operation-form";
import { useOperation } from "@/hooks/useOperation";

export default function EditOperation() {
  const { workOrderId, operationId } = useParams<{ workOrderId: string, operationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: operation, isLoading, error } = useOperation(operationId);

  const updateMutation = useMutation({
    mutationFn: async (updatedOperation: UpdateOperationInput) => {
      console.log("[UPDATE OPERATION] Updating with data:", updatedOperation);
      
      const operationData = {
        name: updatedOperation.name,
        description: updatedOperation.description || null,
        status: updatedOperation.status,
        machining_methods: updatedOperation.machiningMethods || null,
        setup_instructions: updatedOperation.setupInstructions || null,
        sequence: updatedOperation.sequence,
        estimated_start_time: updatedOperation.estimatedStartTime || null,
        estimated_end_time: updatedOperation.estimatedEndTime || null,
        actual_start_time: updatedOperation.actualStartTime || null,
        actual_end_time: updatedOperation.actualEndTime || null,
        comments: updatedOperation.comments || null,
        assigned_to_id: updatedOperation.assignedToId || null,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from("operations")
        .update(operationData)
        .eq("id", operationId)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Operation updated successfully");
      queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
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
