
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Part } from "@/types/part";

const partSchema = z.object({
  name: z.string().min(1, "Name is required"),
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  materials: z.array(z.string()),
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Part"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
