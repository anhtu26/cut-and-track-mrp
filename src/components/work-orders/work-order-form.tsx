
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CreateWorkOrderInput, UpdateWorkOrderInput, WorkOrder } from "@/types/work-order";
import { workOrderSchema, WorkOrderFormData } from "./work-order-form/work-order-schema";
import { WorkOrderFormContent } from "./work-order-form/work-order-form-content";

interface WorkOrderFormProps {
  initialData?: WorkOrder | { customerId: string; partId: string };
  onSubmit: (data: CreateWorkOrderInput | UpdateWorkOrderInput) => Promise<void>;
  isSubmitting: boolean;
}

export function WorkOrderForm({ initialData, onSubmit, isSubmitting }: WorkOrderFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const defaultValues: Partial<WorkOrderFormData> = {
    workOrderNumber: (initialData as WorkOrder)?.workOrderNumber || "",
    purchaseOrderNumber: (initialData as WorkOrder)?.purchaseOrderNumber || "",
    customerId: initialData?.customerId || "",
    partId: initialData?.partId || "",
    quantity: (initialData as WorkOrder)?.quantity || 1,
    status: (initialData as WorkOrder)?.status || "Not Started",
    priority: (initialData as WorkOrder)?.priority || "Normal",
    startDate: (initialData as WorkOrder)?.startDate ? new Date((initialData as WorkOrder).startDate) : undefined,
    dueDate: (initialData as WorkOrder)?.dueDate ? new Date((initialData as WorkOrder).dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedToId: (initialData as WorkOrder)?.assignedTo?.id || "",
    notes: (initialData as WorkOrder)?.notes || "",
    useOperationTemplates: true,
  };

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues,
  });

  const handleSubmit = async (data: WorkOrderFormData) => {
    setSubmitError(null);
    try {
      const formattedData = {
        ...(initialData && 'id' in initialData ? { id: initialData.id } : {}),
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
          isEditMode={'id' in (initialData || {})}
        />

        {submitError && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : 'id' in (initialData || {}) ? "Update Work Order" : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
