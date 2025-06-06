import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Operation } from "@/types/operation";
import { OperationTemplate } from "@/types/part";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Schema for the template form
export const templateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  machiningMethods: z.string().optional(),
  setupInstructions: z.string().optional(),
  sequence: z.number().min(0, "Sequence must be a positive number"),
  estimatedDuration: z.number().min(0).optional(),
  // We keep this in the schema but set default to true since UI checkbox was removed as redundant
  // This maintains compatibility with existing code that expects this field
  includeDocuments: z.boolean().default(true),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  operation: Operation;
  existingTemplate?: OperationTemplate;
  form: ReturnType<typeof useForm<TemplateFormValues>>;
}

/**
 * Reusable form component for editing operation templates
 */
export function TemplateForm({ 
  operation, 
  existingTemplate,
  form
}: TemplateFormProps) {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operation Name*</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                <Textarea {...field} />
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
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Document handling checkbox removed as it was redundant with the one in Edit Operation Template dialog */}
      </div>
    </Form>
  );
}

/**
 * Calculate estimated duration if we have actual start and end times
 */
export function calculateEstimatedDuration(operation: Operation): number | undefined {
  if (operation.actualStartTime && operation.actualEndTime) {
    const startTime = new Date(operation.actualStartTime).getTime();
    const endTime = new Date(operation.actualEndTime).getTime();
    return Math.round((endTime - startTime) / (1000 * 60)); // in minutes
  }
  return undefined;
}

/**
 * Initialize form with operation data
 */
export function useTemplateForm(operation: Operation, existingTemplate?: OperationTemplate) {
  return useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: operation.name,
      description: operation.description || "",
      machiningMethods: operation.machiningMethods || "",
      setupInstructions: operation.setupInstructions || "",
      sequence: operation.sequence,
      estimatedDuration: calculateEstimatedDuration(operation) || existingTemplate?.estimatedDuration,
      includeDocuments: true,
    },
  });
}
