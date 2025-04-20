
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { File, Maximize, FileText, Image, Trash2 } from "lucide-react";
import { PartDocument } from "@/types/part";
import { OperationDocument } from "@/types/operation";
import { documentService, DocumentType } from "@/lib/document-service";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

type Document = PartDocument | OperationDocument;

interface DocumentViewerProps {
  document: Document;
  documentType?: DocumentType;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export function DocumentViewer({
  document,
  documentType = "part",
  onDelete,
  showDeleteButton = true
}: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to get appropriate icon for document type
  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Determine viewer type based on document type
  const renderViewer = () => {
    if (document.type.includes('pdf')) {
      return (
        <iframe 
          src={`${document.url}#toolbar=0&navpanes=0`} 
          className="w-full h-[80vh]" 
          title={document.name}
        />
      );
    } else if (document.type.includes('image')) {
      return (
        <div className="flex justify-center">
          <img 
            src={document.url} 
            alt={document.name} 
            className="max-h-[80vh] object-contain" 
          />
        </div>
      );
    } else {
      return (
        <div className="p-8 text-center">
          <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p>This file type cannot be previewed in browser.</p>
          <Button 
            className="mt-4"
            asChild
          >
            <a 
              href={document.url} 
              target="_blank" 
              rel="noopener noreferrer"
              download
            >
              Download
            </a>
          </Button>
        </div>
      );
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await documentService.deleteDocument({
        documentId: document.id,
        documentType
      });
      
      toast.success('Document deleted successfully');
      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete();
    } catch (error: any) {
      toast.error(`Failed to delete document: ${error.message || 'Unknown error'}`);
      console.error('Error deleting document:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 text-primary"
          onClick={() => setIsOpen(true)}
        >
          {getDocumentIcon(document.type)}
          <span>View</span>
        </Button>

        {showDeleteButton && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getDocumentIcon(document.type)}
              <span>{document.name}</span>
            </DialogTitle>
            <a 
              href={document.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute top-4 right-12 text-gray-500 hover:text-gray-700"
              title="Open in new window"
            >
              <Maximize className="h-4 w-4" />
            </a>
          </DialogHeader>
          <div className="mt-4">
            {renderViewer()}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{document.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
