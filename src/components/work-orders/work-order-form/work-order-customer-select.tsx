
import React, { useState, useEffect } from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { z } from 'zod';

// Define Customer schema using Zod for type-safety
export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string().optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type CustomerSelectItem = z.infer<typeof customerSchema>;

interface WorkOrderCustomerSelectProps {
  field: any;
  label?: string;
  description?: string;
  isDisabled?: boolean;
  required?: boolean;
}

export function WorkOrderCustomerSelect({ 
  field, 
  label = "Customer", 
  description,
  isDisabled = false,
  required = true
}: WorkOrderCustomerSelectProps) {
  // Safety check for field structure
  if (!field || typeof field !== 'object' || !field.control) {
    console.error("WorkOrderCustomerSelect: Invalid field prop:", field);
    return null;
  }

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch customers data with TanStack Query
  const { 
    data: customers = [], 
    isLoading 
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      console.log("Fetching customers for dropdown");
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, company, email, phone, active')
        .eq('active', true)
        .order('name', { ascending: true });
        
      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Ensure customers is always an array
  const safeCustomers = Array.isArray(customers) ? customers : [];
  
  // Filter customers based on search query
  const filteredCustomers = safeCustomers.filter(customer => {
    if (!customer) return false;
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const name = (customer.name || '').toLowerCase();
    const company = (customer.company || '').toLowerCase();
    const email = (customer.email || '').toLowerCase();
    
    return name.includes(query) || company.includes(query) || email.includes(query);
  });

  // Find the selected customer for display
  const selectedCustomer = field.value 
    ? safeCustomers.find(c => c?.id === field.value)
    : null;

  return (
    <FormField
      control={field.control}
      name="customerId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <div className="flex items-center justify-between">
            <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              asChild
            >
              <Link to="/customers/new" target="_blank">
                <PlusCircle className="mr-1 h-3 w-3" />
                Add New
              </Link>
            </Button>
          </div>
          
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
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={isLoading || isDisabled}
                  type="button"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading customers...</span>
                    </div>
                  ) : field.value && selectedCustomer ? (
                    <span className="truncate">
                      {selectedCustomer.name || 'Unknown'}{selectedCustomer.company ? ` - ${selectedCustomer.company}` : ''}
                    </span>
                  ) : (
                    "Select Customer"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search customers..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandEmpty>
                  {isLoading ? 'Loading...' : 'No customers found.'}
                </CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {isLoading ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Loading customers...</p>
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">No customers found</p>
                    </div>
                  ) : (
                    filteredCustomers.map(customer => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        onSelect={() => {
                          field.onChange(customer.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === customer.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {customer.name}
                          </span>
                          {customer.company && (
                            <span className="text-xs text-muted-foreground">
                              {customer.company}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))
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
