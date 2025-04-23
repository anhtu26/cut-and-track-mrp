/**
 * Operation Service
 * 
 * Centralized service for managing operations and operation templates
 * to ensure consistency between work order operations and part library templates.
 */
import { supabase } from "@/integrations/supabase/client";
import { Operation, OperationDocument, UpdateOperationInput } from "@/types/operation";
import { OperationTemplate } from "@/types/part";

/**
 * Get an operation by ID
 */
export async function getOperation(operationId: string): Promise<Operation | null> {
  if (!operationId) {
    throw new Error("Operation ID is required");
  }
  
  try {
    // Use a specific relationship for operation_documents to avoid ambiguity
    const { data, error } = await supabase
      .from("operations")
      .select(`
        *,
        documents:operation_documents!operation_documents_operation_id_fkey(*)
      `)
      .eq("id", operationId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;

    // Get operator information if assigned
    let assignedTo = undefined;
    
    if (data.assigned_to_id) {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", data.assigned_to_id)
        .maybeSingle();
        
      if (!userError && userData) {
        assignedTo = {
          id: userData.id,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || "Unknown"
        };
      } else {
        // Fallback if profile isn't found
        assignedTo = {
          id: data.assigned_to_id,
          name: "Unknown"
        };
      }
    }
    
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
      documents: (data.documents || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type,
        uploadedAt: doc.uploaded_at,
        size: doc.size
      }))
    } as Operation;
  } catch (error) {
    console.error("[Operation Service] Error fetching operation:", error);
    throw error;
  }
}

/**
 * Update an operation and optionally sync changes to the part template
 */
export async function updateOperation(
  operationId: string, 
  data: UpdateOperationInput, 
  options: { syncToTemplate?: boolean } = {}
): Promise<Operation> {
  if (!operationId) {
    throw new Error("Operation ID is required");
  }

  try {
    console.log("[Operation Service] Updating operation:", operationId, data);
    
    // First, get the work order ID to find the part ID
    const { data: workOrderData, error: workOrderError } = await supabase
      .from("operations")
      .select("work_order_id")
      .eq("id", operationId)
      .maybeSingle();
      
    if (workOrderError) throw workOrderError;
    if (!workOrderData) throw new Error("Operation not found");
    
    const workOrderId = workOrderData.work_order_id;
    
    // Prepare operation data for update
    const operationData = {
      name: data.name,
      description: data.description || null,
      status: data.status,
      machining_methods: data.machiningMethods || null,
      setup_instructions: data.setupInstructions || null,
      sequence: data.sequence,
      estimated_start_time: data.estimatedStartTime || null,
      estimated_end_time: data.estimatedEndTime || null,
      actual_start_time: data.actualStartTime || null,
      actual_end_time: data.actualEndTime || null,
      comments: data.comments || null,
      assigned_to_id: data.assignedToId || null,
      updated_at: new Date().toISOString(),
    };
    
    // Update the operation
    const { data: updatedOperation, error: updateError } = await supabase
      .from("operations")
      .update(operationData)
      .eq("id", operationId)
      .select();
      
    if (updateError) throw updateError;
    
    // If syncToTemplate is true, update the template in the part library
    if (options.syncToTemplate) {
      await syncOperationToTemplate(operationId, operationData);
    }
    
    // Return the updated operation
    return await getOperation(operationId) as Operation;
  } catch (error) {
    console.error("[Operation Service] Error updating operation:", error);
    throw error;
  }
}

/**
 * Sync operation changes to the part template
 */
async function syncOperationToTemplate(operationId: string, operationData: any): Promise<void> {
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
      console.warn("[Operation Service] Work order has no part ID, skipping template sync");
      return;
    }
    
    // Check if a template exists for this operation
    const { data: template, error: templateError } = await supabase
      .from("operation_templates")
      .select("id")
      .eq("part_id", workOrder.part_id)
      .eq("name", operation.name)
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
      part_id: workOrder.part_id,
      updated_at: new Date().toISOString()
    };
    
    if (template) {
      // Update existing template
      const { error: updateError } = await supabase
        .from("operation_templates")
        .update(templateData)
        .eq("id", template.id);
        
      if (updateError) throw updateError;
      console.log("[Operation Service] Updated template:", template.id);
    } else {
      // Create new template
      const { error: insertError } = await supabase
        .from("operation_templates")
        .insert({
          ...templateData,
          created_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
      console.log("[Operation Service] Created new template for part:", workOrder.part_id);
    }
    
    // Sync documents if needed
    await syncOperationDocuments(operationId, workOrder.part_id, operation.name);
  } catch (error) {
    console.error("[Operation Service] Error syncing to template:", error);
    throw error;
  }
}

