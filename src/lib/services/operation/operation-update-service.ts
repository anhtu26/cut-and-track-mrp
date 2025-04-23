/**
 * Operation Update Service
 * 
 * Handles updating operations in the database
 */
import { supabase } from "@/integrations/supabase/client";
import { Operation, UpdateOperationInput } from "@/types/operation";
import { mapOperationToDb } from "./operation-mapper";
import { getOperation } from "./operation-query-service";
import { syncOperationToTemplate } from "./template-sync-service";

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
    console.log("[Operation Service] Updating operation:", operationId);
    
    // Prepare operation data for update
    const operationData = mapOperationToDb(data);
    
    // Update the operation
    const { error: updateError } = await supabase
      .from("operations")
      .update(operationData)
      .eq("id", operationId);
      
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
 * Create a new operation
 */
export async function createOperation(
  workOrderId: string,
  data: Omit<UpdateOperationInput, "id">,
  options: { syncToTemplate?: boolean } = {}
): Promise<Operation> {
  if (!workOrderId) {
    throw new Error("Work order ID is required");
  }

  try {
    // Prepare operation data
    const operationData = {
      ...mapOperationToDb(data),
      work_order_id: workOrderId,
      created_at: new Date().toISOString()
    };
    
    // Create the operation
    const { data: newOperation, error } = await supabase
      .from("operations")
      .insert(operationData)
      .select()
      .single();
      
    if (error) throw error;
    
    // If syncToTemplate is true, create/update the template in the part library
    if (options.syncToTemplate && newOperation) {
      await syncOperationToTemplate(newOperation.id, operationData);
    }
    
    // Return the created operation
    return await getOperation(newOperation.id) as Operation;
  } catch (error) {
    console.error("[Operation Service] Error creating operation:", error);
    throw error;
  }
}

/**
 * Delete an operation
 */
export async function deleteOperation(operationId: string): Promise<void> {
  if (!operationId) {
    throw new Error("Operation ID is required");
  }

  try {
    // Delete all documents first
    const { error: docDeleteError } = await supabase
      .from("operation_documents")
      .delete()
      .eq("operation_id", operationId);
      
    if (docDeleteError) {
      console.error("[Operation Service] Error deleting operation documents:", docDeleteError);
      // Continue anyway to try deleting the operation
    }
    
    // Delete the operation
    const { error } = await supabase
      .from("operations")
      .delete()
      .eq("id", operationId);
      
    if (error) throw error;
  } catch (error) {
    console.error("[Operation Service] Error deleting operation:", error);
    throw error;
  }
}
