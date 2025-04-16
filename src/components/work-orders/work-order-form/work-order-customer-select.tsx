
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

interface CustomerSelectProps {
  field: any;
  isLoading?: boolean;
}

export function CustomerSelect({ field, isLoading: formIsLoading }: CustomerSelectProps) {
  // Use staleTime: 0 to always fetch fresh data to ensure new customers appear immediately
  const { data: customers = [], isLoading: isLoadingCustomers, error, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      console.log("Fetching customers for dropdown");
      
      const { data, error } = await supabase
        .from('customers')
        .select("*")
        .eq('active', true)  // Only get active customers
        .order('name', { ascending: true });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      console.log("Retrieved customers:", data?.length || 0);
      
      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        company: item.company,
        email: item.email,
        phone: item.phone,
        address: item.address,
        active: item.active,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        orderCount: item.order_count || 0
      })) as Customer[];
    },
    staleTime: 0, // Always refetch to get the latest customers
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const isDisabled = formIsLoading || isLoadingCustomers;
  
  if (error) {
    console.error("Customer select error:", error);
  }

  return (
    <FormField
      control={field.control}
      name="customerId"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Customer</FormLabel>
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
          {isLoadingCustomers ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value} 
              value={field.value}
              disabled={isDisabled}
              onOpenChange={() => refetch()} // Refetch customers when dropdown is opened
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {customers.length === 0 ? (
                  <SelectItem value="no-customers" disabled>
                    No customers found
                  </SelectItem>
                ) : (
                  customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.company}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
