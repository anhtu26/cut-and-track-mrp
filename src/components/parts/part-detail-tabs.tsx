
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PartDocument, OperationTemplate } from "@/types/part";
import { OperationTemplatesList } from "./operation-templates-list";
import { Link } from "react-router-dom";
import { DocumentUpload } from "./document-upload";
import { FileText, File, Image } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface PartDetailTabsProps {
  partId: string;
  description: string;
  materials: string[];
  documents: PartDocument[];
  operationTemplates: OperationTemplate[];
  workOrders?: any[]; // Work orders related to this part
}

export function PartDetailTabs({
  partId,
  description,
  materials,
  documents,
  operationTemplates = [],
  workOrders = []
}: PartDetailTabsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Helper function to get appropriate icon for document type
  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return <File className="h-4 w-4" />;
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };
  
  // Format file size (if available in the future)
  const formatFileSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Function to get a fresh URL for a document
  const handleDocumentClick = async (document: PartDocument) => {
    try {
      // Extract the file path from the URL or use document path
      const pathMatch = document.url.match(/\/documents\/([^?]+)/);
      
      if (!pathMatch) {
        // If we can't extract path, just open the existing URL
        window.open(document.url, '_blank');
        return;
      }
      
      const filePath = pathMatch[1];
      
      // Get fresh signed URL
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60); // 1 hour
      
      if (error) {
        console.error("Error getting document URL:", error);
        toast.error("Failed to access document. Please try again.");
        return;
      }
      
      // Open document in new tab
      window.open(data.signedUrl, '_blank');
      
    } catch (error) {
      console.error("Error opening document:", error);
      toast.error("Failed to open document. Please try again.");
    }
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle>Part Details</CardTitle>
            <CardDescription>Detailed information about this part</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Materials</h4>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(materials) && materials.length > 0 ? (
                  materials.map((material, i) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      {material}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No materials specified</span>
                )}
              </div>
            </div>

            {workOrders && workOrders.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Recent Work Orders</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Work Order #</th>
                        <th className="px-4 py-2 text-left font-medium">Customer</th>
                        <th className="px-4 py-2 text-left font-medium">Status</th>
                        <th className="px-4 py-2 text-left font-medium">Date Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-t">
                          <td className="px-4 py-2">
                            <Link 
                              to={`/work-orders/${order.id}`}
                              className="text-primary hover:underline"
                            >
                              {order.workOrderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-2">{order.customer?.name || 'Unknown Customer'}</td>
                          <td className="px-4 py-2">{order.status}</td>
                          <td className="px-4 py-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {workOrders.length > 5 && (
                  <div className="mt-2 text-right">
                    <Link 
                      to={`/work-orders?partId=${partId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View all {workOrders.length} work orders
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="operations">
        <Card>
          <CardHeader>
            <CardTitle>Operation Templates</CardTitle>
            <CardDescription>
              Define operation templates that will be automatically applied when creating work orders for this part.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OperationTemplatesList partId={partId} templates={operationTemplates} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle>Documents & Drawings</CardTitle>
            <CardDescription>Attached files and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload partId={partId} />
            
            {documents && documents.length > 0 ? (
              <ul className="space-y-2 mt-6">
                {documents.map((doc, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{doc.name}</div>
                        <div className="flex space-x-2 text-xs text-muted-foreground">
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          {doc.size && <span>•</span>}
                          {doc.size && <span>{formatFileSize(doc.size)}</span>}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDocumentClick(doc)}
                      className="text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-md transition-colors"
                      aria-label={`View ${doc.name}`}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-6">No documents available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Part History</CardTitle>
            <CardDescription>Changes and revisions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-6">History tracking coming soon</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
