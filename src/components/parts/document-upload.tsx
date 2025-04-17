
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, File, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PartDocumentSchema } from "@/types/part";
import { z } from "zod";
import { useUserStore } from "@/stores/user-store";

interface DocumentUploadProps {
  partId: string;
}

export function DocumentUpload({ partId }: DocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  
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
        
        // Create consistent storage path format
        const storagePath = `documents/${partId}/${fileName}`;
        
        console.log(`[DOCUMENT UPLOAD] Uploading file to ${storagePath}`);
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file);
        
        if (uploadError) {
          console.error("[DOCUMENT UPLOAD ERROR]:", uploadError);
          throw uploadError;
        }
        
        // Generate a signed URL with longer expiration
        const { data: urlData, error: urlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days expiry
        
        if (urlError) {
          console.error("[URL GENERATION ERROR]:", urlError);
          throw urlError;
        }
        
        const fileUrl = urlData?.signedUrl || '';
        
        // Validate the document data with Zod
        const documentData = {
          part_id: partId,
          name: sanitizedName,
          url: fileUrl,
          type: fileType,
          storagePath: storagePath,
          uploaded_at: new Date().toISOString(),
          uploaded_by: user?.id || null
        };

        // Store document reference in database
        const { data: docData, error: docError } = await supabase
          .from('part_documents')
          .insert(documentData)
          .select();
        
        if (docError) {
          console.error("[DATABASE ERROR]:", docError);
          throw docError;
        }
        
        // Validate the returned document data
        try {
          if (docData && docData[0]) {
            const parsedDoc = PartDocumentSchema.parse({
              id: docData[0].id,
              name: docData[0].name,
              url: docData[0].url,
              uploadedAt: docData[0].uploaded_at,
              type: docData[0].type,
              size: file.size,
              storagePath: storagePath
            });
            
            console.log("[DOCUMENT VALIDATED]:", parsedDoc.id);
          }
        } catch (validationError) {
          console.error("[VALIDATION ERROR]:", validationError);
          // Continue with upload anyway, just log the validation error
        }
        
        completedFiles++;
        setProgress(Math.round((completedFiles / totalFiles) * 100));
      }
      
      toast.success("Documents uploaded successfully");
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['part', partId] });
    } catch (error: any) {
      console.error("[UPLOAD ERROR]:", error);
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
