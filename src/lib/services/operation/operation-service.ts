/**
 * Operation Service
 * 
 * Unified API for operation-related functionality
 */
import { Operation, OperationDocument, UpdateOperationInput } from "@/types/operation";
import { OperationTemplate } from "@/types/part";
import * as OperationQueryService from "./operation-query-service";
import * as OperationUpdateService from "./operation-update-service";
import * as DocumentService from "./document-service";
import * as TemplateSyncService from "./template-sync-service";

/**
 * Unified Operation Service API
 * Provides a clean interface for all operation-related functionality
 */
const OperationService = {
  // Query operations
  getOperation: OperationQueryService.getOperation,
  getOperationsByWorkOrder: OperationQueryService.getOperationsByWorkOrder,
  getOperationTemplates: OperationQueryService.getOperationTemplates,
  getOperationsByPart: OperationQueryService.getOperationsByPart,
  getOperationsByTemplate: OperationQueryService.getOperationsByTemplate,
  
  // Update operations
  updateOperation: OperationUpdateService.updateOperation,
  updateOperationStatus: OperationQueryService.updateOperationStatus,
  createOperation: OperationUpdateService.createOperation,
  deleteOperation: OperationUpdateService.deleteOperation,
  
  // Template sync
  syncOperationToTemplate: TemplateSyncService.syncOperationToTemplate,
  syncOperationDocuments: TemplateSyncService.syncOperationDocuments,
  syncOperationToPartTemplate: TemplateSyncService.syncOperationToPartTemplate,
  
  // Document management
  addOperationDocument: DocumentService.addOperationDocument,
  removeOperationDocument: DocumentService.removeOperationDocument,
  getOperationDocuments: DocumentService.getOperationDocuments,
};

export default OperationService;
