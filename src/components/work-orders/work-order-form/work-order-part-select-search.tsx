
import React, { useState, useEffect } from 'react';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartSelectSearchProps {
  field: any;
  isLoading?: boolean;
}

export function PartSelectSearch({ field, isLoading: formIsLoading }: PartSelectSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Make sure we have a valid parts array to filter
  const filteredParts = (parts && Array.isArray(parts)) 
    ? parts.filter(part => 
        part.name.toLowerCase().includes((searchQuery || '').toLowerCase()) || 
        part.partNumber.toLowerCase().includes((searchQuery || '').toLowerCase())
      )
    : [];

  // Find the currently selected part name for display
  const selectedPart = parts && Array.isArray(parts) 
    ? parts.find(part => part.id === field.value) 
    : undefined;

  return (
    <FormField
      control={field.control}
      name="partId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Part</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={isLoadingParts || formIsLoading}
                >
                  {isLoadingParts ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading parts...</span>
                    </div>
                  ) : field.value ? (
                    selectedPart ? 
                      `${selectedPart.name} - ${selectedPart.partNumber}` : 
                      'Select a part'
                  ) : (
                    "Select a part"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Search parts..." 
                  onValueChange={(value) => setSearchQuery(value)}
                />
                <CommandEmpty>No parts found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredParts.map(part => (
                    <CommandItem
                      key={part.id}
                      value={part.id}
                      onSelect={() => {
                        field.onChange(part.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value === part.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1 truncate">
                        {part.name} - {part.partNumber}
                      </span>
                      {part.description && (
                        <span className="text-xs text-muted-foreground ml-2 truncate max-w-[150px]">
                          {part.description}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
