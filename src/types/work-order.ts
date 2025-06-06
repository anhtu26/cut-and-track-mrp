
import { Customer } from "./customer";
import { Part } from "./part";
import { Operation } from "./operation";
import { WorkOrderStatus, WorkOrderPriority } from "./work-order-status";

// Export the WorkOrderStatus and WorkOrderPriority types
export type { WorkOrderStatus, WorkOrderPriority };

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  purchaseOrderNumber?: string;
  customer: Customer;
  customerId: string;
  part: Part;
  partId: string;
  quantity: number;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  dueDate: string;
  completedDate?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  notes?: string;
  operations: Operation[];
  archived: boolean;
  archivedAt?: string;
  archiveReason?: string;
  useOperationTemplates?: boolean;
}

export interface CreateWorkOrderInput {
  workOrderNumber?: string; // Auto-generated if not provided
  purchaseOrderNumber?: string;
  customerId: string;
  partId: string;
  quantity: number;
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  startDate?: string;
  dueDate: string;
  assignedToId?: string;
  notes?: string;
  useOperationTemplates?: boolean; // Field to indicate if we should use templates
}

export interface UpdateWorkOrderInput extends Partial<Omit<CreateWorkOrderInput, 'id'>> {
  id: string;
  completedDate?: string;
  archived?: boolean;
  archiveReason?: string;
  useOperationTemplates?: boolean; // Add to update input as well
}
