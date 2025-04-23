import { z } from "zod";

/**
 * Zod schema for Part database fields (snake_case)
 * This represents the raw database structure
 */
export const partDbSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Part name is required"),
  part_number: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  materials: z.array(z.string()).default([]),
  setup_instructions: z.string().optional(),
  machining_methods: z.string().optional(),
  revision_number: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  archived: z.boolean().default(false),
  archived_at: z.string().datetime().optional(),
  archive_reason: z.string().optional(),
  customer_id: z.string().uuid().optional(),
});

/**
 * Zod schema for Part client-side representation (camelCase)
 * This represents how we use the Part in the application
 */
export const partSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Part name is required"),
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  materials: z.array(z.string()).default([]),
  setupInstructions: z.string().optional(),
  machiningMethods: z.string().optional(),
  revisionNumber: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      url: z.string(),
      uploadedAt: z.string(),
      type: z.string(),
      size: z.number().optional(),
    })
  ).default([]),
  archived: z.boolean().default(false),
  archivedAt: z.string().datetime().optional(),
  archiveReason: z.string().optional(),
  customerId: z.string().uuid().optional(),
  customer: z
    .object({
      id: z.string(),
      name: z.string(),
      company: z.string(),
    })
    .optional(),
  operationTemplates: z
    .array(
      z.object({
        id: z.string(),
        partId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        machiningMethods: z.string().optional(),
        setupInstructions: z.string().optional(),
        estimatedDuration: z.number().optional(),
        sequence: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    )
    .optional(),
});

/**
 * Helper type for validating inputs when creating a new part
 */
export const createPartSchema = partSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  documents: true,
  archived: true,
  archivedAt: true,
  archiveReason: true,
  operationTemplates: true,
});

/**
 * Schema for the part search select component
 */
export const partSearchSelectSchema = z.object({
  customerId: z.string().uuid().optional(),
  disabled: z.boolean().optional().default(false),
  label: z.string().optional().default("Part"),
  description: z.string().optional(),
  placeholder: z.string().optional().default("Select a part"),
  onSelect: z.function()
    .args(z.string().uuid())
    .optional(),
  value: z.string().uuid().optional(),
  defaultValue: z.string().uuid().optional(),
  name: z.string().optional(),
  showAddNewButton: z.boolean().optional().default(true),
  required: z.boolean().optional().default(false),
  error: z.string().optional(),
});

/**
 * Schema for the part search results
 */
export const partSearchResultSchema = partSchema.pick({
  id: true,
  name: true,
  partNumber: true,
  description: true,
  customerId: true,
});
