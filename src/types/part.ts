
import { partSchema, partSearchResultSchema } from '@/schemas/part';
import { z } from 'zod';

/**
 * Part interface derived from Zod schema
 */
export type Part = z.infer<typeof partSchema>;

/**
 * Part search result type for use in search components
 */
export type PartSearchResult = z.infer<typeof partSearchResultSchema>;

/**
 * Legacy Part interface - maintained for backward compatibility
 */
export interface LegacyPart {
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

export interface PartDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string; // This needs to match the field in part-detail-tabs.tsx
  type: string;
  size?: number; // Optional file size in bytes
}

export interface OperationTemplate {
  id: string;
  partId: string;
  name: string;
  description?: string;
  machiningMethods?: string;
  setupInstructions?: string;
  estimatedDuration?: number; // in minutes
  sequence: number;
  createdAt: string;
  updatedAt: string;
}
