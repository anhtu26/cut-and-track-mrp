/**
 * Operation Service
 * 
 * Main entry point for operation-related functionality
 * Centralizes access to all operation services
 */

// Re-export all services for easy access
export * from './operation-query-service';
export * from './operation-update-service';
export * from './document-service';
export * from './template-sync-service';

// Export a unified API for convenience
export { default as OperationService } from './operation-service';
