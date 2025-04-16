
import { WorkOrder } from "@/types/work-order";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, FileText, User } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { getStatusBadgeVariant, getPriorityBadgeVariant } from "@/types/work-order-status";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      return format(date, "PP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  
  // Count operations by status
  const operationCounts = workOrder.operations?.reduce((acc, op) => {
    acc[op.status] = (acc[op.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card className={`${workOrder.archived ? "bg-muted/40" : ""} ${workOrder.priority === "Critical" ? "border-destructive/50" : ""}`}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg truncate">
                {workOrder.workOrderNumber}
                {workOrder.purchaseOrderNumber && 
                  <span className="text-muted-foreground text-sm ml-2">
                    (PO: {workOrder.purchaseOrderNumber})
                  </span>
                }
              </h3>
              <p className="text-sm text-muted-foreground">{workOrder.customer.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusBadgeVariant(workOrder.status)}>
                {workOrder.status}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(workOrder.priority)}>
                {workOrder.priority}
              </Badge>
              {workOrder.archived && 
                <Badge variant="outline" className="border-destructive/50 text-destructive">
                  Archived
                </Badge>
              }
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Part: <span className="font-medium">{workOrder.part.name}</span> 
                <span className="text-muted-foreground ml-1">({workOrder.part.partNumber})</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Due: <span className="font-medium">{formatDate(workOrder.dueDate)}</span>
              </span>
            </div>
            {workOrder.assignedTo && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Assigned to: <span className="font-medium">{workOrder.assignedTo.name}</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Operations summary */}
          {workOrder.operations && workOrder.operations.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Operations:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(operationCounts).map(([status, count]) => (
                  <Badge key={status} variant="outline" className="text-xs">
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-muted/20 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Qty: <span className="font-medium">{workOrder.quantity}</span>
        </div>
        <Button asChild variant="default" size="sm">
          <Link to={`/work-orders/${workOrder.id}`}>
            View Details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
