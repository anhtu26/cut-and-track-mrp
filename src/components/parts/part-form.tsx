
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Part } from "@/types/part";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

// Define the form schema for part creation and editing
const partSchema = z.object({
  name: z.string().min(1, { message: "Part name is required" }),
  partNumber: z.string().min(1, { message: "Part number is required" }),
  description: z.string().optional(),
  active: z.boolean().default(true),
  materials: z.string().optional(),
  revisionNumber: z.string().optional(),
  customerId: z.string().optional(),
});

type PartFormData = z.infer<typeof partSchema>;

interface PartFormProps {
  initialData?: Part;
  onSubmit: (data: PartFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function PartForm({ initialData, onSubmit, isSubmitting }: PartFormProps) {
  const [hasInitialized, setHasInitialized] = useState(false);

  // Convert materials array to comma-separated string for the form
  const materialsString = initialData?.materials ? 
    Array.isArray(initialData.materials) ? 
      initialData.materials.join(", ") : 
      String(initialData.materials) :
    "";
  
  console.log("[PartForm] Initial data:", initialData);
  console.log("[PartForm] Materials:", initialData?.materials, "->", materialsString);
  console.log("[PartForm] Customer ID:", initialData?.customerId);

  // Set up form with default values
  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: initialData?.name || "",
      partNumber: initialData?.partNumber || "",
      description: initialData?.description || "",
      active: initialData?.active ?? true,
      materials: materialsString,
      revisionNumber: initialData?.revisionNumber || "",
      customerId: initialData?.customerId || "",
    },
  });

  // Fetch customers for dropdown
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, company')
          .eq('active', true)
          .order('name');
        
        if (error) {
          console.error("[PartForm] Error fetching customers:", error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("[PartForm] Error in customer query:", error);
        return [];
      }
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData && !hasInitialized) {
      form.reset({
        name: initialData.name || "",
        partNumber: initialData.partNumber || "",
        description: initialData.description || "",
        active: initialData.active ?? true,
        materials: materialsString,
        revisionNumber: initialData.revisionNumber || "",
        customerId: initialData.customerId || "",
      });
      setHasInitialized(true);
    }
  }, [initialData, form, materialsString, hasInitialized]);

  const handleSubmit = async (data: PartFormData) => {
    // Log form submission data
    console.log("[PartForm] Submitting form with data:", data);
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("[PartForm] Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="materials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Materials (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Aluminum, Steel, Plastic" />
                </FormControl>
                <FormDescription>
                  Separate materials with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revisionNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Revision Number (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Customer (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""} // Ensure empty string for null/undefined
                disabled={isLoadingCustomers || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (No specific customer)</SelectItem>
                  {customers && customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Associate this part with a primary customer (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Inactive parts won't appear in part selection for new work orders
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Part" : "Create Part"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