/**
 * Sync operation documents to the part template
 */
async function syncOperationDocuments(
  operationId: string, 
  partId: string, 
  operationName: string
): Promise<void> {
  try {
    // Get operation documents
    const { data: documents, error: documentsError } = await supabase
      .from("operation_documents")
      .select("*")
      .eq("operation_id", operationId);
      
    if (documentsError) throw documentsError;
    if (!documents || documents.length === 0) {
      console.log("[Operation Service] No documents to sync");
      return;
    }
    
    // Get template ID
    const { data: template, error: templateError } = await supabase
      .from("operation_templates")
      .select("id")
      .eq("part_id", partId)
      .eq("name", operationName)
      .maybeSingle();
      
    if (templateError) throw templateError;
    if (!template) {
      console.warn("[Operation Service] Template not found for document sync");
      return;
    }
    
    // Get existing template documents
    const { data: existingDocs, error: existingDocsError } = await supabase
      .from("template_documents")
      .select("url")
      .eq("template_id", template.id);
      
    if (existingDocsError) throw existingDocsError;
    
    // Create a set of existing document URLs
    const existingUrls = new Set((existingDocs || []).map(doc => doc.url));
    
    // Filter out documents that already exist in the template
    const newDocuments = documents.filter(doc => !existingUrls.has(doc.url));
    
    if (newDocuments.length === 0) {
      console.log("[Operation Service] No new documents to sync");
      return;
    }
    
    // Prepare template documents
    const templateDocuments = newDocuments.map(doc => ({
      template_id: template.id,
      name: doc.name,
      url: doc.url,
      type: doc.type,
      uploaded_at: doc.uploaded_at,
      size: doc.size
    }));
    
    // Insert new template documents
    const { error: insertError } = await supabase
      .from("template_documents")
      .insert(templateDocuments);
      
    if (insertError) throw insertError;
    
    console.log("[Operation Service] Synced documents to template:", templateDocuments.length);
  } catch (error) {
    console.error("[Operation Service] Error syncing documents:", error);
    // Don't throw here, just log the error to avoid breaking the main operation update
  }
}

/**
 * Get operation templates for a part
 */
export async function getOperationTemplates(partId: string): Promise<OperationTemplate[]> {
  if (!partId) {
    throw new Error("Part ID is required");
  }
  
  try {
    const { data, error } = await supabase
      .from("operation_templates")
      .select(`
        *,
        documents:template_documents(*)
      `)
      .eq("part_id", partId)
      .order("sequence", { ascending: true });
      
    if (error) throw error;
    
    return (data || []).map(template => ({
      id: template.id,
      partId: template.part_id,
      name: template.name,
      description: template.description || "",
      machiningMethods: template.machining_methods || "",
      setupInstructions: template.setup_instructions || "",
      estimatedDuration: template.estimated_duration,
      sequence: template.sequence,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      documents: (template.documents || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type,
        uploadedAt: doc.uploaded_at,
        size: doc.size
      }))
    }));
  } catch (error) {
    console.error("[Operation Service] Error fetching templates:", error);
    return [];
  }
}

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
          console.warn("[Operation Service] Work order has no part ID, skipping document sync");
          return data;
        }
        
        // Sync the document
        await syncOperationDocuments(operationId, workOrder.part_id, operation.name);
      } catch (syncError) {
        console.error("[Operation Service] Error syncing document to template:", syncError);
        // Don't throw here, just log the error
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
    console.error("[Operation Service] Error adding document:", error);
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
        
        console.log("[Operation Service] Removed document from template");
      } catch (syncError) {
        console.error("[Operation Service] Error removing document from template:", syncError);
        // Don't throw here, just log the error
      }
    }
  } catch (error) {
    console.error("[Operation Service] Error removing document:", error);
    throw error;
  }
}
