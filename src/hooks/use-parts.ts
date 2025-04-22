import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Define Part Schema
const partSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(""),
  partNumber: z.string().optional().default(""),
  description: z.string().optional().default(""),
  active: z.boolean().optional().default(true),
  materials: z.array(z.string()).optional().default([]),
  customerId: z.string().optional().nullable(),
});

export type Part = z.infer<typeof partSchema>;

export interface UsePartsOptions {
  customerId?: string;
  includeInactive?: boolean;
  includeArchived?: boolean;
}

export function useParts({
  customerId,
  includeInactive = false,
  includeArchived = false,
}: UsePartsOptions = {}) {
  return useQuery({
    queryKey: ["parts", { customerId, includeInactive, includeArchived }],
    queryFn: async (): Promise<Part[]> => {
      try {
        // Build Supabase query
        let query = supabase
          .from('parts')
          .select(`
            id, 
            name,
            part_number,
            description,
            active,
            materials,
            customer_id
          `)
          .order('name', { ascending: true });

        // Apply filters
        if (!includeArchived) {
          query = query.eq('archived', false);
        }
        
        if (!includeInactive) {
          query = query.eq('active', true);
        }
        
        if (customerId) {
          query = query.eq('customer_id', customerId);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching parts:", error);
          throw error;
        }
        
        // Transform database response to match our Part interface
        // Use Zod to validate and transform the data
        const validatedParts = (data || []).map(item => {
          // Validate each part with Zod schema
          return partSchema.parse({
            id: item.id,
            name: item.name || "",
            partNumber: item.part_number || "",
            description: item.description || "",
            active: item.active || false,
            materials: item.materials || [],
            customerId: item.customer_id || null
          });
        });
        
        return validatedParts;
      } catch (error) {
        console.error("Error in useParts hook:", error);
        throw error;
      }
    },
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  });
} 