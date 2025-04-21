
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CreateWorkOrderInput, UpdateWorkOrderInput, WorkOrder } from "@/types/work-order";
import { workOrderSchema, WorkOrderFormValues } from "@/components/work-orders/work-order-schema";
import { WorkOrderFormContent } from "./work-order-form/work-order-form-content";
import { toast } from "@/components/ui/sonner";

interface WorkOrderFormProps {
  initialData?: Partial<WorkOrder>; // Allow partial work order for initialization
  onSubmit: (data: CreateWorkOrderInput | UpdateWorkOrderInput) => Promise<void>;
  isSubmitting: boolean;
}

export function WorkOrderForm({ initialData, onSubmit, isSubmitting }: WorkOrderFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditMode = !!initialData?.id;
  
  // Explicitly handle the useOperationTemplates with a default value
  const defaultValues: Partial<WorkOrderFormValues> = {
    workOrderNumber: initialData?.workOrderNumber || "",
    purchaseOrderNumber: initialData?.purchaseOrderNumber || "",
    customerId: initialData?.customerId || "",
    partId: initialData?.partId || "",
    quantity: initialData?.quantity || 1,
    status: initialData?.status || "Not Started",
    priority: initialData?.priority || "Normal",
    startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedToId: initialData?.assignedTo?.id || "",
    notes: initialData?.notes || "",
    useOperationTemplates: initialData?.useOperationTemplates !== undefined ? initialData.useOperationTemplates : true,
  };

  // Check if work order status allows changing the part
  const canChangePartId = !isEditMode || initialData?.status === "Not Started";

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues,
  });

  // Helper functions for type conversion
  const formValuesToCreateWorkOrderInput = (data: WorkOrderFormValues): CreateWorkOrderInput => {
    return {
      workOrderNumber: data.workOrderNumber,
      purchaseOrderNumber: data.purchaseOrderNumber,
      customerId: data.customerId,
      partId: data.partId,
      quantity: data.quantity,
      status: data.status,
      priority: data.priority,
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : undefined,
      dueDate: format(data.dueDate, "yyyy-MM-dd"),
      assignedToId: data.assignedToId,
      notes: data.notes,
      useOperationTemplates: data.useOperationTemplates,
    };
  };

  const formValuesToUpdateWorkOrderInput = (data: WorkOrderFormValues, id: string): UpdateWorkOrderInput => {
    // For work orders that are in progress or beyond, prevent changing the part
    const partId = !canChangePartId ? initialData?.partId : data.partId;
    
    if (!canChangePartId && partId !== initialData?.partId) {
      toast.warning("Cannot change part for work orders that are in progress");
    }

    return {
      id,
      workOrderNumber: data.workOrderNumber,
      purchaseOrderNumber: data.purchaseOrderNumber,
      customerId: data.customerId,
      partId: partId,
      quantity: data.quantity,
      status: data.status,
      priority: data.priority,
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : undefined,
      dueDate: format(data.dueDate, "yyyy-MM-dd"),
      assignedToId: data.assignedToId,
      notes: data.notes,
      useOperationTemplates: data.useOperationTemplates,
    };
  };

  const handleSubmit = async (data: WorkOrderFormValues) => {
    setSubmitError(null);
    try {
      let formattedData;
      
      if (isEditMode && initialData?.id) {
        // Edit mode - create UpdateWorkOrderInput
        formattedData = formValuesToUpdateWorkOrderInput(data, initialData.id);
      } else {
        // Create mode - create CreateWorkOrderInput
        formattedData = formValuesToCreateWorkOrderInput(data);
      }
      
      await onSubmit(formattedData);
    } catch (error: any) {
      console.error("Form submission error:", error);
      setSubmitError(error.message || "Failed to submit form");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <WorkOrderFormContent 
          form={form} 
          initialData={initialData} 
          isSubmitting={isSubmitting} 
          isEditMode={isEditMode}
        />

        {!canChangePartId && (
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-4 rounded-md text-sm">
            <p className="font-medium">Note:</p>
            <p>Once a work order is in progress, the part cannot be changed. To use a different part, please create a new work order.</p>
          </div>
        )}

        {submitError && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update Work Order" : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
