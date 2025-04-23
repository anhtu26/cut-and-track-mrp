/**
 * Template Sync Service
 * 
 * Handles syncing operations with their templates in the part library
 */
import { supabase } from "@/integrations/supabase/client";
import { mapOperationToDb } from "./operation-mapper";

/**
 * Sync operation changes to the part template
 */
export async function syncOperationToTemplate(operationId: string, operationData: any, options?: { syncDocuments?: boolean }): Promise<void> {
  try {
    // Get the work order to find the part ID
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
      console.warn("[Template Sync] Work order has no part ID, skipping template sync");
      return;
    }
    
    await syncOperationToPartTemplate(operationId, workOrder.part_id, operation.name, operationData);
  } catch (error) {
    console.error("[Template Sync] Error syncing to template:", error);
    throw error;
  }
}

/**
 * Sync operation to a specific part template
 */
export async function syncOperationToPartTemplate(
  operationId: string, 
  partId: string, 
  operationName: string, 
  operationData?: any,
  options?: { syncDocuments?: boolean }
): Promise<void> {
  try {
    // If no operation data provided, fetch it
    if (!operationData) {
      const { data, error } = await supabase
        .from("operations")
        .select("*")
        .eq("id", operationId)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) throw new Error("Operation not found");
      
      operationData = data;
    }
    
    // Check if a template exists for this operation
    const { data: template, error: templateError } = await supabase
      .from("operation_templates")
      .select("id")
      .eq("part_id", partId)
      .eq("name", operationName)
      .maybeSingle();
      
    if (templateError) throw templateError;
    
    // Calculate estimated duration if we have actual start and end times
    let estimatedDuration = null;
    if (operationData.actual_start_time && operationData.actual_end_time) {
      const startTime = new Date(operationData.actual_start_time).getTime();
      const endTime = new Date(operationData.actual_end_time).getTime();
      estimatedDuration = Math.round((endTime - startTime) / (1000 * 60)); // in minutes
    }
    
    // Prepare template data
    const templateData = {
      name: operationData.name,
      description: operationData.description,
      machining_methods: operationData.machining_methods,
      setup_instructions: operationData.setup_instructions,
      sequence: operationData.sequence,
      estimated_duration: estimatedDuration,
      part_id: partId,
      updated_at: new Date().toISOString()
    };
    
    if (template) {
      // Update existing template
      const { error: updateError } = await supabase
        .from("operation_templates")
        .update(templateData)
        .eq("id", template.id);
        
      if (updateError) throw updateError;
      console.log("[Template Sync] Updated template:", template.id);
    } else {
      // Create new template
      const { error: insertError } = await supabase
        .from("operation_templates")
        .insert({
          ...templateData,
          created_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
      console.log("[Template Sync] Created new template for part:", partId);
    }
    
    // Sync documents if needed and not explicitly disabled
    const shouldSyncDocuments = options?.syncDocuments !== false; // Default to true if not specified
    if (shouldSyncDocuments) {
      await syncOperationDocuments(operationId, partId, operationName);
    } else {
      console.log(`[Template Sync] Document syncing disabled for operation ${operationId}`);
    }
  } catch (error) {
    console.error("[Template Sync] Error syncing to part template:", error);
    throw error;
  }
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
  try {
    console.log(`[Template Sync] Syncing documents from operation ${operationId} to template for part ${partId}`);
    
    // Get operation documents
    const { data: documents, error: documentsError } = await supabase
      .from("operation_documents")
      .select("*")
      .eq("operation_id", operationId);
      
    if (documentsError) throw documentsError;
    
    // Get template ID or create it if it doesn't exist
    let templateId: string;
    
    const { data: template, error: templateError } = await supabase
      .from("operation_templates")
      .select("id")
      .eq("part_id", partId)
      .eq("name", operationName)
      .maybeSingle();
      
    if (templateError) throw templateError;
    
    if (!template) {
      console.log("[Template Sync] Template not found, creating a new one");
      
      // Get operation details to create a template
      const { data: operation, error: operationError } = await supabase
        .from("operations")
        .select("*")
        .eq("id", operationId)
        .maybeSingle();
        
      if (operationError) throw operationError;
      if (!operation) {
        console.error("[Template Sync] Operation not found for template creation");
        return;
      }
      
      // Create a new template
      const { data: newTemplate, error: createError } = await supabase
        .from("operation_templates")
        .insert({
          part_id: partId,
          name: operationName,
          description: operation.description,
          machining_methods: operation.machining_methods,
          setup_instructions: operation.setup_instructions,
          sequence: operation.sequence,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select("id")
        .single();
        
      if (createError) throw createError;
      if (!newTemplate) {
        console.error("[Template Sync] Failed to create template");
        return;
      }
      
      templateId = newTemplate.id;
    } else {
      templateId = template.id;
    }
    
    // If no documents to sync, we're done
    if (!documents || documents.length === 0) {
      console.log("[Template Sync] No documents to sync");
      return;
    }
    
    // First, clear existing template documents to avoid duplicates
    // This ensures we have a clean slate and exact match with operation documents
    const { error: deleteError } = await supabase
      .from("template_documents")
      .delete()
      .eq("template_id", templateId);
      
    if (deleteError) {
      console.error("[Template Sync] Error clearing existing template documents:", deleteError);
      // Continue anyway to try inserting new documents
    }
    
    // Prepare template documents
    const templateDocuments = documents.map(doc => ({
      template_id: templateId,
      name: doc.name,
      url: doc.url,
      type: doc.type,
      uploaded_at: doc.uploaded_at || new Date().toISOString(),
      size: doc.size
    }));
    
    // Insert all documents to template
    if (templateDocuments.length > 0) {
      const { error: insertError } = await supabase
        .from("template_documents")
        .insert(templateDocuments);
        
      if (insertError) throw insertError;
      
      console.log(`[Template Sync] Synced ${templateDocuments.length} documents to template ${templateId}`);
    }
  } catch (error) {
    console.error("[Template Sync] Error syncing documents:", error);
    // Don't throw here, just log the error to avoid breaking the main operation update
  }
}
