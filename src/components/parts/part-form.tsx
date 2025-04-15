
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

// Define a more permissive schema that allows all characters
const partSchema = z.object({
  name: z.string().min(1, "Name is required"),
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  materials: z.array(z.string()).default([]),
  setupInstructions: z.string().optional(),
  machiningMethods: z.string().optional(),
  revisionNumber: z.string().optional(),
  active: z.boolean().default(true)
});

type PartFormData = z.infer<typeof partSchema>;

interface PartFormProps {
  initialData?: Partial<Part>;
  onSubmit: (data: PartFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function PartForm({ initialData, onSubmit, isSubmitting }: PartFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: initialData?.name || "",
      partNumber: initialData?.partNumber || "",
      description: initialData?.description || "",
      materials: initialData?.materials || [],
      setupInstructions: initialData?.setupInstructions || "",
      machiningMethods: initialData?.machiningMethods || "",
      revisionNumber: initialData?.revisionNumber || "",
      active: initialData?.active !== undefined ? initialData.active : true
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="setupInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setup Instructions</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="machiningMethods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Machining Methods</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
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
                <Input {...field} />
              </FormControl>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Part"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
