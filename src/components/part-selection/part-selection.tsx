import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useParts } from '@/hooks/use-parts';
import { z } from 'zod';
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

export interface PartSelectionProps {
  field: any;
  disabled?: boolean;
  customerId?: string;
  label?: string;
  description?: string;
}

export function PartSelection({ 
  field,
  disabled = false,
  customerId,
  label = "Part",
  description
}: PartSelectionProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Verify the field is properly structured before proceeding
  if (!field || typeof field !== 'object' || !field.control) {
    console.error('PartSelection received invalid field prop:', field);
    return null;
  }
  
  // Use the custom hook to fetch parts data
  const { 
    data: parts = [], 
    isLoading,
    refetch
  } = useParts({ customerId });
  
  // Ensure we have a safe array to work with
  const safePartsList: PartSelectItem[] = Array.isArray(parts) ? parts : [];
  
  // Filter parts based on search query (type ahead search)
  const filteredParts = safePartsList.filter(part => {
    // Skip filtering if search is empty
    if (!searchQuery) return true;
    if (!part) return false;
    
    try {
      const query = searchQuery.toLowerCase();
      // Search across multiple fields
      return (
        (part.name?.toLowerCase().includes(query) || false) ||
        (part.partNumber?.toLowerCase().includes(query) || false) ||
        (part.description?.toLowerCase().includes(query) || false)
      );
    } catch (error) {
      console.error("Error filtering part:", error);
      return false;
    }
  });
  
  // Find currently selected part
  const selectedPart = field.value && safePartsList.length > 0
    ? safePartsList.find(part => part?.id === field.value)
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
            
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Search parts..." 
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
                    // Safe rendering with null checks
                    filteredParts.map((part) => {
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
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 