/**
 * Operation Service
 * 
 * Centralized service for managing operations and operation templates
 * to ensure consistency between work order operations and part library templates.
 * 
 * This file re-exports functionality from the modular services in /lib/services/operation
 * to maintain backward compatibility while improving code organization.
 */
import { Operation, OperationDocument, UpdateOperationInput } from "@/types/operation";
import { OperationTemplate } from "@/types/part";

// Import all functionality from modular services
import {
  getOperation as getOperationFromService,
  getOperationsByWorkOrder as getOperationsByWorkOrderFromService,
  getOperationTemplates as getOperationTemplatesFromService,
  getOperationsByPart as getOperationsByPartFromService,
  getOperationsByTemplate as getOperationsByTemplateFromService,
  updateOperationStatus as updateOperationStatusFromService,
} from "@/lib/services/operation/operation-query-service";

import {
  updateOperation as updateOperationFromService,
} from "@/lib/services/operation/operation-update-service";

import {
  syncOperationToTemplate as syncOperationToTemplateFromService,
  syncOperationDocuments as syncOperationDocumentsFromService,
} from "@/lib/services/operation/template-sync-service";

import {
  addOperationDocument as addOperationDocumentFromService,
  removeOperationDocument as removeOperationDocumentFromService
} from "@/lib/services/operation/document-service";

/**
 * Get an operation by ID
 */
export async function getOperation(operationId: string): Promise<Operation | null> {
  return getOperationFromService(operationId);
}

/**
 * Update an operation and optionally sync changes to the part template
 */
export async function updateOperation(
  operationId: string, 
  data: UpdateOperationInput, 
  options: { syncToTemplate?: boolean } = {}
): Promise<Operation> {
  return updateOperationFromService(operationId, data, options);
}

/**
 * Sync operation changes to the part template
 */
export async function syncOperationToTemplate(operationId: string, operationData: any): Promise<void> {
  return syncOperationToTemplateFromService(operationId, operationData);
}

/**
 * Sync operation documents to the part template
 * This function ensures all operation documents are copied to the template
 */
export async function syncOperationDocuments(
  operationId: string, 
  partId: string, 
  operationName: string
): Promise<void> {
  return syncOperationDocumentsFromService(operationId, partId, operationName);
}

/**
 * Get operation templates for a part
 */
export async function getOperationTemplates(partId: string): Promise<OperationTemplate[]> {
  return getOperationTemplatesFromService(partId);
}

/**
 * Add a document to an operation
 */
export async function addOperationDocument(
  operationId: string, 
  document: Omit<OperationDocument, "id" | "uploadedAt">,
  options: { syncToTemplate?: boolean } = {}
): Promise<OperationDocument> {
  return addOperationDocumentFromService(operationId, document, options);
}

/**
 * Remove a document from an operation
 */
export async function removeOperationDocument(
  documentId: string,
  options: { syncToTemplate?: boolean } = {}
): Promise<void> {
  return removeOperationDocumentFromService(documentId, options);
}

/**
 * Get operations by work order
 */
export async function getOperationsByWorkOrder(workOrderId: string): Promise<Operation[]> {
  return getOperationsByWorkOrderFromService(workOrderId);
}

/**
 * Get operations by part ID (for creating work orders)
 */
export async function getOperationsByPart(partId: string): Promise<OperationTemplate[]> {
  return getOperationsByPartFromService(partId);
}

/**
 * Get operations by template ID
 */
export async function getOperationsByTemplate(templateId: string): Promise<Operation[]> {
  return getOperationsByTemplateFromService(templateId);
}
