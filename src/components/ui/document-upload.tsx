import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  buttonText?: string;
  className?: string;
}

export function DocumentUpload({
  onUpload,
  isUploading = false,
  accept = "*",
  maxSize = 10, // Default 10MB
  buttonText = "Upload Document",
  className = ""
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File size exceeds ${maxSize}MB limit`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
      </div>
      
      {selectedFile && (
        <div className="flex items-center justify-between p-2 border rounded-md bg-muted">
          <div className="flex items-center space-x-2 overflow-hidden">
            <File className="h-4 w-4 shrink-0" />
            <span className="text-sm truncate">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleClearSelection}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <Button 
              type="button" 
              size="sm" 
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
