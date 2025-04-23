
import { DocumentManager } from "@/components/shared/document-manager";

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
}

/**
 * Document manager specifically for operations
 */
export function OperationDocumentManager({ 
  operationId, 
  documents = [], 
  onDocumentAdded,
  onDocumentRemoved 
}: OperationDocumentManagerProps) {
  return (
    <DocumentManager
      entityId={operationId}
      documentType="operation"
      documents={documents}
      onDocumentAdded={onDocumentAdded}
      onDocumentRemoved={onDocumentRemoved}
      queryKey={['operation', operationId]}
      maxSize={10}
      allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
    />
  );
}
