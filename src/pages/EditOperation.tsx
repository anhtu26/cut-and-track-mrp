
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { OperationForm } from "@/components/operations/operation-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Operation, UpdateOperationInput } from "@/types/operation";

export default function EditOperation() {
  const { workOrderId, operationId } = useParams<{ workOrderId: string, operationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch operation data
  const { data: operation, isLoading, error } = useQuery({
    queryKey: ["operation", operationId],
    queryFn: async () => {
      if (!operationId) throw new Error("Operation ID is required");
      
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .eq('id', operationId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Operation not found");
      
      return {
        id: data.id,
        workOrderId: data.work_order_id,
        name: data.name,
        description: data.description || "",
        status: data.status,
        machiningMethods: data.machining_methods || "",
        setupInstructions: data.setup_instructions || "",
        estimatedStartTime: data.estimated_start_time,
        estimatedEndTime: data.estimated_end_time,
        actualStartTime: data.actual_start_time,
        actualEndTime: data.actual_end_time,
        comments: data.comments || "",
        assignedTo: data.assigned_to_id ? {
          id: data.assigned_to_id,
          name: "Unknown" // We would need to fetch operator names separately
        } : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        documents: []
      } as Operation;
    },
    enabled: !!operationId,
  });

  // Update operation mutation
  const { mutateAsync: updateOperation, isPending } = useMutation({
    mutationFn: async (data: UpdateOperationInput) => {
      console.log("Updating operation with data:", data);

      if (!operationId) throw new Error("Operation ID is required");
      
      // Format operation data for Supabase
      const operationData = {
        name: data.name,
        description: data.description || null,
        status: data.status,
        machining_methods: data.machiningMethods || null,
        setup_instructions: data.setupInstructions || null,
        estimated_start_time: data.estimatedStartTime || null,
        estimated_end_time: data.estimatedEndTime || null,
        assigned_to_id: data.assignedToId || null,
        comments: data.comments || null,
      };
      
      console.log("Formatted operation data for update:", operationData);

      const { data: updatedOperation, error } = await supabase
        .from('operations')
        .update(operationData)
        .eq('id', operationId)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to update operation");
      }
      
      console.log("Successfully updated operation:", updatedOperation);
      return updatedOperation;
    },
    onSuccess: () => {
      toast.success("Operation updated successfully");
      queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
      navigate(`/work-orders/${workOrderId}/operations/${operationId}`);
    },
    onError: (error: any) => {
      console.error("Error updating operation:", error);
      toast.error(error.message || "Failed to update operation");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading operation details...</p>
      </div>
    );
  }

  if (error || !operation) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-destructive">
          Error loading operation: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!workOrderId) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-destructive">Work Order ID is required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to={`/work-orders/${workOrderId}/operations/${operationId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Operation
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <OperationForm
            initialData={operation}
            workOrderId={workOrderId}
            onSubmit={updateOperation}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
