
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Operation, OperationStatus } from "@/types/operation";
import { formatDistanceToNow, format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Clock, Check, PlayCircle, PauseCircle, RotateCcw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { apiClient } from '@/lib/api/client';;

interface OperationTrackingProps {
  operation: Operation;
  workOrderId: string;
  onOperationUpdated: () => void;
  isWorkOrderComplete: boolean;
}

export function OperationTracking({
  operation,
  workOrderId,
  onOperationUpdated,
  isWorkOrderComplete
}: OperationTrackingProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Calculate the operation duration if it has start and end times
  const calculateDuration = () => {
    if (!operation.actualStartTime || !operation.actualEndTime) return null;
    
    const start = new Date(operation.actualStartTime);
    const end = new Date(operation.actualEndTime);
    const durationMs = end.getTime() - start.getTime();
    
    // Format as hours and minutes
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  // Get a badge color based on operation status
  const getStatusBadgeVariant = (status: OperationStatus) => {
    switch (status) {
      case "Complete": return "secondary";
      case "In Progress": return "default";
      case "QC": return "outline";
      default: return "outline";
    }
  };

  // Update the operation status, and start/end times as needed
  const updateOperationStatus = async (newStatus: OperationStatus) => {
    if (isWorkOrderComplete) {
      toast.error("Cannot modify operations on a completed work order");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const now = new Date().toISOString();
      let updateData: any = { status: newStatus };
      
      // Handle start/end times based on status transitions
      if (newStatus === "In Progress" && !operation.actualStartTime) {
        updateData.actual_start_time = now;
      } else if (newStatus === "Complete" && !operation.actualEndTime) {
        updateData.actual_end_time = now;
      }
      
      const { error } = await supabase
        .from('operations')
        .update(updateData)
        .eq('id', operation.id);
      
      if (error) throw error;
      
      toast.success(`Operation ${newStatus.toLowerCase()}`);
      onOperationUpdated();
    } catch (error) {
      console.error("Error updating operation status:", error);
      toast.error("Failed to update operation status");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Reset actual start and end times
  const resetTimes = async () => {
    if (isWorkOrderComplete) {
      toast.error("Cannot modify operations on a completed work order");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('operations')
        .update({
          actual_start_time: null,
          actual_end_time: null,
          status: "Not Started"
        })
        .eq('id', operation.id);
      
      if (error) throw error;
      
      toast.success("Operation times reset");
      onOperationUpdated();
    } catch (error) {
      console.error("Error resetting operation times:", error);
      toast.error("Failed to reset operation times");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const duration = calculateDuration();
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{operation.name}</CardTitle>
          <Badge variant={getStatusBadgeVariant(operation.status)}>
            {operation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {operation.description && (
          <p className="text-sm text-muted-foreground mb-4">{operation.description}</p>
        )}
        
        <div className="space-y-2">
          {operation.machiningMethods && (
            <div>
              <strong className="text-sm">Machining Methods:</strong>
              <p className="text-sm">{operation.machiningMethods}</p>
            </div>
          )}
          
          {operation.setupInstructions && (
            <div>
              <strong className="text-sm">Setup Instructions:</strong>
              <p className="text-sm">{operation.setupInstructions}</p>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Start Time</p>
            <p className="text-sm">
              {operation.actualStartTime 
                ? format(new Date(operation.actualStartTime), "PP p")
                : "Not started"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">End Time</p>
            <p className="text-sm">
              {operation.actualEndTime 
                ? format(new Date(operation.actualEndTime), "PP p")
                : "Not completed"}
            </p>
          </div>
        </div>
        
        {duration && (
          <div className="flex items-center mb-4 bg-secondary/20 p-2 rounded">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium">Duration: {duration}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {operation.status !== "In Progress" && operation.status !== "Complete" && (
            <Button 
              size="sm" 
              onClick={() => updateOperationStatus("In Progress")}
              disabled={isUpdating || isWorkOrderComplete}
            >
              <PlayCircle className="h-4 w-4 mr-2" /> Start
            </Button>
          )}
          
          {operation.status === "In Progress" && (
            <Button
              size="sm"
              onClick={() => updateOperationStatus("Complete")}
              disabled={isUpdating || isWorkOrderComplete}
            >
              <Check className="h-4 w-4 mr-2" /> Complete
            </Button>
          )}
          
          {operation.status === "In Progress" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateOperationStatus("QC")}
              disabled={isUpdating || isWorkOrderComplete}
            >
              <PauseCircle className="h-4 w-4 mr-2" /> QC Required
            </Button>
          )}
          
          {(operation.actualStartTime || operation.actualEndTime) && (
            <Button
              size="sm"
              variant="outline"
              onClick={resetTimes}
              disabled={isUpdating || isWorkOrderComplete}
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
