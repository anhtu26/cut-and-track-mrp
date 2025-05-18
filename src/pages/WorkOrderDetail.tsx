import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from '@/lib/api/client';;
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { Operation, OperationStatus, UpdateOperationInput } from "@/types/operation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Archive, CalendarClock, Package, User, ListChecks, AlertTriangle, CheckCircle2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { getStatusBadgeVariant, getPriorityBadgeVariant } from "@/types/work-order-status";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const archiveReasonSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export default function WorkOrderDetail() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [editedOperations, setEditedOperations] = useState<Record<string, Partial<UpdateOperationInput>>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  const archiveForm = useForm<z.infer<typeof archiveReasonSchema>>({
    resolver: zodResolver(archiveReasonSchema),
    defaultValues: {
      reason: "",
    },
  });

  const { data: workOrder, isLoading, error } = useQuery({
    queryKey: ["work-order", workOrderId],
    queryFn: async () => {
      if (!workOrderId) throw new Error("Work Order ID is required");
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customer:customers(*),
          part:parts(*),
          operations:operations(*)
        `)
        .eq('id', workOrderId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Work Order not found");
      
      return {
        id: data.id,
        workOrderNumber: data.work_order_number,
        purchaseOrderNumber: data.purchase_order_number,
        customer: {
          id: data.customer.id,
          name: data.customer.name,
          company: data.customer.company,
          email: data.customer.email,
          phone: data.customer.phone,
          address: data.customer.address,
          active: data.customer.active,
          notes: data.customer.notes,
          createdAt: data.customer.created_at,
          updatedAt: data.customer.updated_at,
          orderCount: data.customer.order_count || 0
        },
        customerId: data.customer_id,
        part: {
          id: data.part.id,
          name: data.part.name,
          partNumber: data.part.part_number,
          description: data.part.description,
          active: data.part.active,
          materials: data.part.materials || [],
          setupInstructions: data.part.setup_instructions,
          machiningMethods: data.part.machining_methods,
          revisionNumber: data.part.revision_number,
          createdAt: data.part.created_at,
          updatedAt: data.part.updated_at,
          documents: [],
          archived: data.part.archived,
          archivedAt: data.part.archived_at,
          archiveReason: data.part.archive_reason
        },
        partId: data.part_id,
        quantity: data.quantity,
        status: data.status as WorkOrderStatus,
        priority: data.priority as WorkOrderPriority,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        startDate: data.start_date,
        dueDate: data.due_date,
        completedDate: data.completed_date,
        assignedTo: data.assigned_to_id ? {
          id: data.assigned_to_id,
          name: data.assigned_to_name || "Unknown"
        } : undefined,
        notes: data.notes,
        operations: (data.operations || [])
          .map((op: any) => ({
            id: op.id,
            workOrderId: op.work_order_id,
            name: op.name,
            description: op.description || "",
            status: op.status as OperationStatus,
            machiningMethods: op.machining_methods || "",
            setupInstructions: op.setup_instructions || "",
            sequence: op.sequence || 0,
            isCustom: op.is_custom || false,
            estimatedStartTime: op.estimated_start_time,
            estimatedEndTime: op.estimated_end_time,
            actualStartTime: op.actual_start_time,
            actualEndTime: op.actual_end_time,
            comments: op.comments,
            assignedTo: op.assigned_to_id ? {
              id: op.assigned_to_id,
              name: "Unknown"
            } : undefined,
            createdAt: op.created_at,
            updatedAt: op.updated_at,
            documents: []
          }))
          .sort((a: Operation, b: Operation) => a.sequence - b.sequence),
        archived: data.archived,
        archivedAt: data.archived_at,
        archiveReason: data.archive_reason,
        useOperationTemplates: data.use_operation_templates
      } as WorkOrder;
    },
    enabled: !!workOrderId,
  });

  const { mutateAsync: archiveWorkOrder, isPending: isArchiving } = useMutation({
    mutationFn: async (reason: string) => {
      if (!workOrderId) throw new Error("Work Order ID is required");
      
      const { data, error } = await supabase
        .from('work_orders')
        .update({ 
          archived: true,
          archived_at: new Date().toISOString(),
          archive_reason: reason
        })
        .eq('id', workOrderId)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Work Order archived successfully");
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
      navigate("/work-orders");
    },
    onError: (error: any) => {
      console.error("Error archiving work order:", error);
      toast.error(error.message || "Failed to archive work order");
    },
  });

  const { mutateAsync: updateWorkOrderStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async (status: WorkOrderStatus) => {
      if (!workOrderId) throw new Error("Work Order ID is required");
      
      let updateData: any = { status };
      
      if (status === "Complete") {
        updateData.completed_date = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', workOrderId)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Work Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
      setIsUpdateStatusDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error updating work order status:", error);
      toast.error(error.message || "Failed to update work order status");
    },
  });

  const { mutateAsync: batchUpdateOperations, isPending: isBatchUpdating } = useMutation({
    mutationFn: async (operations: Record<string, Partial<UpdateOperationInput>>) => {
      const updates = Object.entries(operations).map(async ([id, changes]) => {
        const { data, error } = await supabase
          .from('operations')
          .update({
            sequence: changes.sequence,
            status: changes.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();
          
        if (error) throw error;
        return data;
      });
      
      return Promise.all(updates);
    },
    onSuccess: () => {
      toast.success("Operations updated successfully");
      setEditedOperations({});
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
    },
    onError: (error: any) => {
      console.error("Error updating operations:", error);
      toast.error(error.message || "Failed to update operations");
    }
  });

  const { mutateAsync: updateOperationStatus, isPending: isStatusUpdating } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OperationStatus }) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Operation status updated");
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
    },
    onError: (error: any) => {
      console.error("Error updating operation status:", error);
      toast.error(error.message || "Failed to update status");
    }
  });

  const handleArchiveSubmit = async (data: z.infer<typeof archiveReasonSchema>) => {
    try {
      await archiveWorkOrder(data.reason);
      setIsArchiveDialogOpen(false);
      archiveForm.reset();
    } catch (error) {
      console.error("Error in handleArchiveSubmit:", error);
    }
  };

  const handleStatusUpdate = (status: WorkOrderStatus) => {
    updateWorkOrderStatus(status);
  };

  const handleSequenceChange = (id: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setEditedOperations(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          id,
          sequence: numValue
        }
      }));
    }
  };

  const handleOperationStatusChange = (id: string, status: OperationStatus) => {
    updateOperationStatus({ id, status });
  };

  const saveAllChanges = async () => {
    if (Object.keys(editedOperations).length > 0) {
      await batchUpdateOperations(editedOperations);
    } else {
      toast.info("No changes to save");
    }
  };

  const toggleEditing = () => {
    if (isEditing && Object.keys(editedOperations).length > 0) {
      if (confirm("You have unsaved changes. Do you want to save them before exiting edit mode?")) {
        saveAllChanges();
      } else {
        setEditedOperations({});
      }
    }
    setIsEditing(!isEditing);
  };

  const renderOperationTable = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sequence</TableHead>
            <TableHead>Operation</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrder.operations.map((operation) => (
            <TableRow key={operation.id}>
              <TableCell>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    className="w-20"
                    value={(editedOperations[operation.id]?.sequence !== undefined) 
                      ? editedOperations[operation.id].sequence 
                      : operation.sequence}
                    onChange={(e) => handleSequenceChange(operation.id, e.target.value)}
                  />
                ) : (
                  <span className="font-mono">{operation.sequence}</span>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {operation.name}
                {operation.isCustom && (
                  <Badge variant="outline" className="ml-2">Custom</Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 py-0">
                      <Badge variant={
                        operation.status === "Complete" ? "secondary" : 
                        operation.status === "In Progress" ? "default" : 
                        operation.status === "QC" ? "outline" :
                        "outline"
                      }>
                        {operation.status}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {["Not Started", "In Progress", "QC", "Complete"].map((status) => (
                      <DropdownMenuItem 
                        key={status}
                        onClick={() => handleOperationStatusChange(operation.id, status as OperationStatus)}
                      >
                        <Badge variant={
                          status === "Complete" ? "secondary" : 
                          status === "In Progress" ? "default" : 
                          status === "QC" ? "outline" :
                          "outline"
                        } className="mr-2">
                          {status}
                        </Badge>
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>{operation.description || "—"}</TableCell>
              <TableCell>
                {operation.assignedTo ? operation.assignedTo.name : "—"}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/work-orders/${workOrderId}/operations/${operation.id}`}>
                    View Details
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading work order details...</p>
      </div>
    );
  }

  if (error || !workOrder) {
    console.error("Work order detail error:", error);
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading work order: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button variant="outline" asChild>
          <Link to="/work-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to="/work-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
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
                <DialogTitle>Update Work Order Status</DialogTitle>
                <DialogDescription>
                  Change the status of work order {workOrder.workOrderNumber}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                {["Not Started", "In Progress", "QC", "Complete", "Shipped"].map((status) => (
                  <Button
                    key={status}
                    variant={workOrder.status === status ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleStatusUpdate(status as WorkOrderStatus)}
                    disabled={isUpdatingStatus}
                  >
                    <Badge variant={getStatusBadgeVariant(status as WorkOrderStatus)} className="mr-2">
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
            <Link to={`/work-orders/${workOrderId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          {!workOrder.archived && (
            <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive Work Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will archive work order {workOrder.workOrderNumber}. 
                    Archived work orders can still be viewed but cannot be modified.
                    Please provide a reason for archiving.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <Form {...archiveForm}>
                  <form onSubmit={archiveForm.handleSubmit(handleArchiveSubmit)} className="space-y-4">
                    <FormField
                      control={archiveForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Archiving</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter reason for archiving..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button 
                          type="submit" 
                          disabled={isArchiving}
                        >
                          {isArchiving ? "Archiving..." : "Archive Work Order"}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </form>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {workOrder.archived && (
        <div className="bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="font-medium">This work order has been archived</p>
            <p className="text-sm text-muted-foreground">
              Archived on {format(new Date(workOrder.archivedAt!), "PPP")}
              {workOrder.archiveReason && ` - Reason: ${workOrder.archiveReason}`}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Work Order: {workOrder.workOrderNumber}
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                {workOrder.purchaseOrderNumber && `PO: ${workOrder.purchaseOrderNumber}`}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge variant={getStatusBadgeVariant(workOrder.status)}>
                {workOrder.status}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(workOrder.priority)}>
                {workOrder.priority} Priority
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Customer</h3>
                <Card>
                  <CardContent className="pt-6">
                    <Link 
                      to={`/customers/${workOrder.customer.id}`}
                      className="text-lg font-medium hover:underline text-primary"
                    >
                      {workOrder.customer.name}
                    </Link>
                    <p className="text-muted-foreground">{workOrder.customer.company}</p>
                    {workOrder.customer.email && (
                      <p className="text-sm mt-2">{workOrder.customer.email}</p>
                    )}
                    {workOrder.customer.phone && (
                      <p className="text-sm">{workOrder.customer.phone}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Part</h3>
                <Card>
                  <CardContent className="pt-6">
                    <Link 
                      to={`/parts/${workOrder.part.id}`}
                      className="text-lg font-medium hover:underline text-primary"
                    >
                      {workOrder.part.name}
                    </Link>
                    <p className="text-muted-foreground">Part #: {workOrder.part.partNumber}</p>
                    {workOrder.part.revisionNumber && (
                      <p className="text-sm">Rev: {workOrder.part.revisionNumber}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <Package className="h-4 w-4 mr-2" />
                      <span>Quantity: {workOrder.quantity}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Timeline</h3>
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      <span>Created: {format(new Date(workOrder.createdAt), "PPP")}</span>
                    </div>
                    
                    {workOrder.startDate && (
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2" />
                        <span>Started: {format(new Date(workOrder.startDate), "PPP")}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      <span>Due: {format(new Date(workOrder.dueDate), "PPP")}</span>
                    </div>
                    
                    {workOrder.completedDate && (
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        <span>Completed: {format(new Date(workOrder.completedDate), "PPP")}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {workOrder.assignedTo && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Assignment</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Assigned to: {workOrder.assignedTo.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {workOrder.notes && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="whitespace-pre-wrap">{workOrder.notes}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Operations</h3>
              {!workOrder.archived && workOrder.operations.length > 0 && (
                <div className="flex items-center space-x-2">
                  {isEditing && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={saveAllChanges}
                      disabled={isBatchUpdating || Object.keys(editedOperations).length === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                  <Button 
                    variant={isEditing ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={toggleEditing}
                  >
                    {isEditing ? "Exit Edit Mode" : "Edit Sequences"}
                  </Button>
                </div>
              )}
            </div>
            {workOrder.operations.length > 0 ? (
              renderOperationTable()
            ) : (
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-muted-foreground">No operations defined for this work order.</p>
                  {!workOrder.archived && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      asChild
                    >
                      <Link to={`/work-orders/${workOrderId}/operations/new`}>
                        Add Operation
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
        
        {!workOrder.archived && (
          <CardFooter className="flex justify-end">
            <Button asChild>
              <Link to={`/work-orders/${workOrderId}/operations/new`}>
                Add Operation
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
