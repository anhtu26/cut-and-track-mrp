
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X, FileText, Image } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { documentService, DocumentType } from "@/lib/document-service";
import { DocumentViewer } from "@/components/parts/document-viewer";

interface DocumentItem {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  size?: number;
}

interface DocumentManagerProps {
  entityId: string;
  documentType: DocumentType;
  documents: DocumentItem[];
  onDocumentAdded?: () => void;
  onDocumentRemoved?: () => void;
  queryKey?: string[];
  maxSize?: number; // In MB
  allowedTypes?: string[];
  syncToTemplate?: boolean; // Whether to sync document changes to part templates
}

/**
 * Shared document manager component for handling document uploads and management
 */
export function DocumentManager({ 
  entityId, 
  documentType,
  documents = [], 
  onDocumentAdded,
  onDocumentRemoved,
  queryKey,
  maxSize = 10,
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'],
  syncToTemplate = false
}: DocumentManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (file.type.includes('image')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes
    
    const validFiles = acceptedFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      
      if (file.size > maxSizeBytes) {
        toast.error(`File too large: ${file.name} (max ${maxSize}MB)`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [maxSize, allowedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: true
  } as DropzoneOptions);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      const totalFiles = selectedFiles.length;
      let completedFiles = 0;
      
      for (const file of selectedFiles) {
        try {
          await documentService.uploadDocument({
            file,
            entityId,
            documentType,
            syncToTemplate,
            onProgress: (fileProgress) => {
              // Calculate overall progress
              const overallProgress = ((completedFiles + (fileProgress / 100)) / totalFiles) * 100;
              setProgress(Math.round(overallProgress));
            }
          });
          
          completedFiles++;
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Error uploading ${file.name}: ${error.message || "Unknown error"}`);
        }
      }
      
      toast.success("Documents uploaded successfully");
      setSelectedFiles([]);
      
      // Invalidate relevant queries
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      
      // Call the callback if provided
      onDocumentAdded?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDeleted = () => {
    // Invalidate relevant queries
    if (queryKey) {
      queryClient.invalidateQueries({ queryKey });
    }
    
    // Call the callback if provided
    onDocumentRemoved?.();
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
      >
        <input {...getInputProps()} accept=".pdf,.jpg,.jpeg,.png" disabled={uploading} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to select files"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supported formats: PDF, JPG, PNG (max {maxSize}MB)
          </p>
        </div>
      </div>
      
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">Uploading... {progress}%</p>
        </div>
      )}
      
      {selectedFiles.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Files to upload ({selectedFiles.length})</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUpload} 
              disabled={uploading || selectedFiles.length === 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload All
            </Button>
          </div>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                <div className="flex items-center">
                  {getFileIcon(file)}
                  <span className="ml-2 truncate max-w-[200px]">{file.name}</span>
                  <span className="ml-2 text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={uploading}
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {documents.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Uploaded Documents</h3>
          <ul className="space-y-2 border rounded-md p-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <div className="flex items-center">
                  {doc.type.includes('pdf') ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                  <span className="ml-2 text-sm">{doc.name}</span>
                </div>
                <DocumentViewer 
                  document={doc}
                  documentType={documentType}
                  onDelete={handleDocumentDeleted}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
