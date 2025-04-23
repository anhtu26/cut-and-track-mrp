/**
 * Operation Query Service
 * 
 * Handles fetching operation data from the database
 */
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "@/types/operation";
import { OperationTemplate } from "@/types/part";
import { mapOperationFromDb } from "./operation-mapper";

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
    
    return mapOperationFromDb(data, assignedTo);
  } catch (error) {
    console.error("[Operation Service] Error fetching operation:", error);
    throw error;
  }
}

/**
 * Get operations for a work order
 */
export async function getOperationsByWorkOrder(workOrderId: string): Promise<Operation[]> {
  if (!workOrderId) {
    throw new Error("Work order ID is required");
  }
  
  try {
    const { data, error } = await supabase
      .from("operations")
      .select(`
        *,
        documents:operation_documents!operation_documents_operation_id_fkey(*)
      `)
      .eq("work_order_id", workOrderId)
      .order("sequence", { ascending: true });
      
    if (error) throw error;
    
    // Map the data to our Operation type
    return (data || []).map(op => mapOperationFromDb(op));
  } catch (error) {
    console.error("[Operation Service] Error fetching operations for work order:", error);
    return [];
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
 * Get operations by part ID (for creating work orders)
 */
export async function getOperationsByPart(partId: string): Promise<OperationTemplate[]> {
  return getOperationTemplates(partId);
}

/**
 * Get operations by template ID
 */
export async function getOperationsByTemplate(templateId: string): Promise<Operation[]> {
  if (!templateId) {
    throw new Error("Template ID is required");
  }
  
  try {
    const { data, error } = await supabase
      .from("operations")
      .select(`
        *,
        documents:operation_documents!operation_documents_operation_id_fkey(*)
      `)
      .eq("template_id", templateId)
      .order("sequence", { ascending: true });
      
    if (error) throw error;
    
    return (data || []).map(op => mapOperationFromDb(op));
  } catch (error) {
    console.error("[Operation Service] Error fetching operations by template:", error);
    return [];
  }
}

/**
 * Update operation status
 */
export async function updateOperationStatus(
  operationId: string, 
  status: string, 
  options: { updateTimestamps?: boolean } = {}
): Promise<Operation | null> {
  if (!operationId) {
    throw new Error("Operation ID is required");
  }
  
  try {
    let updateData: any = { status };
    
    if (options.updateTimestamps) {
      if (status === "In Progress" && !operation?.actualStartTime) {
        updateData.actual_start_time = new Date().toISOString();
      }
      
      if (status === "Complete") {
        updateData.actual_end_time = new Date().toISOString();
      }
    }
    
    const { data, error } = await supabase
      .from('operations')
      .update(updateData)
      .eq('id', operationId)
      .select();
    
    if (error) throw error;
    
    return await getOperation(operationId);
  } catch (error) {
    console.error("[Operation Service] Error updating operation status:", error);
    throw error;
  }
}
