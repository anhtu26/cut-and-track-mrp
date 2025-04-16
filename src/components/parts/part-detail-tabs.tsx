
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PartDocument, OperationTemplate } from "@/types/part";
import { OperationTemplatesList } from "./operation-templates-list";
import { Link } from "react-router-dom";

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
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
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
                {materials.map((material, i) => (
                  <span key={i} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                    {material}
                  </span>
                ))}
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
                          <td className="px-4 py-2">{order.customer.name}</td>
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
            {documents.length > 0 ? (
              <ul className="space-y-2">
                {documents.map((doc, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">{doc.name}</div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <a 
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-6">No documents available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
