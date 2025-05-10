import { toast } from "sonner";
import { FileStorageService } from '@/lib/services/storage';

/**
 * Document types supported by the application
 */
export type DocumentType = 'part' | 'operation' | 'workorder';

/**
 * Document metadata interface
 */
export interface DocumentMetadata {
  parentId: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Document interface representing a stored file
 */
export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  metadata: DocumentMetadata;
  parent_id: string;
  parent_type: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Document service provides methods for managing documents
 * in the local storage system
 */
export const DocumentService = {
  /**
   * Upload a document to local storage and create a database record
   * @param file - The file to upload
   * @param documentType - Type of document (part, operation, workorder)
   * @param parentId - ID of the parent resource
   * @param metadata - Optional additional metadata
   * @returns The uploaded document data
   */
  uploadDocument: async (
    file: File,
    documentType: DocumentType,
    parentId: string,
    metadata: Partial<DocumentMetadata> = {}
  ) => {
    try {
      // Prepare metadata object
      const documentMetadata: DocumentMetadata = {
        parentId,
        title: metadata.title || file.name,
        description: metadata.description || '',
        ...metadata
      };
      
      // Upload file to local storage
      const { data, error } = await FileStorageService.uploadFile(
        file,
        documentType,
        documentMetadata
      );
      
      if (error || !data) {
        throw new Error(error || 'Error uploading document');
      }
      
      return {
        success: true,
        data: data as Document,
        error: null
      };
    } catch (error) {
      console.error('[Document Service] Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },
  
  /**
   * Get documents for a specific parent entity
   * @param documentType - Type of documents to retrieve
   * @param parentId - ID of the parent resource
   * @returns List of documents
   */
  getDocuments: async (documentType: DocumentType, parentId: string) => {
    try {
      const { data, error } = await FileStorageService.getDocuments(documentType, parentId);
      
      if (error || !data) {
        throw new Error(error || 'Error retrieving documents');
      }
      
      return {
        success: true,
        data: data as Document[],
        error: null
      };
    } catch (error) {
      console.error('[Document Service] Get documents error:', error);
      
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },
  
  /**
   * Delete a document from storage and database
   * @param documentId - ID of the document to delete
   * @returns Success status
   */
  deleteDocument: async (documentId: string) => {
    try {
      const { error } = await FileStorageService.deleteDocument(documentId);
      
      if (error) {
        throw new Error(error);
      }
      
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('[Document Service] Delete error:', error);
      toast.error(`Delete failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Get a public URL for a document
   * @param url - The document URL
   * @returns The public accessible URL
   */
  getPublicUrl: (url: string) => {
    return FileStorageService.getPublicUrl(url);
  }
};

export default DocumentService;
