
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "@/types/operation";

export function useOperation(operationId: string | undefined) {
  return useQuery({
    queryKey: ["operation", operationId],
    queryFn: async () => {
      if (!operationId) {
        throw new Error("Operation ID is required");
      }
      
      const { data, error } = await supabase
        .from("operations")
        .select(`
          *,
          documents:operation_documents(*)
        `)
        .eq("id", operationId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Operation not found");
      
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
        comments: data.comments,
        assignedToId: data.assigned_to_id,
        assignedTo: data.assigned_to_id ? {
          id: data.assigned_to_id,
          name: "Unknown"
        } : undefined,
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
    },
    retry: 1,
    enabled: !!operationId,
  });
}
