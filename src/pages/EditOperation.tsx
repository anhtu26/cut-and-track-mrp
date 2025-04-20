
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OperationStatus, UpdateOperationInput } from "@/types/operation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { OperationForm } from "@/components/operations/operation-form";

export default function EditOperation() {
  const { workOrderId, operationId } = useParams<{ workOrderId: string, operationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadError, setLoadError] = useState<string | null>(null);

  const { data: operation, isLoading, error } = useQuery({
    queryKey: ["operation", operationId],
    queryFn: async () => {
      if (!operationId) {
        console.error("[EDIT OPERATION] Missing operation ID");
        throw new Error("Operation ID is required");
      }
      
      try {
        console.log("[EDIT OPERATION] Fetching operation:", operationId);
        
        const { data, error } = await supabase
          .from("operations")
          .select(`
            *,
            documents:operation_documents(*)
          `)
          .eq("id", operationId)
          .maybeSingle();
        
        if (error) {
          console.error("[EDIT OPERATION ERROR]", error);
          setLoadError(error.message);
          throw error;
        }
        
        if (!data) {
          console.error("[EDIT OPERATION] Operation not found:", operationId);
          setLoadError("Operation not found");
          throw new Error("Operation not found");
        }
        
        console.log("[EDIT OPERATION] Fetched operation:", data);
        
        return {
          id: data.id,
          workOrderId: data.work_order_id,
          name: data.name,
          description: data.description || "",
          status: data.status as OperationStatus,
          machiningMethods: data.machining_methods || "",
          setupInstructions: data.setup_instructions || "",
          sequence: data.sequence || 0,
          isCustom: data.is_custom || false,
          estimatedStartTime: data.estimated_start_time,
          estimatedEndTime: data.estimated_end_time,
          actualStartTime: data.actual_start_time,
          actualEndTime: data.actual_end_time,
          comments: data.comments,
          assignedTo: data.assigned_to_id ? {
            id: data.assigned_to_id,
            name: "Unknown" // In a real app, we'd fetch the operator's name
          } : undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          documents: (data.documents || []).map(doc => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            type: doc.type,
            uploadedAt: doc.uploaded_at
          }))
        };
      } catch (error) {
        console.error("[EDIT OPERATION] Error fetching operation:", error);
        if (error instanceof Error) {
          setLoadError(error.message);
        } else {
          setLoadError("Unknown error occurred");
        }
        throw error;
      }
    },
    retry: 1,
    enabled: !!operationId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedOperation: UpdateOperationInput) => {
      console.log("[UPDATE OPERATION] Updating with data:", updatedOperation);
      
      // Format data for Supabase
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
      
      if (error) {
        console.error("[UPDATE OPERATION ERROR]", error);
        throw error;
      }
      
      console.log("[UPDATE OPERATION] Success:", data);
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

  if (error || loadError || !operation) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading operation: {(error instanceof Error ? error.message : loadError) || "Unknown error"}
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
