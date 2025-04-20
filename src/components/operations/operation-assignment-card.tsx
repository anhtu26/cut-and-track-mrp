
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operator } from "@/types/operation";

interface OperationAssignmentCardProps {
  assignedTo: Operator;
}

export function OperationAssignmentCard({ assignedTo }: OperationAssignmentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <span>Assigned to: {assignedTo.name}</span>
        </div>
      </CardContent>
    </Card>
  );
}
