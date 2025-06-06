
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
  sequence: number;
  isCustom?: boolean;
  estimatedStartTime?: string;
  estimatedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  comments?: string;
  assignedTo?: Operator;
  assignedToId?: string; // Explicitly included to match database schema
  createdAt: string;
  updatedAt: string;
  documents: OperationDocument[];
}

export interface OperationDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  size?: number; // Added size field to match database schema
}

export interface CreateOperationInput {
  workOrderId: string;
  name: string;
  description?: string | null;
  status: OperationStatus;
  machiningMethods?: string | null;
  setupInstructions?: string | null;
  sequence: number;
  isCustom?: boolean;
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
