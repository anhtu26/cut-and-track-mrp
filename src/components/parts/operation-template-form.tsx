
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OperationTemplate } from "@/types/part";

// Improved schema with better validation and preprocessing for all fields
const operationTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  machiningMethods: z.string().optional().nullable(),
  setupInstructions: z.string().optional().nullable(),
  estimatedDuration: z.preprocess(
    // Handle empty string as null, convert string to number
    (val) => {
      if (val === "") return null;
      if (val === undefined) return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    },
    z.number().positive("Duration must be positive").nullable().optional()
  ),
  sequence: z.preprocess(
    // Ensure sequence is always a number
    (val) => {
      if (typeof val === "string") {
        return val === "" ? 0 : Number(val);
      }
      return val || 0;
    },
    z.number().int().nonnegative()
  ),
});

type OperationTemplateFormValues = z.infer<typeof operationTemplateSchema>;

interface OperationTemplateFormProps {
  partId: string;
  initialData?: OperationTemplate;
  onSubmit: (data: OperationTemplateFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function OperationTemplateForm({
  partId,
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}: OperationTemplateFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<OperationTemplateFormValues>({
    resolver: zodResolver(operationTemplateSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          machiningMethods: initialData.machiningMethods || "",
          setupInstructions: initialData.setupInstructions || "",
          estimatedDuration: initialData.estimatedDuration,
          sequence: initialData.sequence,
        }
      : {
          name: "",
          description: "",
          machiningMethods: "",
          setupInstructions: "",
          estimatedDuration: undefined,
          sequence: 0,
        },
  });

  const handleSubmit = async (values: OperationTemplateFormValues) => {
    try {
      setFormError(null);
      console.log("[TEMPLATE SUBMIT] Raw form values:", values);
      
      // Create a clean data object for submission
      const cleanedData = {
        ...values,
        // Ensure these optional fields are null, not empty strings
        description: values.description || null,
        machiningMethods: values.machiningMethods || null,
        setupInstructions: values.setupInstructions || null,
        // Make sure estimatedDuration is properly handled
        estimatedDuration: values.estimatedDuration !== undefined ? 
                           Number(values.estimatedDuration) : null,
        // Ensure sequence is a number
        sequence: typeof values.sequence === 'number' ? 
                 values.sequence : Number(values.sequence) || 0
      };
      
      console.log("[TEMPLATE CLEANED] Data after schema:", cleanedData);
      await onSubmit(cleanedData);
      form.reset();
    } catch (error) {
      console.error("[TEMPLATE SUBMIT ERROR]", error);
      setFormError(error instanceof Error ? error.message : "Failed to submit operation template");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operation Name*</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Milling, Turning" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sequence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sequence Number*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Sequence (e.g., 1, 2, 3)"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                  />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Operation description"
                  className="h-24"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="machiningMethods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machining Methods</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed machining methods"
                    className="h-24"
                    {...field}
                    value={field.value || ""}
                  />
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
                  <Textarea
                    placeholder="Setup instructions"
                    className="h-24"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="estimatedDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Estimated duration in minutes"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {formError}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : initialData
              ? "Update Operation"
              : "Add Operation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
