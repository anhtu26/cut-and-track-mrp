/**
 * Document Service
 * 
 * Handles document operations for operations and templates
 */
import { apiClient } from '@/lib/api/client';;
import { OperationDocument } from "@/types/operation";
import { mapDocumentFromDb } from "./operation-mapper";
import { syncOperationDocuments } from "./template-sync-service";

/**
 * Add a document to an operation
 */
export async function addOperationDocument(
  operationId: string, 
  document: Omit<OperationDocument, "id" | "uploadedAt">,
  options: { syncToTemplate?: boolean } = {}
): Promise<OperationDocument> {
  if (!operationId) {
    throw new Error("Operation ID is required");
  }
  
  try {
    const documentData = {
      operation_id: operationId,
      name: document.name,
      url: document.url,
      type: document.type,
      size: document.size,
      uploaded_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from("operation_documents")
      .insert(documentData)
      .select()
      .single();
      
    if (error) throw error;
    
    // If syncToTemplate is true, sync the document to the template
    if (options.syncToTemplate) {
      try {
        // Get operation details to find the part
        const { data: operation, error: operationError } = await supabase
          .from("operations")
          .select("work_order_id, name")
          .eq("id", operationId)
          .maybeSingle();
          
        if (operationError) throw operationError;
        if (!operation) throw new Error("Operation not found");
        
        const { data: workOrder, error: workOrderError } = await supabase
          .from("work_orders")
          .select("part_id")
          .eq("id", operation.work_order_id)
          .maybeSingle();
          
        if (workOrderError) throw workOrderError;
        if (!workOrder || !workOrder.part_id) {
          console.warn("[Document Service] Work order has no part ID, skipping document sync");
          return mapDocumentFromDb(data);
        }
        
        // Sync the document
        await syncOperationDocuments(operationId, workOrder.part_id, operation.name);
      } catch (syncError) {
        console.error("[Document Service] Error syncing document to template:", syncError);
        // Don't throw here, just log the error
      }
    }
    
    return mapDocumentFromDb(data);
  } catch (error) {
    console.error("[Document Service] Error adding document:", error);
    throw error;
  }
}

/**
 * Remove a document from an operation
 */
export async function removeOperationDocument(
  documentId: string,
  options: { syncToTemplate?: boolean } = {}
): Promise<void> {
  if (!documentId) {
    throw new Error("Document ID is required");
  }
  
  try {
    // Get document details before deletion if we need to sync
    let operationId, documentUrl;
    
    if (options.syncToTemplate) {
      const { data, error } = await supabase
        .from("operation_documents")
        .select("operation_id, url")
        .eq("id", documentId)
        .maybeSingle();
        
      if (error) throw error;
      if (data) {
        operationId = data.operation_id;
        documentUrl = data.url;
      }
    }
    
    // Delete the document
    const { error } = await supabase
      .from("operation_documents")
      .delete()
      .eq("id", documentId);
      
    if (error) throw error;
    
    // If syncToTemplate is true and we have the necessary info, remove from template too
    if (options.syncToTemplate && operationId && documentUrl) {
      try {
        // Get operation details to find the template
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
        if (!workOrder || !workOrder.part_id) return;
        
        // Get template ID
        const { data: template, error: templateError } = await supabase
          .from("operation_templates")
          .select("id")
          .eq("part_id", workOrder.part_id)
          .eq("name", operation.name)
          .maybeSingle();
          
        if (templateError) throw templateError;
        if (!template) return;
        
        // Delete matching template document
        const { error: deleteError } = await supabase
          .from("template_documents")
          .delete()
          .eq("template_id", template.id)
          .eq("url", documentUrl);
          
        if (deleteError) throw deleteError;
        
        console.log("[Document Service] Removed document from template");
      } catch (syncError) {
        console.error("[Document Service] Error removing document from template:", syncError);
        // Don't throw here, just log the error
      }
    }
  } catch (error) {
    console.error("[Document Service] Error removing document:", error);
    throw error;
  }
}

/**
 * Get documents for an operation
 */
export async function getOperationDocuments(operationId: string): Promise<OperationDocument[]> {
  if (!operationId) {
    throw new Error("Operation ID is required");
  }
  
  try {
    const { data, error } = await supabase
      .from("operation_documents")
      .select("*")
      .eq("operation_id", operationId);
      
    if (error) throw error;
    
    return (data || []).map(mapDocumentFromDb);
  } catch (error) {
    console.error("[Document Service] Error fetching documents:", error);
    return [];
  }
}
