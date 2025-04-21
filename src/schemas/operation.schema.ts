import { z } from 'zod';

// Base schema for common fields
const baseOperationSchema = z.object({
  name: z.string().min(1, 'Operation name is required'),
  description: z.string().nullable().optional(),
  machiningMethods: z.string().nullable().optional(),
  setupInstructions: z.string().nullable().optional(),
  sequence: z.coerce.number().int().min(0, 'Sequence must be non-negative'),
});

// Schema for creating/updating Operation Templates
export const operationTemplateSchema = baseOperationSchema.extend({
  partId: z.string().uuid('Invalid Part ID format'),
  estimatedDuration: z.coerce
    .number()
    .min(0, 'Estimated duration cannot be negative')
    .nullable()
    .optional(),
});

export type OperationTemplateInput = z.infer<typeof operationTemplateSchema>;

// Enum for Operation Status (derive from existing type if possible, else define here)
export const operationStatusEnum = z.enum([
  'Not Started',
  'In Progress',
  'QC',
  'Complete',
]);

// Schema for creating Operations (often derived from templates)
export const createOperationSchema = baseOperationSchema.extend({
  workOrderId: z.string().uuid('Invalid Work Order ID format'),
  status: operationStatusEnum.default('Not Started'),
  isCustom: z.boolean().optional().default(false),
  // Omitting estimatedDuration as it's template-specific
  // Omitting runtime fields like actual times, comments, assignedToId initially
});

export type CreateOperationInput = z.infer<typeof createOperationSchema>;


// Schema for updating existing Operations (focus on editable fields in WorkOrderDetail)
export const updateOperationSchema = z.object({
  id: z.string().uuid(), // Identify the operation
  // Allow updating sequence and status primarily
  sequence: z.coerce.number().int().min(0, 'Sequence must be non-negative').optional(),
  status: operationStatusEnum.optional(),
  // Potentially add other editable fields from WorkOrderDetail like:
  // comments: z.string().nullable().optional(),
  // assignedToId: z.string().uuid().nullable().optional(),
  // actualStartTime: z.string().datetime().nullable().optional(), // Or z.date() if using Date objects
  // actualEndTime: z.string().datetime().nullable().optional(),
});

export type UpdateOperationInput = z.infer<typeof updateOperationSchema>;

// Schema specifically for batch updates from WorkOrderDetail (only sequence/status)
export const batchUpdateOperationSchema = z.object({
  sequence: z.coerce.number().int().min(0, 'Sequence must be non-negative').optional(),
  status: operationStatusEnum.optional(),
});

export type BatchUpdateOperationInput = z.infer<typeof batchUpdateOperationSchema>; 