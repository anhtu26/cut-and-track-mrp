import { z } from "zod";

// Work order statuses and priority
export const workOrderStatuses = ["Not Started", "In Progress", "QC", "Complete", "Shipped"] as const;
export const workOrderPriorities = ["Low", "Normal", "High", "Urgent", "Critical"] as const;

export const workOrderSchema = z.object({
  workOrderNumber: z.string().optional(),
  purchaseOrderNumber: z.string().optional().nullable(),
  customerId: z.string({
    required_error: "Customer is required",
  }).min(1, "Customer is required"),
  partId: z.string({
    required_error: "Part is required",
  }).min(1, "Part is required"),
  quantity: z.coerce
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .min(1, "Quantity must be at least 1")
    .int("Quantity must be a whole number"),
  status: z.enum(workOrderStatuses).default("Not Started"),
  priority: z.enum(workOrderPriorities).default("Normal"),
  startDate: z.date().optional().nullable(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  useOperationTemplates: z.boolean().default(true),
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

// Export schemas for reuse in API validation
export const createWorkOrderSchema = workOrderSchema.extend({
  workOrderNumber: z.string().optional(),
  // Format dates as strings for API
  startDate: z.string().optional().nullable(),
  dueDate: z.string(), 
});

export const updateWorkOrderSchema = createWorkOrderSchema.extend({
  id: z.string(),
  partId: z.string().optional(), // Make part optional for updates
}).partial().required({ id: true }); // All fields except ID are optional for updates

export type CreateWorkOrderSchemaValues = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderSchemaValues = z.infer<typeof updateWorkOrderSchema>;
