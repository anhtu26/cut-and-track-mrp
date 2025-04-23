
import { useQuery } from "@tanstack/react-query";
import { Operation } from "@/types/operation";
import { getOperation } from "@/lib/operation-service";

/**
 * Hook to fetch operation data
 * Uses the centralized operation service for consistent data handling
 */
export function useOperation(operationId: string | undefined) {
  return useQuery({
    queryKey: ["operation", operationId],
    queryFn: async () => {
      if (!operationId) {
        throw new Error("Operation ID is required");
      }
      
      const operation = await getOperation(operationId);
      
      if (!operation) {
        throw new Error("Operation not found");
      }
      
      return operation;
    },
    retry: 1,
    enabled: !!operationId,
  });
}
