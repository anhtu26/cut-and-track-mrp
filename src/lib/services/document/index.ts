/**
 * Document Service
 * 
 * Centralized service for document management across the application
 */
import { supabase } from "@/integrations/supabase/client";
import { OperationDocument } from "@/types/operation";

// Document entity types
export type DocumentEntityType = 'operation' | 'template' | 'part' | 'workOrder';

// Document table mapping
const documentTableMap = {
  operation: {
    table: "operation_documents",
    idField: "operation_id"
  },
  template: {
    table: "template_documents",
    idField: "template_id"
  },
  part: {
    table: "part_documents",
    idField: "part_id"
  },
  workOrder: {
    table: "work_order_documents",
    idField: "work_order_id"
  }
};

/**
 * Upload a document to storage and create a database record
 */
export async function uploadDocument(
  file: File,
  entityId: string,
  entityType: DocumentEntityType,
  options: { syncToTemplate?: boolean } = {}
): Promise<OperationDocument> {
  if (!file || !entityId || !entityType) {
    throw new Error("File, entity ID, and entity type are required");
  }
  
  try {
    // Sanitize file name to avoid storage issues
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${entityType}s/${entityId}/${Date.now()}_${sanitizedName}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = await supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
      
    if (!urlData || !urlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }
    
    // Get table info
    const { table, idField } = documentTableMap[entityType];
    
    // Create document record
    const documentData = {
      [idField]: entityId,
      name: sanitizedName,
      url: urlData.publicUrl,
      type: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString()
    };
    
    const { data, error: insertError } = await supabase
      .from(table)
      .insert(documentData)
      .select()
      .single();
      
    if (insertError) throw insertError;
    
    // Handle template syncing if needed
    if (options.syncToTemplate && entityType === 'operation') {
      // Import here to avoid circular dependency
      const { syncOperationDocuments } = await import('../operation/template-sync-service');
      
      // Get operation details to find the part
      const { data: operation, error: operationError } = await supabase
        .from("operations")
        .select("work_order_id, name")
        .eq("id", entityId)
        .maybeSingle();
        
      if (operationError) throw operationError;
      if (!operation) throw new Error("Operation not found");
      
      const { data: workOrder, error: workOrderError } = await supabase
        .from("work_orders")
        .select("part_id")
        .eq("id", operation.work_order_id)
        .maybeSingle();
        
      if (workOrderError) throw workOrderError;
      if (!workOrder?.part_id) {
        console.warn("[Document Service] Work order has no part ID, skipping document sync");
      } else {
        // Sync the document
        await syncOperationDocuments(entityId, workOrder.part_id, operation.name);
      }
    }
    
    return {
      id: data.id,
      name: data.name,
      url: data.url,
      type: data.type,
      uploadedAt: data.uploaded_at,
      size: data.size
    };
  } catch (error) {
    console.error("[Document Service] Error uploading document:", error);
    throw error;
  }
}

/**
 * Delete a document from storage and database
 */
export async function deleteDocument(
  documentId: string,
  entityType: DocumentEntityType,
  options: { syncToTemplate?: boolean } = {}
): Promise<void> {
  if (!documentId || !entityType) {
    throw new Error("Document ID and entity type are required");
  }
  
  try {
    // Get table info
    const { table } = documentTableMap[entityType];
    
    // Get document details
    const { data: document, error: getError } = await supabase
      .from(table)
      .select("*")
      .eq("id", documentId)
      .maybeSingle();
      
    if (getError) throw getError;
    if (!document) throw new Error("Document not found");
    
    // Extract file path from URL
    const url = new URL(document.url);
    const filePath = url.pathname.replace('/storage/v1/object/public/documents/', '');
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);
      
    if (storageError) {
      console.warn("[Document Service] Error deleting from storage:", storageError);
      // Continue anyway to delete the database record
    }
    
    // Delete database record
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("id", documentId);
      
    if (deleteError) throw deleteError;
    
    // Handle template syncing if needed
    if (options.syncToTemplate && entityType === 'operation') {
      // Import here to avoid circular dependency
      const { syncOperationDocuments } = await import('../operation/template-sync-service');
      
      // Get operation ID from the document
      const operationId = document.operation_id;
      
      // Get operation details to find the part
      const { data: operation, error: operationError } = await supabase
        .from("operations")
        .select("work_order_id, name")
        .eq("id", operationId)
        .maybeSingle();
        
      if (operationError) throw operationError;
      if (!operation) return;
      
      const { data: workOrder, error: workOrderError } = await supabase
        .from("work_orders")
        .select("part_id")
        .eq("id", operation.work_order_id)
        .maybeSingle();
        
      if (workOrderError) throw workOrderError;
      if (!workOrder?.part_id) return;
      
      // Sync the documents (this will update the template documents to match operation documents)
      await syncOperationDocuments(operationId, workOrder.part_id, operation.name);
    }
  } catch (error) {
    console.error("[Document Service] Error deleting document:", error);
    throw error;
  }
}

/**
 * Get documents for an entity
 */
export async function getDocuments(
  entityId: string,
  entityType: DocumentEntityType
): Promise<OperationDocument[]> {
  if (!entityId || !entityType) {
    throw new Error("Entity ID and type are required");
  }
  
  try {
    // Get table info
    const { table, idField } = documentTableMap[entityType];
    
    // Get documents
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(idField, entityId);
      
    if (error) throw error;
    
    return (data || []).map(doc => ({
      id: doc.id,
      name: doc.name,
      url: doc.url,
      type: doc.type,
      uploadedAt: doc.uploaded_at,
      size: doc.size
    }));
  } catch (error) {
    console.error("[Document Service] Error fetching documents:", error);
    return [];
  }
}

// Export a unified API
const DocumentService = {
  uploadDocument,
  deleteDocument,
  getDocuments
};

export default DocumentService;
