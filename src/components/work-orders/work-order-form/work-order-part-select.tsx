
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Part } from "@/types/part";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PartSelectProps {
  field: any;
  isLoading?: boolean;
}

export function PartSelect({ field, isLoading }: PartSelectProps) {
  const { data: parts = [], isLoading: isLoadingParts } = useQuery({
    queryKey: ["parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts')
        .select("*")
        .eq('archived', false)
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        partNumber: item.part_number,
        description: item.description,
        active: item.active,
        materials: item.materials || [],
        setupInstructions: item.setup_instructions,
        machiningMethods: item.machining_methods,
        revisionNumber: item.revision_number,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        documents: [],
        archived: item.archived || false,
        archivedAt: item.archived_at,
        archiveReason: item.archive_reason
      })) as Part[];
    },
  });

  return (
    <FormField
      control={field.control}
      name="partId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Part</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={isLoadingParts || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a part" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {parts.map(part => (
                <SelectItem key={part.id} value={part.id}>
                  {part.name} - {part.partNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
