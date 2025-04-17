
import { z } from "zod";

export interface Part {
  id: string;
  name: string;
  partNumber: string; // Mapped from part_number
  description: string;
  active: boolean;
  materials: string[]; // Still an array in the database, but will be converted from string input
  /**
   * @deprecated These fields are no longer used in the UI. Use operationTemplates instead.
   */
  setupInstructions?: string; // Mapped from setup_instructions
  /**
   * @deprecated These fields are no longer used in the UI. Use operationTemplates instead.
   */
  machiningMethods?: string; // Mapped from machining_methods
  revisionNumber?: string; // Mapped from revision_number
  createdAt: string; // Mapped from created_at
  updatedAt: string; // Mapped from updated_at
  documents: PartDocument[];
  archived: boolean;
  archivedAt?: string; // Mapped from archived_at
  archiveReason?: string; // Mapped from archive_reason
  operationTemplates?: OperationTemplate[]; // Field for operation templates
  customerId?: string; // Link to customer who typically orders this part
  customer?: { // Optional customer info when part details are fetched
    id: string;
    name: string;
    company: string;
  };
}

// Define Zod schemas for validation
export const PartDocumentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Document name is required"),
  url: z.string().url("Invalid document URL"),
  uploadedAt: z.string().datetime(),
  type: z.string().min(1, "Document type is required"),
  size: z.number().optional(),
  storagePath: z.string().optional(),
});

export type PartDocument = z.infer<typeof PartDocumentSchema>;

export const OperationTemplateSchema = z.object({
  id: z.string().uuid(),
  partId: z.string().uuid("Part ID is required"),
  name: z.string().min(1, "Operation name is required"),
  description: z.string().optional(),
  machiningMethods: z.string().optional(),
  setupInstructions: z.string().optional(),
  estimatedDuration: z.number().optional(),
  sequence: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type OperationTemplate = z.infer<typeof OperationTemplateSchema>;
