
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { apiClient } from '@/lib/api/client';;
import { Operation } from "@/types/operation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Operator {
  id: string;
  name: string;
}

interface OperatorAssignmentProps {
  operation: Operation;
  workOrderId: string;
  onOperationUpdated: () => void;
  isWorkOrderComplete: boolean;
}

export function OperatorAssignment({
  operation,
  workOrderId,
  onOperationUpdated,
  isWorkOrderComplete
}: OperatorAssignmentProps) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(
    operation.assignedTo?.id || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch operators (users)
  useEffect(() => {
    const fetchOperators = async () => {
      setIsLoading(true);
      try {
        // This would typically come from your users table or auth system
        // For now, we'll use mock data or a sample query
        const { data, error } = await supabase
          .from('users')  // assuming you have a users table
          .select('id, name')
          .eq('active', true)
          .order('name');
          
        if (error) throw error;
        
        // If no users table, provide some sample data for demonstration
        const operatorsList = data || [
          { id: "1", name: "John Operator" },
          { id: "2", name: "Maria Technician" },
          { id: "3", name: "Ahmed Engineer" },
        ];
        
        setOperators(operatorsList);
      } catch (error) {
        console.error("Error fetching operators:", error);
        toast.error("Failed to load operators");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOperators();
  }, []);
  
  // Assign operator to operation
  const handleAssignOperator = async () => {
    if (isWorkOrderComplete) {
      toast.error("Cannot modify operations on a completed work order");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('operations')
        .update({ assigned_to_id: selectedOperatorId || null })
        .eq('id', operation.id);
        
      if (error) throw error;
      
      toast.success("Operator assigned successfully");
      onOperationUpdated();
    } catch (error) {
      console.error("Error assigning operator:", error);
      toast.error("Failed to assign operator");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Operator Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormItem>
            <FormLabel>Assigned Operator</FormLabel>
            <div className="flex space-x-2">
              <FormControl>
                <Select
                  value={selectedOperatorId}
                  onValueChange={setSelectedOperatorId}
                  disabled={isLoading || isWorkOrderComplete}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {operators.map(operator => (
                      <SelectItem key={operator.id} value={operator.id}>
                        {operator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              
              <Button 
                onClick={handleAssignOperator} 
                disabled={isSaving || isWorkOrderComplete}
              >
                {isSaving ? "Saving..." : "Assign"}
              </Button>
            </div>
          </FormItem>
          
          {operation.assignedTo && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-md">
              <p className="text-sm">
                Currently assigned to: <strong>{operation.assignedTo.name}</strong>
              </p>
            </div>
          )}
          
          {isWorkOrderComplete && (
            <p className="text-sm text-muted-foreground">
              Operator assignment is locked because the work order is complete.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
