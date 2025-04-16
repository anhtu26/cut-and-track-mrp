
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Operation, OperationStatus } from "@/types/operation";
import { useState } from "react";

const operationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["Not Started", "In Progress", "QC", "Complete"]),
  machiningMethods: z.string().optional().nullable(),
  setupInstructions: z.string().optional().nullable(),
  estimatedStartTime: z.string().optional().nullable(),
  estimatedEndTime: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
});

type OperationFormData = z.infer<typeof operationSchema>;

interface OperationFormProps {
  initialData?: Operation;
  workOrderId: string;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export function OperationForm({ initialData, workOrderId, onSubmit, isSubmitting }: OperationFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const defaultValues: OperationFormData = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    status: initialData?.status || "Not Started",
    machiningMethods: initialData?.machiningMethods || "",
    setupInstructions: initialData?.setupInstructions || "",
    estimatedStartTime: initialData?.estimatedStartTime || "",
    estimatedEndTime: initialData?.estimatedEndTime || "",
    assignedToId: initialData?.assignedTo?.id || "",
    comments: initialData?.comments || "",
  };

  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues,
  });

  const handleSubmit = async (data: OperationFormData) => {
    setSubmitError(null);
    try {
      const formattedData = {
        ...(initialData?.id ? { id: initialData.id } : {}),
        workOrderId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        status: data.status as OperationStatus,
        machiningMethods: data.machiningMethods?.trim() || null,
        setupInstructions: data.setupInstructions?.trim() || null,
        estimatedStartTime: data.estimatedStartTime || null,
        estimatedEndTime: data.estimatedEndTime || null,
        assignedToId: data.assignedToId || null,
        comments: data.comments?.trim() || null,
      };
      
      await onSubmit(formattedData);
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
              <FormLabel>Operation Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="QC">QC</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""}
                  placeholder="Provide a detailed description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="estimatedStartTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Start Date (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
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
            name="estimatedEndTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated End Date (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
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
          name="setupInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setup Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""}
                  placeholder="Enter setup instructions for the operation" 
                />
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
              <FormLabel>Machining Methods (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""}
                  placeholder="Enter machining methods for the operation" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""}
                  placeholder="Add any additional comments or notes" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Operation" : "Add Operation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
