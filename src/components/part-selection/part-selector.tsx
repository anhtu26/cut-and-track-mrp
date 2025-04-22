
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useParts } from '@/hooks/use-parts';
import { z } from 'zod';
import { Control } from "react-hook-form";
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
  field: {
    control: Control<any>;
    name?: string;
    value?: string;
    onChange?: (value: string) => void;
  };
  disabled?: boolean;
  customerId?: string;
  label?: string;
  description?: string;
  useFormField?: boolean;
}

/**
 * PartSelector - A combobox component for selecting parts with search functionality
 * Uses shadcn/ui's Command pattern
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
  if (!field || !field.control) {
    console.error('PartSelector received invalid field prop:', field);
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600">
        Part selector error: Invalid field configuration
      </div>
    );
  }
  
  // Destructure field properties with defaults
  const {
    control,
    name = "partId",
    value,
    onChange
  } = field;
  
  // Use the custom hook to fetch parts data
  const { 
    data: partsData = [], 
    isLoading,
    refetch
  } = useParts({ customerId });
  
  // Ensure we have a valid array to work with
  const parts = Array.isArray(partsData) ? partsData : [];
  
  // Filter parts based on search query with careful null handling
  const filteredParts = parts.filter(part => {
    if (!part) return false;
    if (!searchQuery) return true;
    
    try {
      const query = searchQuery.toLowerCase();
      const name = part.name ? part.name.toLowerCase() : '';
      const partNumber = part.partNumber ? part.partNumber.toLowerCase() : '';
      const description = part.description ? part.description.toLowerCase() : '';
      
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
  const fieldValue = value || '';
  
  const selectedPart = fieldValue && parts.length > 0
    ? parts.find(part => part?.id === fieldValue) 
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
  
  const handleSelectPart = (partId: string) => {
    if (onChange) {
      onChange(partId);
    }
    setOpen(false);
  };

  const renderCommandContent = () => (
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
                  onSelect={() => handleSelectPart(part.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      fieldValue === part.id ? "opacity-100" : "opacity-0"
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
            }).filter(Boolean)
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
  
  // When useFormField is false or control is missing, render without FormField
  if (!useFormField) {
    return (
      <div className="relative">
        {label && <div className="text-sm font-medium mb-2">{label}</div>}
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
                !fieldValue && "text-muted-foreground"
              )}
              disabled={isLoading || disabled}
              type="button" // Ensure it doesn't submit forms
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading parts...</span>
                </div>
              ) : fieldValue && selectedPart ? (
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
            {renderCommandContent()}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  
  // When useFormField is true, render with FormField
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: formField }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          
          {description && (
            <FormDescription>{description}</FormDescription>
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
                    !formField.value && "text-muted-foreground"
                  )}
                  disabled={isLoading || disabled}
                  type="button" // Ensure it doesn't submit forms
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading parts...</span>
                    </div>
                  ) : formField.value && selectedPart ? (
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
                          onSelect={() => formField.onChange(part.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formField.value === part.id ? "opacity-100" : "opacity-0"
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
                    }).filter(Boolean)
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
