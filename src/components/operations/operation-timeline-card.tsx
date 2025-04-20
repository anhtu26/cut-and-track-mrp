
import { format } from "date-fns";
import { Clock, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/types/operation";

interface OperationTimelineCardProps {
  operation: Operation;
}

export function OperationTimelineCard({ operation }: OperationTimelineCardProps) {
  return (
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
  );
}
