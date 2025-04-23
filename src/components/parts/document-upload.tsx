
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, File, X, FileText, Image } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { documentService } from "@/lib/document-service";

interface DocumentUploadProps {
  partId: string;
}

export function DocumentUpload({ partId }: DocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  // Get file icon based on file type
  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (file.type.includes('image')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // File validation and processing
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Basic validation
    const validFiles = acceptedFiles.filter(file => {
      // Check file type (adjust according to your ITAR compliance needs)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/dxf', 'application/step', 'model/step+xml'];
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      
      // Check by extension for files that might not have proper MIME type
      const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.dxf', '.stp', '.step'];
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      const isValidType = validTypes.includes(file.type) || 
                         validExtensions.includes(fileExtension);
      const isValidSize = file.size <= maxSize;
      
      if (!isValidType) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`File too large: ${file.name} (max 10MB)`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/dxf': ['.dxf'],
      'application/step': ['.stp', '.step'],
      'model/step+xml': ['.stp', '.step']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
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
        try {
          await documentService.uploadDocument({
            file,
            entityId: partId,
            documentType: "part",
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
      queryClient.invalidateQueries({ queryKey: ['part', partId] });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
      >
        <input {...getInputProps()} accept=".pdf,.jpg,.jpeg,.png,.dxf,.stp,.step" disabled={uploading} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to select files"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supported formats: PDF, JPG, PNG, DXF, STP
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
          <ul className="space-y-2 border rounded-md p-2">
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
      
      <div className="text-sm text-muted-foreground">
        <p>Supported formats: PDF, JPG, PNG, DXF, STP</p>
        <p>Maximum file size: 10MB</p>
        <p className="mt-2 text-xs">This system complies with ITAR requirements for document storage</p>
      </div>
    </div>
  );
}
