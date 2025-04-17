
import { useState } from "react";
import { FileText, File, Image } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { PartDocument } from "@/types/part";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/stores/user-store";

interface DocumentViewerProps {
  documents: PartDocument[];
  isLoading?: boolean;
}

export function DocumentViewer({ documents, isLoading = false }: DocumentViewerProps) {
  const { user } = useUserStore();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Helper function to get appropriate icon for document type
  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };
  
  // Format file size
  const formatFileSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Function to get a fresh URL for a document
  const handleDocumentClick = async (document: PartDocument) => {
    try {
      console.log("[DOCUMENT VIEW] Attempting to view document:", document.name);
      console.log("[DOCUMENT VIEW] Current user role:", user?.role);
      
      // Extract the storage path from the document
      let storagePath = document.storagePath;
      
      // If storagePath is not available, try to extract from URL
      if (!storagePath) {
        const pathMatch = document.url.match(/\/documents\/([^?]+)/);
        
        if (!pathMatch) {
          console.error("[DOCUMENT VIEW ERROR] Unable to extract storage path from URL");
          toast.error("Failed to access document. Invalid URL format.");
          return;
        }
        
        storagePath = pathMatch[1];
      }
      
      console.log("[DOCUMENT VIEW] Using storage path:", storagePath);
      
      // Get fresh signed URL with 1 hour expiry
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(storagePath, 60 * 60);
      
      if (error) {
        console.error("[DOCUMENT VIEW ERROR] Failed to generate URL:", error);
        toast.error("Failed to access document. Please try again.");
        return;
      }
      
      // Log success and open document in new tab
      console.log("[DOCUMENT VIEW] URL generated successfully");
      window.open(data.signedUrl, '_blank');
      
    } catch (error: any) {
      console.error("[DOCUMENT VIEW ERROR] Unexpected error:", error);
      toast.error(`Failed to open document: ${error.message || "Unknown error"}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return documents && documents.length > 0 ? (
    <ul className="space-y-2 mt-6">
      {documents.map((doc, i) => (
        <li key={i} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {getDocumentIcon(doc.type)}
            </div>
            <div>
              <div className="text-sm font-medium">{doc.name}</div>
              <div className="flex space-x-2 text-xs text-muted-foreground">
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                {doc.size && <span>•</span>}
                {doc.size && <span>{formatFileSize(doc.size)}</span>}
              </div>
            </div>
          </div>
          <button 
            onClick={() => handleDocumentClick(doc)}
            className="text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-md transition-colors"
            aria-label={`View ${doc.name}`}
          >
            View
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-center text-muted-foreground py-6">No documents available</p>
  );
}
