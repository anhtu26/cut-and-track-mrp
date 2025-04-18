import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Operation, OperationStatus } from "@/types/operation";
import { Card } from "@/components/ui/card";
import { OperationDocumentManager } from "./operation-document-manager";

// Define the schema for the operation form
const operationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["Not Started", "In Progress", "QC", "Complete"] as const),
  machiningMethods: z.string().optional(),
  setupInstructions: z.string().optional(),
  sequence: z.number().min(0, "Sequence must be a positive number"),
  estimatedStartTime: z.string().optional().nullable(),
  estimatedEndTime: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  isCustom: z.boolean().optional().default(true),
});

interface OperationFormProps {
  workOrderId: string;
  operation?: Operation;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  suggestedSequence?: number;
}

export function OperationForm({ workOrderId, operation, onSubmit, isSubmitting, suggestedSequence = 10 }: OperationFormProps) {
  const defaultValues = operation
    ? {
        name: operation.name,
        description: operation.description || "",
        status: operation.status,
        machiningMethods: operation.machiningMethods || "",
        setupInstructions: operation.setupInstructions || "",
        sequence: operation.sequence,
        estimatedStartTime: formatDateForInput(operation.estimatedStartTime),
        estimatedEndTime: formatDateForInput(operation.estimatedEndTime),
        assignedToId: operation.assignedToId || undefined,
        comments: operation.comments || "",
        isCustom: operation.isCustom || true,
      }
    : {
        name: "",
        description: "",
        status: "Not Started" as const,
        machiningMethods: "",
        setupInstructions: "",
        sequence: suggestedSequence,
        estimatedStartTime: "",
        estimatedEndTime: "",
        assignedToId: undefined,
        comments: "",
        isCustom: true,
      };

  const form = useForm<z.infer<typeof operationFormSchema>>({
    resolver: zodResolver(operationFormSchema),
    defaultValues,
  });

  const handleSubmit = async (values: z.infer<typeof operationFormSchema>) => {
    try {
      const submitData = {
        ...values,
        workOrderId,
        ...(operation && { id: operation.id }),
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operation Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter operation name" {...field} />
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
                <FormLabel>Status*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter operation description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="machiningMethods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machining Methods</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter machining methods"
                    className="min-h-[100px]"
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
                    placeholder="Enter setup instructions"
                    className="min-h-[100px]"
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
          name="sequence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sequence Number*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter sequence number (e.g. 10, 20, 30)"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>
                Determines the order of operations. Use increments of 10 (10, 20, 30) to allow for future insertions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimatedStartTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value || ""} />
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
                <FormLabel>Estimated End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional comments"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {operation?.id && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Operation Documents</h3>
            <OperationDocumentManager
              operationId={operation.id}
              documents={operation.documents}
              onDocumentAdded={() => {
                // Refresh operation data if needed
              }}
              onDocumentRemoved={() => {
                // Refresh operation data if needed
              }}
            />
          </Card>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : operation ? "Update Operation" : "Add Operation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
