import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/types/operation";
import { format, differenceInMinutes } from "date-fns";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  CircleSlash 
} from "lucide-react";

interface OperationsTimelineProps {
  operations: Operation[];
}

export function OperationsTimeline({ operations }: OperationsTimelineProps) {
  // Sort operations by start time (if available), otherwise use sequence or ID as fallback
  const sortedOperations = [...operations].sort((a, b) => {
    if (a.actualStartTime && b.actualStartTime) {
      return new Date(a.actualStartTime).getTime() - new Date(b.actualStartTime).getTime();
    }
    // If no start times, prefer completed operations first
    if (a.status === "Complete" && b.status !== "Complete") return -1;
    if (a.status !== "Complete" && b.status === "Complete") return 1;
    // Otherwise, keep original order
    return 0;
  });
  
  // Calculate summary metrics
  const totalOperations = operations.length;
  const completedOperations = operations.filter(op => op.status === "Complete").length;
  const inProgressOperations = operations.filter(op => op.status === "In Progress").length;
  const notStartedOperations = operations.filter(op => op.status === "Not Started").length;
  
  // Calculate total time spent (in minutes)
  const totalTimeSpent = operations.reduce((total, op) => {
    if (op.actualStartTime && op.actualEndTime) {
      const start = new Date(op.actualStartTime);
      const end = new Date(op.actualEndTime);
      return total + differenceInMinutes(end, start);
    }
    return total;
  }, 0);
  
  // Format time as hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Get status icon for the timeline
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Complete": 
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "In Progress": 
        return <Play className="h-5 w-5 text-blue-500" />;
      case "QC": 
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default: 
        return <CircleSlash className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/20 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Operations</p>
            <p className="text-lg font-semibold">{totalOperations}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-semibold">{completedOperations}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-lg font-semibold">{inProgressOperations}</p>
          </div>
          <div className="bg-secondary/20 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Total Time</p>
            <p className="text-lg font-semibold flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDuration(totalTimeSpent)}
            </p>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 pl-6 space-y-6">
          {sortedOperations.map((operation, index) => (
            <div key={operation.id} className="relative">
              <div className="absolute -left-10 mt-1.5">
                {getStatusIcon(operation.status)}
              </div>
              
              <div className="mb-1">
                <h3 className="text-lg font-medium">{operation.name}</h3>
                {operation.status === "Complete" && (
                  <p className="text-sm text-muted-foreground">
                    Completed {operation.actualEndTime ? 
                      format(new Date(operation.actualEndTime), "PP 'at' p") : 
                      "Unknown time"}
                  </p>
                )}
                {operation.status === "In Progress" && (
                  <p className="text-sm text-blue-500 dark:text-blue-400">
                    Started {operation.actualStartTime ? 
                      format(new Date(operation.actualStartTime), "PP 'at' p") : 
                      "Unknown time"}
                  </p>
                )}
                {(operation.status !== "Complete" && operation.status !== "In Progress") && (
                  <p className="text-sm text-muted-foreground">
                    {operation.status}
                  </p>
                )}
              </div>
              
              {operation.actualStartTime && operation.actualEndTime && (
                <p className="text-sm bg-secondary/20 inline-block px-2 py-0.5 rounded mb-2">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatDuration(
                    differenceInMinutes(
                      new Date(operation.actualEndTime),
                      new Date(operation.actualStartTime)
                    )
                  )}
                </p>
              )}
              
              {operation.description && (
                <p className="text-sm text-muted-foreground">{operation.description}</p>
              )}
            </div>
          ))}
          
          {sortedOperations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No operations found for this work order.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
