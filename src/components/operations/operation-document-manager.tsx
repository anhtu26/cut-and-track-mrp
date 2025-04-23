import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OperationDocument } from "@/types/operation";
import { DocumentManager } from "@/components/shared/document-manager";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface OperationDocumentManagerProps {
  operationId: string;
  documents: OperationDocument[];
  onDocumentAdded?: () => void;
  onDocumentRemoved?: () => void;
  defaultSyncToTemplate?: boolean;
}

/**
 * Document manager specifically for operations
 * Includes option to sync document changes to part templates
 */
export function OperationDocumentManager({
  operationId,
  documents,
  onDocumentAdded,
  onDocumentRemoved,
  defaultSyncToTemplate = false
}: OperationDocumentManagerProps) {
  const [syncToTemplate, setSyncToTemplate] = useState(defaultSyncToTemplate);
  const { workOrderId } = useParams<{ workOrderId: string }>();
  
  // Check if this operation has a template
  const { data: hasTemplate } = useQuery({
    queryKey: ["operation-has-template", operationId],
    queryFn: async () => {
      if (!workOrderId || !operationId) return false;
      
      // Get the work order to find the part ID
      const { data: workOrder } = await supabase
        .from("work_orders")
        .select("part_id")
        .eq("id", workOrderId)
        .maybeSingle();
        
      if (!workOrder?.part_id) return false;
      
      // Get the operation name
      const { data: operation } = await supabase
        .from("operations")
        .select("name")
        .eq("id", operationId)
        .maybeSingle();
        
      if (!operation?.name) return false;
      
      // Check if a template exists for this operation
      const { data: template } = await supabase
        .from("operation_templates")
        .select("id")
        .eq("part_id", workOrder.part_id)
        .eq("name", operation.name)
        .maybeSingle();
        
      return !!template;
    },
    enabled: !!workOrderId && !!operationId,
  });
  
  return (
    <div className="space-y-4">
      {hasTemplate !== false && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="sync-to-template" 
            checked={syncToTemplate} 
            onCheckedChange={(checked) => setSyncToTemplate(checked === true)}
          />
          <Label htmlFor="sync-to-template">
            Sync document changes to part template
          </Label>
        </div>
      )}
      
      <DocumentManager
        entityId={operationId}
        documentType="operation"
        documents={documents}
        onDocumentAdded={onDocumentAdded}
        onDocumentRemoved={onDocumentRemoved}
        queryKey={['operation', operationId]}
        maxSize={10}
        allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
        syncToTemplate={syncToTemplate}
      />
    </div>
  );
}
