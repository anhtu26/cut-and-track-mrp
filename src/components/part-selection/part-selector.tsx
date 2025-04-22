import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useParts } from '@/hooks/use-parts';
import { z } from 'zod';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Import the stable Combobox components from shadcn/ui
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

// Define the Part schema using Zod
export const partSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(""),
  partNumber: z.string().optional().default(""),
  description: z.string().optional().default(""),
  active: z.boolean().optional().default(true),
  materials: z.array(z.string()).optional().default([]),
  customerId: z.string().optional().nullable(),
});

// Derive the TypeScript type
export type PartSelectItem = z.infer<typeof partSchema>;

export interface PartSelectorProps {
  field: any;
  disabled?: boolean;
  customerId?: string;
  label?: string;
  description?: string;
}

/**
 * PartSelector - A stable Combobox component for selecting parts with search functionality
 * This implementation uses the proven shadcn/ui Combobox pattern which has been reliable in production
 */
export function PartSelector({ 
  field,
  disabled = false,
  customerId,
  label = "Part",
  description
}: PartSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Validate field structure before proceeding
  if (!field || typeof field !== 'object' || !field.control) {
    console.error('PartSelector received invalid field prop:', field);
    return null;
  }
  
  // Use the custom hook to fetch parts data
  const { 
    data: partsData = [], 
    isLoading,
    refetch
  } = useParts({ customerId });
  
  // Ensure we have a valid array to work with
  const parts = Array.isArray(partsData) ? partsData : [];
  
  // Filter parts based on search query
  const filteredParts = parts.filter(part => {
    if (!searchQuery) return true;
    if (!part) return false;
    
    try {
      const query = searchQuery.toLowerCase();
      const name = (part.name || "").toLowerCase();
      const partNumber = (part.partNumber || "").toLowerCase();
      const description = (part.description || "").toLowerCase();
      
      return (
        name.includes(query) ||
        partNumber.includes(query) ||
        description.includes(query)
      );
    } catch (error) {
      console.error("Error filtering part:", error);
      return false;
    }
  });
  
  // Find the currently selected part
  const selectedPart = field.value && parts.length > 0
    ? parts.find(part => part?.id === field.value) 
    : null;
  
  // Refresh data when dropdown is opened
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
            <FormLabel>{label}</FormLabel>
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
          
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          
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
                  disabled={isLoading || disabled}
                  type="button" // Ensure it doesn't submit forms
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading parts...</span>
                    </div>
                  ) : field.value && selectedPart ? (
                    <span className="truncate">
                      {selectedPart.name || 'Unknown'} - {selectedPart.partNumber || 'No part number'}
                    </span>
                  ) : (
                    "Select a part"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search parts..." 
                  className="h-9"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                
                <CommandEmpty>
                  {isLoading ? 'Loading...' : 'No parts found.'}
                </CommandEmpty>
                
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {isLoading ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Loading parts...</p>
                    </div>
                  ) : filteredParts.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">No parts found</p>
                    </div>
                  ) : (
                    filteredParts.map(part => {
                      if (!part || !part.id) return null;
                      
                      return (
                        <CommandItem
                          key={part.id}
                          value={part.id}
                          onSelect={() => {
                            field.onChange(part.id);
                            setOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === part.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {part.name || 'Unknown'} - {part.partNumber || 'No part number'}
                              </span>
                              {part.description && (
                                <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                                  {part.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })
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