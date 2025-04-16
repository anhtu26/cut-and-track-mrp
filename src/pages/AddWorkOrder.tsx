
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateWorkOrderInput } from "@/types/work-order";
import { format } from "date-fns";

export default function AddWorkOrder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  
  // Create initial data object with only the properties needed for creation
  const [initialData, setInitialData] = useState({
    customerId: searchParams.get("customerId") || "",
    partId: searchParams.get("partId") || "",
  });

  const { mutateAsync: createWorkOrderMutation, isPending } = useMutation({
    mutationFn: async (formData: CreateWorkOrderInput) => {
      console.log("Creating work order with data:", formData);
      
      try {
        // Format dates for Supabase
        const workOrderData = {
          work_order_number: formData.workOrderNumber || `WO-${Date.now().toString().substring(7)}`,
          purchase_order_number: formData.purchaseOrderNumber || null,
          customer_id: formData.customerId,
          part_id: formData.partId,
          quantity: formData.quantity,
          status: formData.status || "Not Started",
          priority: formData.priority || "Normal",
          start_date: formData.startDate || null,
          due_date: formData.dueDate,
          assigned_to_id: formData.assignedToId || null,
          notes: formData.notes || null
        };
        
        // Insert the work order first
        const { data: workOrder, error: workOrderError } = await supabase
          .from('work_orders')
          .insert(workOrderData)
          .select()
          .single();
          
        if (workOrderError) throw workOrderError;
        
        console.log("Work order created:", workOrder);
        
        // If using operation templates, fetch them and create operations
        if (formData.useOperationTemplates) {
          console.log("Fetching operation templates for part:", formData.partId);
          
          const { data: templates, error: templatesError } = await supabase
            .from('operation_templates')
            .select('*')
            .eq('part_id', formData.partId)
            .order('sequence', { ascending: true });
            
          if (templatesError) throw templatesError;
          
          if (templates && templates.length > 0) {
            console.log("Found operation templates:", templates);
            
            // Create operations from templates
            const operations = templates.map((template) => ({
              work_order_id: workOrder.id,
              name: template.name,
              description: template.description,
              status: "Not Started",
              machining_methods: template.machining_methods,
              setup_instructions: template.setup_instructions,
              estimated_start_time: null, // Can be calculated if needed
              estimated_end_time: null, // Can be calculated if needed
            }));
            
            console.log("Creating operations:", operations);
            const { data: createdOps, error: opsError } = await supabase
              .from('operations')
              .insert(operations);
              
            if (opsError) {
              console.error("Error creating operations:", opsError);
              // We'll continue even if operation creation fails
              toast.error("Work order created, but failed to add operations");
            } else {
              console.log("Operations created successfully");
            }
          } else {
            console.log("No operation templates found for part");
          }
        }
        
        return workOrder;
      } catch (error) {
        console.error("Error in transaction:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Work order created successfully:", data);
      toast.success("Work order created successfully");
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      navigate(`/work-orders/${data.id}`);
    },
    onError: (error: any) => {
      console.error("Error creating work order:", error);
      let errorMessage = "Failed to create work order";
      
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  });

  // Handle form submission by passing to the mutation
  const handleSubmit = async (data: CreateWorkOrderInput): Promise<void> => {
    await createWorkOrderMutation(data);
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
          <WorkOrderForm 
            initialData={initialData as any} 
            onSubmit={handleSubmit} 
            isSubmitting={isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
