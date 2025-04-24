
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OperationStatus } from "@/types/operation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { OperationDocumentManager } from "@/components/operations/operation-document-manager";
import { useOperation } from "@/hooks/useOperation";
import { OperationHeader } from "@/components/operations/operation-header";
import { OperationDetailsCard } from "@/components/operations/operation-details-card";
import { OperationTimelineCard } from "@/components/operations/operation-timeline-card";
import { OperationAssignmentCard } from "@/components/operations/operation-assignment-card";
import { OperationCommentsCard } from "@/components/operations/operation-comments-card";


export default function OperationDetail() {
  const { workOrderId, operationId } = useParams<{ workOrderId: string, operationId: string }>();
  const queryClient = useQueryClient();
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);

  // Explicitly log params to debug
  console.log("[OperationDetail] Params:", { workOrderId, operationId });

  const { data: operation, isLoading, error } = useOperation(operationId);

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

  const handleStatusUpdate = (status: OperationStatus) => {
    updateOperationStatus(status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading operation details...</p>
      </div>
    );
  }

  if (error || !operation) {
    console.error("Operation detail error:", error);
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading operation: {error instanceof Error ? error.message : "Unknown error"}
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

  const handleDocumentAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
  };

  const handleDocumentRemoved = () => {
    queryClient.invalidateQueries({ queryKey: ["operation", operationId] });
  };

  return (
    <div className="space-y-6">
      <OperationHeader 
        operation={operation}
        onUpdateStatusClick={() => setIsUpdateStatusDialogOpen(true)}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{operation.name}</CardTitle>
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
              <OperationDetailsCard operation={operation} />
              
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
              <OperationTimelineCard operation={operation} />
              
              {operation.assignedTo && (
                <OperationAssignmentCard assignedTo={operation.assignedTo} />
              )}
              
              {operation.comments && (
                <OperationCommentsCard comments={operation.comments} />
              )}
              

            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
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
    </div>
  );
}
