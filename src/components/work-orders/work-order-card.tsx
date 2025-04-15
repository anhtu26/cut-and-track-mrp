
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrder } from "@/types/work-order";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <Link 
              to={`/work-orders/${workOrder.id}`}
              className="font-semibold hover:underline"
            >
              {workOrder.workOrderNumber}
            </Link>
          </div>
          <StatusBadge status={workOrder.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 pb-2">
        <div>
          <p className="text-sm font-medium">Customer</p>
          <p className="text-sm">{workOrder.customer.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Part</p>
          <p className="text-sm">{workOrder.part.name} ({workOrder.part.partNumber})</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Due: {new Date(workOrder.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Qty: {workOrder.quantity}</span>
          </div>
        </div>
        {workOrder.assignedTo && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Assigned to:</p>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {workOrder.assignedTo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{workOrder.assignedTo.name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <Button asChild className="w-full">
          <Link to={`/work-orders/${workOrder.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Complete":
      return <Badge className="bg-green-500 hover:bg-green-600">Complete</Badge>;
    case "In Progress":
      return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
    case "QC":
      return <Badge className="bg-amber-500 hover:bg-amber-600">QC</Badge>;
    case "Shipped":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Shipped</Badge>;
    case "Not Started":
    default:
      return <Badge variant="outline">Not Started</Badge>;
  }
}
