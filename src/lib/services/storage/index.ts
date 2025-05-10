import axios from 'axios';
import AuthService from '../auth';

// Configure API URL from environment or default to localhost in development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * FileStorageService - Handles file operations with the local storage API
 */
export const FileStorageService = {
  /**
   * Upload a file to local storage
   * @param file - The file to upload
   * @param docType - The document type (part, operation, workorder)
   * @param metadata - Additional metadata for the file
   * @returns The uploaded document data
   */
  uploadFile: async (file: File, docType: string, metadata: Record<string, any> = {}) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      formData.append('metadata', JSON.stringify(metadata));
      
      // Upload to local server
      const response = await axios.post(`${API_URL}/storage/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...AuthService.authHeader()
        }
      });
      
      return {
        data: response.data.document,
        error: null
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        data: null,
        error: error.response?.data?.message || 'Error uploading file'
      };
    }
  },
  
  /**
   * Get documents for a specific parent entity
   * @param parentType - The type of parent (part, operation, workorder)
   * @param parentId - The ID of the parent entity
   * @returns List of documents
   */
  getDocuments: async (parentType: string, parentId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/storage/documents/${parentType}/${parentId}`,
        { headers: AuthService.authHeader() }
      );
      
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Get documents error:', error);
      return {
        data: null,
        error: error.response?.data?.message || 'Error fetching documents'
      };
    }
  },
  
  /**
   * Delete a document
   * @param documentId - The ID of the document to delete
   * @returns Success status
   */
  deleteDocument: async (documentId: string) => {
    try {
      await axios.delete(
        `${API_URL}/storage/documents/${documentId}`,
        { headers: AuthService.authHeader() }
      );
      
      return {
        data: { success: true },
        error: null
      };
    } catch (error) {
      console.error('Delete document error:', error);
      return {
        data: null,
        error: error.response?.data?.message || 'Error deleting document'
      };
    }
  },
  
  /**
   * Get public URL for a file path
   * @param filePath - The file path
   * @returns The public URL
   */
  getPublicUrl: (filePath: string) => {
    // In our local setup, the URL is already public
    // Just ensure it has the correct format
    const baseUrl = window.location.origin;
    
    // If path already starts with http or //, return as is
    if (filePath.startsWith('http') || filePath.startsWith('//')) {
      return filePath;
    }
    
    // Ensure path starts with /
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    
    return `${baseUrl}${normalizedPath}`;
  }
};

export default FileStorageService;
