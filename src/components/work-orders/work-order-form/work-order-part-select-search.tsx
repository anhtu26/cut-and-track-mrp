
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
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

interface PartSelectSearchProps {
  field: any;
  isLoading?: boolean;
}

export function PartSelectSearch({ field, isLoading: formIsLoading }: PartSelectSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: parts = [], isLoading: isLoadingParts, refetch } = useQuery({
    queryKey: ["parts"],
    queryFn: async () => {
      console.log("Fetching parts for dropdown");
      
      try {
        const { data, error } = await supabase
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
          .eq('archived', false)
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error("Error fetching parts:", error);
          throw error;
        }
        
        // Important: Always return an array, even if data is null/undefined
        return (data || []).map((item) => ({
          id: item.id,
          name: item.name || "",
          partNumber: item.part_number || "",
          description: item.description || "",
          active: item.active || false,
          materials: item.materials || [],
          customerId: item.customer_id || ""
        })) as Part[];
      } catch (error) {
        console.error("Failed to fetch parts:", error);
        return []; // Return empty array on error
      }
    },
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  });

  // Always ensure we have an array to work with
  const safePartsList = Array.isArray(parts) ? parts : [];
  
  // Filter parts based on search query
  const filteredParts = safePartsList.filter(part => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = part.name.toLowerCase().includes(query);
    const partNumberMatch = part.partNumber.toLowerCase().includes(query);
    const descriptionMatch = part.description ? part.description.toLowerCase().includes(query) : false;
    
    return nameMatch || partNumberMatch || descriptionMatch;
  });

  // Find the currently selected part for display
  const selectedPart = safePartsList.find(part => part.id === field.value);

  // Refetch when opened to ensure latest data
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  return (
    <FormField
      control={field.control}
      name="partId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <div className="flex items-center justify-between">
            <FormLabel>Part</FormLabel>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              asChild
            >
              <Link to="/parts/new" target="_blank">
                <PlusCircle className="mr-1 h-3 w-3" />
                Add New
              </Link>
            </Button>
          </div>
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
                  ) : field.value && selectedPart ? (
                    `${selectedPart.name} - ${selectedPart.partNumber}`
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
                  onValueChange={setSearchQuery}
                />
                <CommandEmpty>No parts found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredParts.length > 0 ? (
                    filteredParts.map((part) => (
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
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {part.name} - {part.partNumber}
                          </span>
                          {part.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                              {part.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))
                  ) : isLoadingParts ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Loading parts...</p>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">No parts found</p>
                    </div>
                  )}
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
