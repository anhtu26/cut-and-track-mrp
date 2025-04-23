
import { DocumentManager } from "@/components/shared/document-manager";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";

interface OperationDocumentManagerProps {
  operationId: string;
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
    size?: number;
  }>;
  onDocumentAdded?: () => void;
  onDocumentRemoved?: () => void;
  syncToTemplate?: boolean; // Default sync option
}

/**
 * Document manager specifically for operations
 * Includes option to sync document changes to part templates
 */
export function OperationDocumentManager({ 
  operationId, 
  documents = [], 
  onDocumentAdded,
  onDocumentRemoved,
  syncToTemplate: defaultSyncOption = false
}: OperationDocumentManagerProps) {
  // State for sync to template option
  const [syncToTemplate, setSyncToTemplate] = useState(defaultSyncOption);
  
  return (
    <div className="space-y-4">
      {/* Sync to template option */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`sync-docs-${operationId}`}
          checked={syncToTemplate}
          onCheckedChange={(checked) => setSyncToTemplate(checked === true)}
        />
        <label 
          htmlFor={`sync-docs-${operationId}`}
          className="text-xs font-medium leading-none cursor-pointer flex items-center"
        >
          <Save className="h-3 w-3 mr-1 text-amber-600" />
          Sync document changes to part library
        </label>
      </div>
      
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
