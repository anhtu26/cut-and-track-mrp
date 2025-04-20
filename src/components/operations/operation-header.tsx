
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Operation } from "@/types/operation";

interface OperationHeaderProps {
  operation: Operation;
  onUpdateStatusClick: () => void;
}

export function OperationHeader({ operation, onUpdateStatusClick }: OperationHeaderProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Complete": return "secondary";
      case "In Progress": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" asChild size="sm">
        <Link to={`/work-orders/${operation.workOrderId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Work Order
        </Link>
      </Button>
      
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onUpdateStatusClick}>
          <ListChecks className="mr-2 h-4 w-4" />
          Update Status
        </Button>
        
        <Button asChild size="sm">
          <Link to={`/work-orders/${operation.workOrderId}/operations/${operation.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}
