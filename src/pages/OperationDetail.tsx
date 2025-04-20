import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Operation, OperationStatus } from "@/types/operation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Clock, CalendarClock, User, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { OperationDocumentManager } from "@/components/operations/operation-document-manager";

export default function OperationDetail() {
  const { workOrderId, operationId } = useParams<{ workOrderId: string, operationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { data: operation, isLoading, error } = useQuery({
    queryKey: ["operation", operationId],
    queryFn: async () => {
      if (!operationId) {
        console.error("[OPERATION DETAIL] Missing operation ID");
        throw new Error("Operation ID is required");
      }
      
      try {
        console.log("[OPERATION DETAIL] Fetching operation:", operationId);
        
        const { data, error } = await supabase
          .from("operations")
          .select(`
            *,
            documents:operation_documents(*)
          `)
          .eq("id", operationId)
          .maybeSingle();
        
        if (error) {
          console.error("[OPERATION DETAIL ERROR]", error);
          setLoadError(error.message);
          throw error;
        }
        
        if (!data) {
          console.error("[OPERATION DETAIL] Operation not found:", operationId);
          setLoadError("Operation not found");
          throw new Error("Operation not found");
        }
        
        console.log("[OPERATION DETAIL] Fetched operation:", data);
        
        return {
          id: data.id,
          workOrderId: data.work_order_id,
          name: data.name,
          description: data.description || "",
          status: data.status as OperationStatus,
          machiningMethods: data.machining_methods || "",
          setupInstructions: data.setup_instructions || "",
          sequence: data.sequence || 0,
          isCustom: data.is_custom || false,
          estimatedStartTime: data.estimated_start_time,
          estimatedEndTime: data.estimated_end_time,
          actualStartTime: data.actual_start_time,
          actualEndTime: data.actual_end_time,
          comments: data.comments,
          assignedToId: data.assigned_to_id,
          assignedTo: data.assigned_to_id ? {
            id: data.assigned_to_id,
            name: "Unknown"
          } : undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          documents: (data.documents || []).map(doc => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            type: doc.type,
            uploadedAt: doc.uploaded_at,
            size: doc.size
          }))
        } as Operation;
      } catch (error) {
        console.error("[OPERATION DETAIL] Error fetching operation:", error);
        if (error instanceof Error) {
          setLoadError(error.message);
        } else {
          setLoadError("Unknown error occurred");
        }
        throw error;
      }
    },
    retry: 1,
    enabled: !!operationId,
  });

  const { mutateAsync: updateOperationStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async (status: OperationStatus) => {
      if (!operationId) throw new Error("Operation ID is required");
      
      let updateData: any = { status };
      
      if (status === "In Progress" && !operation?.actualStartTime) {
        updateData.actual_start_time = new Date().toISOString();
      }
      
      if (status === "Complete") {
        updateData.actual_end_time = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('operations')
        .update(updateData)
        .eq('id', operationId)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Operation status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
      setIsUpdateStatusDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error updating operation status:", error);
      toast.error(error.message || "Failed to update operation status");
    },
  });

  const handleDocumentAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
  };

  const handleDocumentRemoved = () => {
    queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading operation details...</p>
      </div>
    );
  }

  if (error || loadError || !operation) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading operation: {(error instanceof Error ? error.message : loadError) || "Unknown error"}
        </p>
        <Button variant="outline" asChild>
          <Link to={`/work-orders/${workOrderId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Order
          </Link>
        </Button>
      </div>
    );
  }

  const handleStatusUpdate = (status: OperationStatus) => {
    updateOperationStatus(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to={`/work-orders/${workOrderId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Order
          </Link>
        </Button>
        
        <div className="flex space-x-2">
          <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ListChecks className="mr-2 h-4 w-4" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Operation Status</DialogTitle>
                <DialogDescription>
                  Change the status of operation {operation.name}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                {["Not Started", "In Progress", "QC", "Complete"].map((status) => (
                  <Button
                    key={status}
                    variant={operation.status === status ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleStatusUpdate(status as OperationStatus)}
                    disabled={isUpdatingStatus}
                  >
                    <Badge variant={
                      status === "Complete" ? "secondary" : 
                      status === "In Progress" ? "default" : 
                      "outline"
                    } className="mr-2">
                      {status}
                    </Badge>
                  </Button>
                ))}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button asChild size="sm">
            <Link to={`/work-orders/${workOrderId}/operations/${operationId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {operation.name}
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Operation for Work Order #{workOrderId}
              </CardDescription>
            </div>
            <Badge variant={
              operation.status === "Complete" ? "secondary" : 
              operation.status === "In Progress" ? "default" : 
              "outline"
            }>
              {operation.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {operation.description && (
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                {operation.description}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {operation.setupInstructions && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Setup Instructions</h3>
                  <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {operation.setupInstructions}
                  </div>
                </div>
              )}
              
              {operation.machiningMethods && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Machining Methods</h3>
                  <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {operation.machiningMethods}
                  </div>
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <OperationDocumentManager 
                    operationId={operation.id}
                    documents={operation.documents || []}
                    onDocumentAdded={handleDocumentAdded}
                    onDocumentRemoved={handleDocumentRemoved}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Created: {format(new Date(operation.createdAt), "PPP")}</span>
                  </div>
                  
                  {operation.estimatedStartTime && (
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      <span>Estimated Start: {format(new Date(operation.estimatedStartTime), "PPP")}</span>
                    </div>
                  )}
                  
                  {operation.estimatedEndTime && (
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      <span>Estimated End: {format(new Date(operation.estimatedEndTime), "PPP")}</span>
                    </div>
                  )}
                  
                  {operation.actualStartTime && (
                    <div className="flex items-center text-amber-700 dark:text-amber-400">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      <span>Started: {format(new Date(operation.actualStartTime), "PPP HH:mm")}</span>
                    </div>
                  )}
                  
                  {operation.actualEndTime && (
                    <div className="flex items-center text-green-700 dark:text-green-500">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      <span>Completed: {format(new Date(operation.actualEndTime), "PPP HH:mm")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {operation.assignedTo && (
                <div>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Assignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Assigned to: {operation.assignedTo.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {operation.comments && (
                <div>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap">{operation.comments}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
