
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Part } from "@/types/part";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Define a more permissive schema that allows all characters
const partSchema = z.object({
  name: z.string().min(1, "Name is required"),
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  materials: z.string().optional(), // Changed from array to string
  revisionNumber: z.string().optional(),
  active: z.boolean().default(true),
  customerId: z.string().optional(),
});

type PartFormData = z.infer<typeof partSchema>;

interface PartFormProps {
  initialData?: Partial<Part>;
  onSubmit: (data: PartFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function PartForm({ initialData, onSubmit, isSubmitting }: PartFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Query to fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, company")
        .eq("active", true)
        .order("name");
        
      if (error) {
        console.error("Error loading customers:", error);
        return [];
      }
      
      return data.map(customer => ({
        value: customer.id,
        label: `${customer.name} (${customer.company})`
      }));
    }
  });
  
  // Convert materials array to string if needed for initialData
  const initialMaterials = Array.isArray(initialData?.materials) 
    ? initialData.materials.join(', ') 
    : initialData?.materials || "";

  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: initialData?.name || "",
      partNumber: initialData?.partNumber || "",
      description: initialData?.description || "",
      materials: initialMaterials,
      revisionNumber: initialData?.revisionNumber || "",
      active: initialData?.active !== undefined ? initialData.active : true,
      customerId: initialData?.customerId || undefined,
    }
  });

  const handleSubmit = async (data: PartFormData) => {
    setSubmitError(null);
    try {
      await onSubmit(data);
    } catch (error: any) {
      console.error("Form submission error:", error);
      setSubmitError(error.message || "Failed to submit form");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Part Name</FormLabel>
              <FormControl>
                <Input {...field} className="text-base px-4 py-3 h-12" />
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
                <Input {...field} className="text-base px-4 py-3 h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-32 text-base p-4" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="materials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materials</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="text-base px-4 py-3 h-12"
                  placeholder="Enter materials (e.g. Aluminum, Steel, Plastic)"
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">Comma-separated list of materials</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="revisionNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Revision Number</FormLabel>
              <FormControl>
                <Input {...field} className="text-base px-4 py-3 h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Customer (Optional)</FormLabel>
              <select
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value || undefined)}
                className="w-full h-12 text-base px-4 py-2 rounded-md border border-input bg-background"
              >
                <option value="">-- Select Customer --</option>
                {customers.map((customer) => (
                  <option key={customer.value} value={customer.value}>
                    {customer.label}
                  </option>
                ))}
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {submitError && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting} className="h-12 px-8 text-base">
            {isSubmitting ? "Saving..." : "Save Part"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
