
import { Part } from "./part";

export type OperationStatus = "Not Started" | "In Progress" | "QC" | "Complete";

export interface Operator {
  id: string;
  name: string;
}

export interface Operation {
  id: string;
  workOrderId: string;
  name: string;
  description: string;
  status: OperationStatus;
  machiningMethods: string;
  setupInstructions: string;
  sequence: number; // Added sequence field to match templates
  isCustom?: boolean; // Flag to identify custom operations
  estimatedStartTime?: string;
  estimatedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  comments?: string;
  assignedTo?: Operator;
  createdAt: string;
  updatedAt: string;
  documents: OperationDocument[];
}

export interface OperationDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  type: string;
}

export interface CreateOperationInput {
  workOrderId: string;
  name: string;
  description?: string | null;
  status: OperationStatus;
  machiningMethods?: string | null;
  setupInstructions?: string | null;
  sequence: number; // Added sequence field as required
  isCustom?: boolean; // Flag to identify custom operations
  estimatedStartTime?: string | null;
  estimatedEndTime?: string | null;
  assignedToId?: string | null;
  comments?: string | null;
}

export interface UpdateOperationInput extends Partial<CreateOperationInput> {
  id: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
}
