
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CreateWorkOrderInput, UpdateWorkOrderInput, WorkOrder } from "@/types/work-order";
import { workOrderSchema, WorkOrderFormValues } from "@/components/work-orders/work-order-schema";
import { WorkOrderFormContent } from "./work-order-form/work-order-form-content";

interface WorkOrderFormProps {
  initialData?: any; // Allow any type for initialData to accommodate different use cases
  onSubmit: (data: CreateWorkOrderInput | UpdateWorkOrderInput) => Promise<void>;
  isSubmitting: boolean;
}

export function WorkOrderForm({ initialData, onSubmit, isSubmitting }: WorkOrderFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
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

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues,
  });

  const handleSubmit = async (data: WorkOrderFormValues) => {
    setSubmitError(null);
    try {
      const formattedData = {
        ...(initialData?.id ? { id: initialData.id } : {}),
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
          isEditMode={!!initialData?.id}
        />

        {submitError && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData?.id ? "Update Work Order" : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
