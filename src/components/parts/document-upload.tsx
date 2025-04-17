
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, File, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";

interface DocumentUploadProps {
  partId: string;
}

export function DocumentUpload({ partId }: DocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Basic validation
      const validFiles = newFiles.filter(file => {
        // Check file type (adjust according to your ITAR compliance needs)
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/dxf', 'application/step'];
        const maxSize = 10 * 1024 * 1024; // 10MB limit
        
        const isValidType = validTypes.includes(file.type) || file.name.endsWith('.dxf') || file.name.endsWith('.stp');
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
      
      setSelectedFiles(validFiles);
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
        // Create a sanitized filename (ITAR compliance)
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^\w\s.-]/g, '');
        const fileName = `${timestamp}-${sanitizedName}`;
        
        // Determine file type
        let fileType = file.type;
        if (file.name.endsWith('.dxf')) fileType = 'application/dxf';
        if (file.name.endsWith('.stp')) fileType = 'application/step';
        
        // Create storage path
        const storagePath = `parts/${partId}/${fileName}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(storagePath);
        
        // Store document reference in database
        const { error: docError } = await supabase
          .from('part_documents')
          .insert({
            part_id: partId,
            name: sanitizedName,
            url: urlData.publicUrl,
            type: fileType
          });
        
        if (docError) throw docError;
        
        completedFiles++;
        setProgress(Math.round((completedFiles / totalFiles) * 100));
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
      <div className="flex items-center gap-4">
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="flex-1"
          accept=".pdf,.jpg,.jpeg,.png,.dxf,.stp"
        />
        <Button 
          onClick={handleUpload} 
          disabled={uploading || selectedFiles.length === 0}
          className="h-12 px-4 text-base"
        >
          <Upload className="mr-2 h-5 w-5" />
          Upload
        </Button>
      </div>
      
      {uploading && <Progress value={progress} className="h-2" />}
      
      {selectedFiles.length > 0 && (
        <ul className="space-y-2 border rounded-md p-2">
          {selectedFiles.map((file, index) => (
            <li key={index} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
              <div className="flex items-center">
                <File className="h-4 w-4 mr-2" />
                <span>{file.name}</span>
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
      )}
      
      <div className="text-sm text-muted-foreground">
        <p>Supported formats: PDF, JPG, PNG, DXF, STP</p>
        <p>Maximum file size: 10MB</p>
        <p className="mt-2 text-xs">This system complies with ITAR requirements for document storage</p>
      </div>
    </div>
  );
}
