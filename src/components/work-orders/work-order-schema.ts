
import { z } from "zod";
import { WorkOrderStatus, WorkOrderPriority } from "@/types/work-order-status";

// Define string literal types for status and priority
const statusValues = ["Not Started", "In Progress", "QC", "Complete", "Shipped"] as const;
const priorityValues = ["Low", "Normal", "High", "Urgent", "Critical"] as const;

export const workOrderSchema = z.object({
  workOrderNumber: z.string().optional(),
  purchaseOrderNumber: z.string().optional().nullable(),
  customerId: z.string().min(1, "Customer is required"),
  partId: z.string().min(1, "Part is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  status: z.enum(statusValues).optional().default("Not Started"),
  priority: z.enum(priorityValues).optional().default("Normal"),
  startDate: z.date().optional().nullable(),
  dueDate: z.date(),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  useOperationTemplates: z.boolean().optional().default(true),
});

export const updateWorkOrderSchema = workOrderSchema.partial().extend({
  id: z.string()
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;
export type UpdateWorkOrderFormValues = z.infer<typeof updateWorkOrderSchema>;
