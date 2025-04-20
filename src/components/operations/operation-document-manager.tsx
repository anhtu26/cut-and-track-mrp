
import { useState, useCallback } from "react";
import { DocumentViewer } from "@/components/parts/document-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, X, FileText, Image } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DropzoneOptions, useDropzone } from "react-dropzone";

interface OperationDocumentManagerProps {
  operationId: string;
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  onDocumentAdded?: () => void;
  onDocumentRemoved?: () => void;
}

export function OperationDocumentManager({ 
  operationId, 
  documents = [], 
  onDocumentAdded,
  onDocumentRemoved 
}: OperationDocumentManagerProps) {
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
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true
  } as DropzoneOptions);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onDrop(Array.from(e.target.files));
    }
  };

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
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^\w\s.-]/g, '');
        const fileName = `${timestamp}-${sanitizedName}`;
        const storagePath = `operations/${operationId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(storagePath);
        
        if (!urlData?.publicUrl) {
          throw new Error("Failed to generate public URL");
        }
        
        const { error: insertError } = await supabase
          .from('operation_documents')
          .insert({
            operation_id: operationId,
            name: sanitizedName,
            url: urlData.publicUrl,
            type: file.type,
            size: file.size
          });
        
        if (insertError) throw insertError;
        
        completedFiles++;
        setProgress(Math.round((completedFiles / totalFiles) * 100));
      }
      
      toast.success("Documents uploaded successfully");
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['operation', operationId] });
      onDocumentAdded?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('operation_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      toast.success("Document deleted successfully");
      onDocumentRemoved?.();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(`Failed to delete document: ${error.message}`);
    }
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
            Supported formats: PDF, JPG, PNG (max 10MB)
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
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div className="flex items-center">
                    {doc.type.includes('pdf') ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <Image className="h-4 w-4" />
                    )}
                    <span className="ml-2">{doc.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DocumentViewer document={doc} />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
