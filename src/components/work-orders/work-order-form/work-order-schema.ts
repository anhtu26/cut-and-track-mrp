
import { z } from "zod";

export const workOrderSchema = z.object({
  workOrderNumber: z.string().optional(),
  purchaseOrderNumber: z.string().optional().nullable(),
  customerId: z.string().min(1, "Customer is required"),
  partId: z.string().min(1, "Part is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  status: z.enum(["Not Started", "In Progress", "QC", "Complete", "Shipped"]).default("Not Started"),
  priority: z.enum(["Low", "Normal", "High", "Critical"]).default("Normal"),
  startDate: z.date().optional().nullable(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type WorkOrderFormData = z.infer<typeof workOrderSchema>;
