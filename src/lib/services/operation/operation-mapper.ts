/**
 * Operation Mapper
 * 
 * Utility functions to map between database models and application models
 */
import { Operation, OperationDocument } from "@/types/operation";

/**
 * Map a database operation record to our application Operation type
 */
export function mapOperationFromDb(data: any, assignedTo?: { id: string, name: string }): Operation {
  return {
    id: data.id,
    workOrderId: data.work_order_id,
    name: data.name,
    description: data.description || "",
    status: data.status,
    machiningMethods: data.machining_methods || "",
    setupInstructions: data.setup_instructions || "",
    sequence: data.sequence || 0,
    isCustom: data.is_custom || false,
    estimatedStartTime: data.estimated_start_time,
    estimatedEndTime: data.estimated_end_time,
    actualStartTime: data.actual_start_time,
    actualEndTime: data.actual_end_time,
    comments: data.comments || "",
    assignedToId: data.assigned_to_id,
    assignedTo: assignedTo,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    documents: (data.documents || []).map(mapDocumentFromDb)
  } as Operation;
}

/**
 * Map a database operation document to our application OperationDocument type
 */
export function mapDocumentFromDb(doc: any): OperationDocument {
  return {
    id: doc.id,
    name: doc.name,
    url: doc.url,
    type: doc.type,
    uploadedAt: doc.uploaded_at,
    size: doc.size
  };
}

/**
 * Map an operation to database format for insert/update
 */
export function mapOperationToDb(operation: Partial<Operation>): any {
  return {
    name: operation.name,
    description: operation.description || null,
    status: operation.status,
    machining_methods: operation.machiningMethods || null,
    setup_instructions: operation.setupInstructions || null,
    sequence: operation.sequence,
    estimated_start_time: operation.estimatedStartTime || null,
    estimated_end_time: operation.estimatedEndTime || null,
    actual_start_time: operation.actualStartTime || null,
    actual_end_time: operation.actualEndTime || null,
    comments: operation.comments || null,
    assigned_to_id: operation.assignedToId || null,
    updated_at: new Date().toISOString(),
  };
}
