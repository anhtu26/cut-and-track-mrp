
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
  description?: string;
  status: OperationStatus;
  machiningMethods?: string;
  setupInstructions?: string;
  estimatedStartTime?: string;
  estimatedEndTime?: string;
  assignedToId?: string;
  comments?: string;
}

export interface UpdateOperationInput extends Partial<CreateOperationInput> {
  id: string;
  actualStartTime?: string;
  actualEndTime?: string;
}
