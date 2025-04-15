
import { Customer } from "./customer";
import { Part } from "./part";

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  purchaseOrderNumber?: string;
  customer: Customer;
  part: Part;
  quantity: number;
  status: "Not Started" | "In Progress" | "QC" | "Complete" | "Shipped";
  priority: "Low" | "Normal" | "High" | "Critical";
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
}
