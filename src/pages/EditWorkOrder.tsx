import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateWorkOrderInput, WorkOrder } from "@/types/work-order";

export default function EditWorkOrder() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch work order data
  const { data: workOrder, isLoading, error } = useQuery({
    queryKey: ["work-order", workOrderId],
    queryFn: async () => {
      if (!workOrderId) {
        console.error("[EDIT LOAD ERROR] Work Order ID is missing");
        throw new Error("Work Order ID is required");
      }
      
      console.log("[EDIT LOAD] Requested work order ID:", workOrderId);
      
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customer:customers(*),
            part:parts(*),
            operations:operations(*)
          `)
          .eq('id', workOrderId)
          .maybeSingle();

        if (error) {
          console.error("[EDIT LOAD ERROR]", error);
          throw error;
        }
        
        console.log("[EDIT LOAD] Supabase result:", data);
        
        if (!data) {
          console.error("[EDIT LOAD ERROR] No work order found with ID:", workOrderId);
          throw new Error("Work Order not found");
        }
        
        // Transform the database response to match our WorkOrder interface
        return {
          id: data.id,
          workOrderNumber: data.work_order_number,
          purchaseOrderNumber: data.purchase_order_number,
          customer: {
            id: data.customer.id,
            name: data.customer.name,
            company: data.customer.company,
            email: data.customer.email,
            phone: data.customer.phone,
            address: data.customer.address,
            active: data.customer.active,
            notes: data.customer.notes,
            createdAt: data.customer.created_at,
            updatedAt: data.customer.updated_at,
            orderCount: data.customer.order_count || 0
          },
          customerId: data.customer_id,
          part: {
            id: data.part.id,
            name: data.part.name,
            partNumber: data.part.part_number,
            description: data.part.description,
            active: data.part.active,
            materials: data.part.materials || [],
            setupInstructions: data.part.setup_instructions,
            machiningMethods: data.part.machining_methods,
            revisionNumber: data.part.revision_number,
            createdAt: data.part.created_at,
            updatedAt: data.part.updated_at,
            documents: [],
            archived: data.part.archived,
            archivedAt: data.part.archived_at,
            archiveReason: data.part.archive_reason
          },
          partId: data.part_id,
          quantity: data.quantity,
          status: data.status,
          priority: data.priority,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          startDate: data.start_date,
          dueDate: data.due_date,
          completedDate: data.completed_date,
          assignedTo: data.assigned_to_id ? {
            id: data.assigned_to_id,
            name: data.assigned_to_name || "Unknown"
          } : undefined,
          notes: data.notes,
          operations: (data.operations || []).map((op: any) => ({
            id: op.id,
            workOrderId: op.work_order_id,
            name: op.name,
            description: op.description || "",
            status: op.status,
            machiningMethods: op.machining_methods || "",
            setupInstructions: op.setup_instructions || "",
            estimatedStartTime: op.estimated_start_time,
            estimatedEndTime: op.estimated_end_time,
            actualStartTime: op.actual_start_time,
            actualEndTime: op.actual_end_time,
            comments: op.comments,
            assignedTo: op.assigned_to_id ? {
              id: op.assigned_to_id,
              name: "Unknown" // We would need to fetch operator names separately
            } : undefined,
            createdAt: op.created_at,
            updatedAt: op.updated_at,
            documents: []
          })),
          archived: data.archived,
          archivedAt: data.archived_at,
          archiveReason: data.archive_reason
        } as WorkOrder;
      } catch (error) {
        console.error("[EDIT LOAD ERROR]", error);
        throw error;
      }
    },
    enabled: !!workOrderId,
  });

  // Update work order mutation
  const { mutateAsync: updateWorkOrderMutation, isPending } = useMutation({
    mutationFn: async (data: UpdateWorkOrderInput) => {
      console.log("Updating work order with data:", data);
      
      if (!workOrderId) throw new Error("Work Order ID is required");
      
      // Format work order data for Supabase
      const workOrderData = {
        work_order_number: data.workOrderNumber,
        purchase_order_number: data.purchaseOrderNumber || null,
        customer_id: data.customerId,
        part_id: data.partId,
        quantity: data.quantity,
        status: data.status,
        priority: data.priority,
        start_date: data.startDate || null,
        due_date: data.dueDate,
        completed_date: data.completedDate || null,
        assigned_to_id: data.assignedToId || null,
        notes: data.notes || null,
      };

      const { data: updatedData, error } = await supabase
        .from('work_orders')
        .update(workOrderData)
        .eq('id', workOrderId)
        .select();

      if (error) {
        console.error("Supabase error updating work order:", error);
        throw error;
      }
      
      console.log("Work order updated successfully:", updatedData);
      return updatedData;
    },
    onSuccess: () => {
      toast.success("Work order updated successfully");
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
      navigate(`/work-orders/${workOrderId}`);
    },
    onError: (error: any) => {
      console.error("Error updating work order:", error);
      let errorMessage = "Failed to update work order";
      
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  });

  // Create a wrapper function that conforms to the expected type
  const handleSubmit = async (data: UpdateWorkOrderInput) => {
    await updateWorkOrderMutation(data);
    // Return void explicitly
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading work order details...</p>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading work order: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button asChild variant="outline">
          <Link to="/work-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Link>
        </Button>
      </div>
    );
  }

  // Don't allow editing archived work orders
  if (workOrder.archived) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild size="sm">
          <Link to={`/work-orders/${workOrderId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Order
          </Link>
        </Button>
        
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold">This work order is archived</h2>
            <p className="text-muted-foreground mt-2">Archived work orders cannot be edited.</p>
            <Button asChild className="mt-4">
              <Link to={`/work-orders/${workOrderId}`}>
                View Work Order
              </Link>
            </Button>
          </CardContent>
        </Card>
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
          <CardTitle>Edit Work Order</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrderForm 
            initialData={workOrder} 
            onSubmit={handleSubmit} 
            isSubmitting={isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
