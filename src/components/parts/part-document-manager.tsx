
import { DocumentManager } from "@/components/shared/document-manager";

interface PartDocumentManagerProps {
  partId: string;
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
 * Document manager specifically for parts
 */
export function PartDocumentManager({ 
  partId, 
  documents = [], 
  onDocumentAdded,
  onDocumentRemoved 
}: PartDocumentManagerProps) {
  return (
    <DocumentManager
      entityId={partId}
      documentType="part"
      documents={documents}
      onDocumentAdded={onDocumentAdded}
      onDocumentRemoved={onDocumentRemoved}
      queryKey={['part', partId]}
      maxSize={25} // Allow larger files for parts (CAD files, etc.)
      allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'application/step', 'model/stl']}
    />
  );
}
