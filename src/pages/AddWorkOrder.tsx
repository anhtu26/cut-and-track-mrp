import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";
import { apiClient } from '@/lib/api/client';;
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createWorkOrderSchema, CreateWorkOrderSchemaValues } from "@/components/work-orders/work-order-schema";

// EMERGENCY FIX: Global error handler to prevent blank page
function SafeRender({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Critical render error:", error);
    return (
      <div className="p-6 border border-red-300 rounded-md bg-red-50 text-red-800">
        <h3 className="text-lg font-bold mb-2">Critical Error</h3>
        <p>The application encountered a critical error. Please try refreshing the page.</p>
      </div>
    );
  }
}

export default function AddWorkOrder() {
  // EMERGENCY FIX: Wrap entire component with try/catch
  try {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    
    const [initialData, setInitialData] = useState({
      customerId: searchParams.get("customerId") || "",
      partId: searchParams.get("partId") || "",
    });

    const { mutateAsync: createWorkOrderMutation, isPending } = useMutation({
      mutationFn: async (formData: CreateWorkOrderSchemaValues) => {
        console.log("Creating work order with data:", formData);
        
        try {
          // Validate the input data using Zod
          const validated = createWorkOrderSchema.parse(formData);

          // Map to database field names
          const workOrderData = {
            work_order_number: validated.workOrderNumber || `WO-${Date.now().toString().substring(7)}`,
            purchase_order_number: validated.purchaseOrderNumber || null,
            customer_id: validated.customerId,
            part_id: validated.partId,
            quantity: validated.quantity,
            status: validated.status || "Not Started",
            priority: validated.priority || "Normal",
            start_date: validated.startDate || null,
            due_date: validated.dueDate,
            assigned_to_id: validated.assignedToId || null,
            notes: validated.notes || null,
            use_operation_templates: validated.useOperationTemplates ?? true
          };
          
          // Insert the work order
          const { data: workOrder, error: workOrderError } = await supabase
            .from('work_orders')
            .insert(workOrderData)
            .select()
            .single();
            
          if (workOrderError) {
            console.error("Error creating work order:", workOrderError);
            throw new Error(`Failed to create work order: ${workOrderError.message}`);
          }
          
          console.log("Work order created:", workOrder);
          
          // If operation templates should be used, fetch and create them
          if (validated.useOperationTemplates) {
            console.log("Fetching operation templates for part:", validated.partId);
            
            const { data: templates, error: templatesError } = await supabase
              .from('operation_templates')
              .select('*')
              .eq('part_id', validated.partId)
              .order('sequence', { ascending: true });
              
            if (templatesError) {
              console.error("Error fetching templates:", templatesError);
              throw new Error(`Failed to fetch operation templates: ${templatesError.message}`);
            }
            
            if (templates && templates.length > 0) {
              console.log("Found operation templates:", templates);
              
              // Map to operations insert data
              const operations = templates.map((template) => ({
                work_order_id: workOrder.id,
                name: template.name,
                description: template.description,
                status: "Not Started",
                machining_methods: template.machining_methods,
                setup_instructions: template.setup_instructions,
                sequence: template.sequence || 0,
                is_custom: false,
                estimated_start_time: null,
                estimated_end_time: null,
              }));
              
              console.log("Creating operations:", operations);
              const { data: createdOps, error: opsError } = await supabase
                .from('operations')
                .insert(operations);
                
              if (opsError) {
                console.error("Error creating operations:", opsError);
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

    const handleSubmit = async (data: CreateWorkOrderSchemaValues): Promise<void> => {
      try {
        await createWorkOrderMutation(data);
      } catch (error) {
        // Error already handled in the mutation
        console.error("Submit handler caught error:", error);
      }
    };

    return (
      <SafeRender>
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
      </SafeRender>
    );
  } catch (error) {
    // EMERGENCY FALLBACK: Last resort to prevent blank screen
    console.error("CRITICAL RENDERING ERROR:", error);
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 border rounded-md bg-red-50 text-red-900">
        <h2 className="text-xl font-bold mb-4">Error Loading Work Order Form</h2>
        <p className="mb-4">We encountered a critical error while trying to load the work order form.</p>
        <p className="mb-6">Please try again or contact technical support if this error persists.</p>
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }
}
