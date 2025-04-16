
import { z } from "zod";

export const workOrderSchema = z.object({
  workOrderNumber: z.string().optional(),
  purchaseOrderNumber: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  partId: z.string().min(1, "Part is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  status: z.enum(["Not Started", "In Progress", "QC", "Complete", "Shipped"]).default("Not Started"),
  priority: z.enum(["Low", "Normal", "High", "Critical"]).default("Normal"),
  startDate: z.date().optional(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
});

export type WorkOrderFormData = z.infer<typeof workOrderSchema>;
