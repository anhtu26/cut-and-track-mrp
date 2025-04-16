
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { OperationForm } from "@/components/operations/operation-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateOperationInput } from "@/types/operation";

export default function AddOperation() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: createOperation, isPending } = useMutation({
    mutationFn: async (data: CreateOperationInput) => {
      console.log("Creating operation with data:", data);

      if (!workOrderId) throw new Error("Work Order ID is required");
      
      // Format operation data for Supabase
      const operationData = {
        work_order_id: workOrderId,
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
      
      console.log("Formatted operation data for insertion:", operationData);

      const { data: operation, error } = await supabase
        .from('operations')
        .insert([operationData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to create operation");
      }
      
      if (!operation) {
        throw new Error("No operation data returned from database");
      }
      
      console.log("Successfully created operation:", operation);
      return operation;
    },
    onSuccess: () => {
      toast.success("Operation created successfully");
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
      navigate(`/work-orders/${workOrderId}`);
    },
    onError: (error: any) => {
      console.error("Error creating operation:", error);
      toast.error(error.message || "Failed to create operation");
    },
  });

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
          <Link to={`/work-orders/${workOrderId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Order
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <OperationForm
            workOrderId={workOrderId}
            onSubmit={createOperation}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
