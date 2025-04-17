import { Customer } from "@/types/customer";
import { Operation } from "@/types/operation";
import { Part } from "@/types/part";
import { WorkOrderStatus, WorkOrderPriority } from "@/types/work-order-status";

// Mock data for Customers
export const mockCustomers: Customer[] = [
  {
    id: "cust1",
    name: "Acme Corp",
    company: "Acme Corporation",
    contactName: "John Doe",
    contactEmail: "john.doe@acme.com",
    contactPhone: "555-123-4567",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "91234",
    country: "USA",
    notes: "Preferred customer",
    createdAt: "2023-05-01",
    updatedAt: "2023-05-01",
    archived: false,
  },
  {
    id: "cust2",
    name: "Beta Industries",
    company: "Beta Industries",
    contactName: "Jane Smith",
    contactEmail: "jane.smith@beta.com",
    contactPhone: "555-987-6543",
    address: "456 Elm St",
    city: "Springfield",
    state: "IL",
    zip: "62704",
    country: "USA",
    notes: "New customer",
    createdAt: "2023-05-05",
    updatedAt: "2023-05-05",
    archived: false,
  },
];

// Mock data for Parts
export const mockParts: Part[] = [
  {
    id: "part1",
    name: "Gear",
    partNumber: "G-123",
    description: "Standard gear",
    active: true,
    materials: ["Steel"],
    setupInstructions: "Follow standard setup",
    machiningMethods: "CNC milling",
    revisionNumber: "A",
    createdAt: "2023-05-01",
    updatedAt: "2023-05-01",
    documents: [],
    archived: false,
    operationTemplates: [],
  },
  {
    id: "part2",
    name: "Shaft",
    partNumber: "S-456",
    description: "High-strength shaft",
    active: true,
    materials: ["Aluminum"],
    setupInstructions: "Use precision setup",
    machiningMethods: "Lathe turning",
    revisionNumber: "B",
    createdAt: "2023-05-05",
    updatedAt: "2023-05-05",
    documents: [],
    archived: false,
    operationTemplates: [],
  },
];

// Mock data for Operations
export const mockOperations: Operation[] = [
  {
    id: "op1",
    workOrderId: "wo1",
    name: "Milling",
    description: "Mill the gear teeth",
    status: "In Progress",
    machiningMethods: "CNC milling",
    setupInstructions: "Load program G123",
    sequence: 1,
    createdAt: "2023-06-01",
    updatedAt: "2023-06-05",
    documents: [],
  },
  {
    id: "op2",
    workOrderId: "wo1",
    name: "Deburring",
    description: "Remove sharp edges",
    status: "Not Started",
    machiningMethods: "Manual deburring",
    setupInstructions: "Use deburring tool",
    sequence: 2,
    createdAt: "2023-06-05",
    updatedAt: "2023-06-05",
    documents: [],
  },
];

// Mock data for Work Orders
export const mockWorkOrders = [
  {
    id: "wo1",
    workOrderNumber: "WO-123456",
    purchaseOrderNumber: "PO-45678",
    customer: mockCustomers[0],
    customerId: mockCustomers[0].id,
    part: mockParts[0],
    partId: mockParts[0].id,
    quantity: 100,
    status: "In Progress",
    priority: "Normal",
    dueDate: "2023-06-15",
    startDate: "2023-06-01",
    endDate: "",
    operations: [mockOperations[0], mockOperations[1]],
    archived: false,
    useOperationTemplates: true
  },
  {
    id: "wo2",
    workOrderNumber: "WO-654321",
    purchaseOrderNumber: "PO-87654",
    customer: mockCustomers[1],
    customerId: mockCustomers[1].id,
    part: mockParts[1],
    partId: mockParts[1].id,
    quantity: 50,
    status: "Not Started",
    priority: "High",
    dueDate: "2023-07-01",
    startDate: "2023-06-20",
    endDate: "",
    operations: [],
    archived: false,
    useOperationTemplates: true
  },
];

// Mock data for Work Order Statuses
export const mockWorkOrderStatuses: WorkOrderStatus[] = [
  "Not Started",
  "In Progress",
  "QC",
  "Complete",
  "Shipped",
];

// Mock data for Work Order Priorities
export const mockWorkOrderPriorities: WorkOrderPriority[] = [
  "Low",
  "Normal",
  "High",
  "Urgent",
  "Critical",
];
