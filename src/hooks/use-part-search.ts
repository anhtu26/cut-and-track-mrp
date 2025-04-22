import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { partSchema } from "@/schemas/part";
import debounce from "lodash.debounce";

/**
 * Hook parameters for part search
 */
export interface UsePartSearchParams {
  /**
   * Optional customer ID to filter parts by
   */
  customerId?: string;
  
  /**
   * Whether to include inactive parts
   * @default false
   */
  includeInactive?: boolean;
  
  /**
   * Whether to include archived parts
   * @default false
   */
  includeArchived?: boolean;
  
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;
}

/**
 * Custom hook for searching parts with debounced input
 * Uses TanStack Query for data fetching and caching
 */
export function usePartSearch({
  customerId,
  includeInactive = false,
  includeArchived = false,
  debounceMs = 300
}: UsePartSearchParams = {}) {
  // State for search input
  const [searchQuery, setSearchQuery] = useState("");
  // State for debounced search value
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // Setup debounced search function
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, debounceMs),
    [debounceMs]
  );
  
  // Update debounced value when searchQuery changes
  useEffect(() => {
    debouncedSetSearch(searchQuery);
    
    // Cleanup function for debounce
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [searchQuery, debouncedSetSearch]);
  
  // Query for fetching parts data
  const {
    data: parts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["parts", { customerId, includeInactive, includeArchived }],
    queryFn: async () => {
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
        
        // Transform database response to match our Part schema
        return (data || []).map(item => {
          // Map database fields to client-side model
          return partSchema.pick({
            id: true,
            name: true,
            partNumber: true,
            description: true,
            customerId: true,
          }).parse({
            id: item.id,
            name: item.name || "",
            partNumber: item.part_number || "",
            description: item.description || "",
            customerId: item.customer_id || null
          });
        });
      } catch (error) {
        console.error("Error in usePartSearch hook:", error);
        throw error;
      }
    },
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  });
  
  // Filter parts based on search query
  const filteredParts = parts.filter(part => {
    if (!debouncedSearchQuery) return true;
    
    const query = debouncedSearchQuery.toLowerCase();
    return (
      (part.name?.toLowerCase().includes(query) || false) ||
      (part.partNumber?.toLowerCase().includes(query) || false) ||
      (part.description?.toLowerCase().includes(query) || false)
    );
  });
  
  return {
    // Search state
    searchQuery,
    setSearchQuery,
    
    // Data
    allParts: parts,
    filteredParts,
    isLoading,
    isError,
    error,
    refetch,
    
    // Helper function to reset search
    resetSearch: () => setSearchQuery("")
  };
}
