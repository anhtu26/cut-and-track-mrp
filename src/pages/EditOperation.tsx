
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { OperationForm } from "@/components/operations/operation-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateOperationInput } from "@/types/operation";

export default function EditOperation() {
  const { workOrderId, operationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch operation data
  const { data: operation, isLoading, error } = useQuery({
    queryKey: ["operation", operationId],
    queryFn: async () => {
      if (!operationId) {
        throw new Error("Operation ID is required");
      }

      const { data, error } = await supabase
        .from("operations")
        .select("*")
        .eq("id", operationId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Operation not found");
      }

      return {
        id: data.id,
        workOrderId: data.work_order_id,
        name: data.name,
        description: data.description || "",
        status: data.status,
        machiningMethods: data.machining_methods || "",
        setupInstructions: data.setup_instructions || "",
        sequence: data.sequence || 0, // Map sequence
        isCustom: data.is_custom || false, // Map isCustom
        estimatedStartTime: data.estimated_start_time,
        estimatedEndTime: data.estimated_end_time,
        actualStartTime: data.actual_start_time,
        actualEndTime: data.actual_end_time,
        assignedToId: data.assigned_to_id,
        comments: data.comments,
      };
    },
    enabled: !!operationId,
  });

  // Update operation mutation
  const { mutateAsync: updateOperation, isPending } = useMutation({
    mutationFn: async (data: UpdateOperationInput) => {
      if (!operationId) {
        throw new Error("Operation ID is required");
      }

      // Format operation data for Supabase
      const operationData = {
        name: data.name,
        description: data.description || null,
        status: data.status,
        machining_methods: data.machiningMethods || null,
        setup_instructions: data.setupInstructions || null,
        sequence: data.sequence, // Include sequence in update
        is_custom: data.isCustom || null, // Include isCustom in update
        estimated_start_time: data.estimatedStartTime || null,
        estimated_end_time: data.estimatedEndTime || null,
        actual_start_time: data.actualStartTime || null,
        actual_end_time: data.actualEndTime || null,
        assigned_to_id: data.assignedToId || null,
        comments: data.comments || null,
      };

      const { data: updatedOperation, error } = await supabase
        .from("operations")
        .update(operationData)
        .eq("id", operationId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to update operation");
      }

      return updatedOperation;
    },
    onSuccess: () => {
      toast.success("Operation updated successfully");
      queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
      navigate(`/work-orders/${workOrderId}`);
    },
    onError: (error: any) => {
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
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading operation: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button asChild variant="outline">
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
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to={`/work-orders/${workOrderId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Order
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <OperationForm
            workOrderId={workOrderId!}
            operation={operation}
            onSubmit={updateOperation}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
