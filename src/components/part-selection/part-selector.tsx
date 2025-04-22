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

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  useFormField?: boolean;
}

/**
 * PartSelector - A combobox component for selecting parts with search functionality
 * Rebuilt to use shadcn/ui's Command pattern correctly
 */
export function PartSelector({ 
  field,
  disabled = false,
  customerId,
  label = "Part",
  description,
  useFormField = true
}: PartSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Validate field structure before proceeding
  if (!field || typeof field !== 'object') {
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
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };
  
  const selectorContent = (
    <div className="relative">
      {description && (
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
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
              "Select Part"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search parts..." 
              value={searchQuery}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Loading...' : 'No parts found.'}
              </CommandEmpty>
              <CommandGroup>
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
                      </CommandItem>
                    );
                  })
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
  
  if (!useFormField || !field.control) {
    return selectorContent;
  }
  
  return (
    <FormField
      control={field.control}
      name="partId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            {description && (
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
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
                      "Select Part"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search parts..." 
                    value={searchQuery}
                    onValueChange={handleSearchChange}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isLoading ? 'Loading...' : 'No parts found.'}
                    </CommandEmpty>
                    <CommandGroup>
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
                            </CommandItem>
                          );
                        })
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 