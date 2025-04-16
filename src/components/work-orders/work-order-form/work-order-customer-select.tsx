
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

interface CustomerSelectProps {
  field: any;
  isLoading?: boolean;
}

export function CustomerSelect({ field, isLoading }: CustomerSelectProps) {
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select("*")
        .order('name', { ascending: true });

      if (error) throw error;
      
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
  });

  return (
    <FormField
      control={field.control}
      name="customerId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Customer</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value} 
            disabled={isLoadingCustomers || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} - {customer.company}
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
