import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateWorkOrderInput, WorkOrder } from "@/types/work-order";
import { useState } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function EditWorkOrder() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadError, setLoadError] = useState<string | null>(null);

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
          setLoadError(error.message);
          throw error;
        }
        
        console.log("[EDIT LOAD] Supabase result:", data);
        
        if (!data) {
          console.error("[EDIT LOAD ERROR] No work order found with ID:", workOrderId);
          setLoadError("Work Order not found");
          throw new Error("Work Order not found");
        }

        // Validate the required fields exist before attempting to transform
        if (!data.customer) {
          console.error("[EDIT LOAD ERROR] Work order missing customer data");
          setLoadError("Work order data is incomplete: missing customer information");
          throw new Error("Work order data is incomplete: missing customer information");
        }

        if (!data.part) {
          console.error("[EDIT LOAD ERROR] Work order missing part data");
          setLoadError("Work order data is incomplete: missing part information");
          throw new Error("Work order data is incomplete: missing part information");
        }
        
        // Transform the database response to match our WorkOrder interface
        return {
          id: data.id,
          workOrderNumber: data.work_order_number,
          purchaseOrderNumber: data.purchase_order_number,
          customer: {
            id: data.customer?.id || '',
            name: data.customer?.name || 'Unknown',
            company: data.customer?.company || '',
            email: data.customer?.email || '',
            phone: data.customer?.phone || '',
            address: data.customer?.address || '',
            active: data.customer?.active || false,
            notes: data.customer?.notes || '',
            createdAt: data.customer?.created_at || '',
            updatedAt: data.customer?.updated_at || '',
            orderCount: data.customer?.order_count || 0
          },
          customerId: data.customer_id,
          part: {
            id: data.part?.id || '',
            name: data.part?.name || 'Unknown Part',
            partNumber: data.part?.part_number || '',
            description: data.part?.description || '',
            active: data.part?.active || false,
            materials: data.part?.materials || [],
            setupInstructions: data.part?.setup_instructions || '',
            machiningMethods: data.part?.machining_methods || '',
            revisionNumber: data.part?.revision_number || '',
            createdAt: data.part?.created_at || '',
            updatedAt: data.part?.updated_at || '',
            documents: [],
            archived: data.part?.archived || false,
            archivedAt: data.part?.archived_at || '',
            archiveReason: data.part?.archive_reason || ''
          },
          partId: data.part_id,
          quantity: data.quantity || 1,
          status: data.status || 'Not Started',
          priority: data.priority || 'Normal',
          createdAt: data.created_at || '',
          updatedAt: data.updated_at || '',
          startDate: data.start_date || null,
          dueDate: data.due_date || new Date().toISOString(),
          completedDate: data.completed_date || null,
          assignedTo: data.assigned_to_id ? {
            id: data.assigned_to_id,
            name: data.assigned_to_name || "Unknown"
          } : undefined,
          notes: data.notes || '',
          operations: Array.isArray(data.operations) ? data.operations.map((op: any) => ({
            id: op.id,
            workOrderId: op.work_order_id,
            name: op.name || '',
            description: op.description || "",
            status: op.status || 'Not Started',
            machiningMethods: op.machining_methods || "",
            setupInstructions: op.setup_instructions || "",
            sequence: op.sequence || 0,
            isCustom: op.is_custom || false,
            estimatedStartTime: op.estimated_start_time || null,
            estimatedEndTime: op.estimated_end_time || null,
            actualStartTime: op.actual_start_time || null,
            actualEndTime: op.actual_end_time || null,
            comments: op.comments || '',
            assignedTo: op.assigned_to_id ? {
              id: op.assigned_to_id,
              name: "Unknown" // We would need to fetch operator names separately
            } : undefined,
            createdAt: op.created_at || '',
            updatedAt: op.updated_at || '',
            documents: []
          })) : [],
          archived: data.archived || false,
          archivedAt: data.archived_at || null,
          archiveReason: data.archive_reason || '',
          useOperationTemplates: data.use_operation_templates !== undefined ? data.use_operation_templates : true,
        } as WorkOrder;
      } catch (error) {
        console.error("[EDIT LOAD ERROR]", error);
        if (error instanceof Error) {
          setLoadError(error.message);
        } else {
          setLoadError("Unknown error occurred");
        }
        throw error;
      }
    },
    enabled: !!workOrderId,
    retry: 1, // Only retry once to avoid excessive retries on auth issues
    staleTime: 30000, // 30 seconds
    // Instead of using onError directly, use onSettled or handle it in the queryFn
    meta: {
      errorHandler: (error: any) => {
        console.error("Error in work order query:", error);
        setLoadError(error.message || "Failed to load work order");
      }
    }
  });

  // Call the error handler from meta once we have the error
  if (error && workOrder === undefined) {
    console.error("Error in work order query:", error);
    const errorHandler = (error as any).meta?.errorHandler;
    if (typeof errorHandler === 'function') {
      errorHandler(error);
    } else {
      setLoadError(error instanceof Error ? error.message : "Failed to load work order");
    }
  }

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

  const handleSubmit = async (data: UpdateWorkOrderInput) => {
    try {
      await updateWorkOrderMutation(data);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      if (error instanceof Error) {
        toast.error(`Failed to update work order: ${error.message}`);
      } else {
        toast.error("An unknown error occurred while updating");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading work order details...</p>
      </div>
    );
  }

  if (error || loadError || !workOrder) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading work order: {(error instanceof Error ? error.message : loadError) || "Unknown error"}
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
          <ErrorBoundary fallback={
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Form</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                There was an error loading the form. Please try refreshing the page or contact support.
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
            <WorkOrderForm 
              initialData={workOrder} 
              onSubmit={handleSubmit} 
              isSubmitting={isPending} 
            />
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
