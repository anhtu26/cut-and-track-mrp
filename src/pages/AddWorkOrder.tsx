
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateWorkOrderInput } from "@/types/work-order";
import { WorkOrderStatus, WorkOrderPriority } from "@/types/work-order-status";

export default function AddWorkOrder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: createWorkOrderMutation, isPending } = useMutation({
    mutationFn: async (data: CreateWorkOrderInput) => {
      console.log("Submitting work order data to Supabase:", data);
      
      // Generate a work order number if not provided
      const workOrderNumber = data.workOrderNumber || `WO-${Date.now().toString().slice(-6)}`;
      
      // Validate and process data
      const workOrderData = {
        work_order_number: workOrderNumber,
        purchase_order_number: data.purchaseOrderNumber || null,
        customer_id: data.customerId,
        part_id: data.partId,
        quantity: data.quantity,
        status: (data.status || "Not Started") as WorkOrderStatus,
        priority: (data.priority || "Normal") as WorkOrderPriority,
        start_date: data.startDate || null,
        due_date: data.dueDate,
        assigned_to_id: data.assignedToId || null,
        notes: data.notes || null,
        archived: false
      };

      const { data: insertData, error } = await supabase
        .from("work_orders")
        .insert([workOrderData])
        .select();

      if (error) {
        console.error("Supabase error creating work order:", error);
        throw error;
      }
      
      console.log("Work order created successfully:", insertData);
      return insertData;
    },
    onSuccess: (data) => {
      console.log("Work order created successfully:", data);
      toast.success("Work order created successfully");
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      navigate("/work-orders");
    },
    onError: (error: any) => {
      console.error("Error creating work order:", error);
      let errorMessage = "Failed to create work order";
      
      // Check for specific error messages from Supabase
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  });

  // Wrapper function to handle the type mismatch
  const handleSubmit = async (data: CreateWorkOrderInput): Promise<void> => {
    await createWorkOrderMutation(data);
    // Return void to satisfy the type requirements
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to="/work-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Work Order</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrderForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
