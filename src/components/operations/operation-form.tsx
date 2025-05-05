
import { Operation } from "@/types/operation";
import { ModularOperationForm, ModularOperationFormValues } from "./shared/modular-operation-form";

interface OperationFormProps {
  workOrderId: string;
  operation?: Operation;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  suggestedSequence?: number;
}

/**
 * Operation form wrapper that uses the shared ModularOperationForm component
 * This provides backward compatibility with existing code while leveraging
 * the new modular form implementation
 */
export function OperationForm({ workOrderId, operation, onSubmit, isSubmitting, suggestedSequence = 10 }: OperationFormProps) {
  const handleSubmit = async (values: ModularOperationFormValues) => {
    try {
      // Format data for the original onSubmit handler
      const submitData = {
        ...values,
        workOrderId,
        ...(operation && { id: operation.id }),
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting operation form:", error);
    }
  };

  return (
    <ModularOperationForm
      entity={operation}
      entityType="operation"
      parentId={workOrderId}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      suggestedSequence={suggestedSequence}
      showDocuments={!!operation?.id}
    />
  );
}
