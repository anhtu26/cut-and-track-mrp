import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { File, Maximize, FileText, Image } from "lucide-react";
import { PartDocument } from "@/types/part";

interface DocumentViewerProps {
  document: PartDocument;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1 text-primary"
        onClick={() => setIsOpen(true)}
      >
        {getDocumentIcon(document.type)}
        <span>View</span>
      </Button>

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
    </>
  );
}
