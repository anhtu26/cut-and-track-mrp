
import { apiClient } from '@/lib/api/client';;
import { toast } from "@/components/ui/sonner";
import { PartDocument } from "@/types/part";
import { OperationDocument } from "@/types/operation";
import { addOperationDocument, removeOperationDocument } from "./operation-service";

export type DocumentType = "part" | "operation";

interface DocumentBase {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  size?: number;
}

interface UploadDocumentOptions {
  file: File;
  entityId: string;
  documentType: DocumentType;
  onProgress?: (progress: number) => void;
  syncToTemplate?: boolean; // Whether to sync operation documents to part templates
}

interface DeleteDocumentOptions {
  documentId: string;
  documentType: DocumentType;
  syncToTemplate?: boolean; // Whether to sync operation document deletions to part templates
}

/**
 * Document service for handling document operations across the application
 */
export const documentService = {
  /**
   * Upload a document to Supabase storage and create a database record
   * For operations, can optionally sync to part template
   */
  async uploadDocument({ file, entityId, documentType, onProgress, syncToTemplate = false }: UploadDocumentOptions) {
    try {
      console.log(`[Document Service] Uploading ${documentType} document:`, file.name);
      
      // Create a sanitized filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^\w\s.-]/g, '');
      const fileName = `${timestamp}-${sanitizedName}`;
      
      // Set storage path based on document type
      const storagePath = documentType === "part" 
        ? `parts/${entityId}/${fileName}`
        : `operations/${entityId}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await apiClient.storage
        .from('documents')
        .upload(storagePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = apiClient.storage
        .from('documents')
        .getPublicUrl(storagePath);
      
      if (!urlData?.publicUrl) {
        throw new Error("Failed to generate public URL");
      }
      
      // Handle document record creation based on type
      if (documentType === "part") {
        // Insert part document record
        const { error: insertError } = await supabase
          .from('part_documents')
          .insert({
            part_id: entityId,
            name: sanitizedName,
            url: urlData.publicUrl,
            type: file.type,
            size: file.size,
            uploaded_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
      } else {
        // For operations, use the operation service to handle document creation
        // This allows for template syncing if enabled
        await addOperationDocument(entityId, {
          name: sanitizedName,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size
        }, { syncToTemplate });
      }
      
      // Report progress
      if (onProgress) onProgress(100);
      
      console.log(`[Document Service] Document uploaded successfully: ${sanitizedName}`);
      return {
        success: true,
        url: urlData.publicUrl,
        name: sanitizedName
      };
    } catch (error: any) {
      console.error(`[Document Upload Error]: ${error.message}`, error);
      throw error;
    }
  },
  
  /**
   * Delete a document from Supabase storage and remove the database record
   * For operations, can optionally sync deletion to part template
   */
  async deleteDocument({ documentId, documentType, syncToTemplate = false }: DeleteDocumentOptions) {
    try {
      console.log(`[Document Service] Deleting ${documentType} document with ID:`, documentId);
      
      // First get the document to extract the URL
      const tableName = documentType === "part" ? 'part_documents' : 'operation_documents';
      const { data: document, error: fetchError } = await supabase
        .from(tableName)
        .select('url')
        .eq('id', documentId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!document) throw new Error("Document not found");
      
      // Extract storage path from URL
      const url = new URL(document.url);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
      
      if (pathMatch && pathMatch[1]) {
        // Delete from storage first
        const storagePath = pathMatch[1];
        const { error: storageError } = await apiClient.storage
          .from('documents')
          .remove([storagePath]);
        
        // Log but continue even if storage deletion fails
        // Sometimes the file might already be removed
        if (storageError) {
          console.warn(`[Storage Delete Warning]: ${storageError.message}`, storageError);
        }
      }
      
      // Handle database deletion based on document type
      if (documentType === "part") {
        // Delete part document from database
        const { error: deleteError } = await supabase
          .from('part_documents')
          .delete()
          .eq('id', documentId);
        
        if (deleteError) throw deleteError;
      } else {
        // For operations, use the operation service to handle document deletion
        // This allows for template syncing if enabled
        await removeOperationDocument(documentId, { syncToTemplate });
      }
      
      console.log(`[Document Service] Document deleted successfully`);
      return { success: true };
    } catch (error: any) {
      console.error(`[Document Delete Error]: ${error.message}`, error);
      throw error;
    }
  },
  
  /**
   * Get documents for an entity (part or operation)
   */
  async getDocuments(entityId: string, documentType: DocumentType): Promise<DocumentBase[]> {
    try {
      console.log(`[Document Service] Fetching ${documentType} documents for entity:`, entityId);
      
      const tableName = documentType === "part" ? 'part_documents' : 'operation_documents';
      const idField = documentType === "part" ? 'part_id' : 'operation_id';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(idField, entityId);
      
      if (error) throw error;
      
      const documents = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type,
        uploadedAt: doc.uploaded_at,
        size: doc.size
      }));
      
      console.log(`[Document Service] Found ${documents.length} documents`);
      return documents;
    } catch (error: any) {
      console.error(`[Document Fetch Error]: ${error.message}`, error);
      throw error;
    }
  }
};
