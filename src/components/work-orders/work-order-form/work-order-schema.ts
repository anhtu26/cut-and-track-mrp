import { z } from "zod";

// Define a schema with more robust validation
export const workOrderSchema = z.object({
  workOrderNumber: z.string().optional(),
  purchaseOrderNumber: z.string().optional().nullable(),
  customerId: z.string().min(1, "Customer is required"),
  partId: z.string().min(1, "Part is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  status: z.enum(["Not Started", "In Progress", "QC", "Complete", "Shipped"]).default("Not Started"),
  priority: z.enum(["Low", "Normal", "High", "Urgent", "Critical"]).default("Normal"),
  startDate: z.date().optional().nullable(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  useOperationTemplates: z.boolean().default(true)
});

// Export a consistent type name (WorkOrderFormValues) to match imports in other files
export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;
