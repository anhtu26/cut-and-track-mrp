
import { Operation } from "@/types/operation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OperationDetailsCardProps {
  operation: Operation;
}

export function OperationDetailsCard({ operation }: OperationDetailsCardProps) {
  return (
    <>
      {(operation.setupInstructions || operation.machiningMethods) && (
        <>
          {operation.setupInstructions && (
            <div>
              <h3 className="text-lg font-medium mb-2">Setup Instructions</h3>
              <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                {operation.setupInstructions}
              </div>
            </div>
          )}
          
          {operation.machiningMethods && (
            <div>
              <h3 className="text-lg font-medium mb-2">Machining Methods</h3>
              <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                {operation.machiningMethods}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
