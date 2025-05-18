import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Operation, OperationDocument, OperationStatus } from "@/types/operation";
import { FileText, Image, Trash2 } from "lucide-react";
import { DocumentViewer } from "@/components/parts/document-viewer";
import { Card } from "@/components/ui/card";
import { OperationDocumentManager } from "../operation-document-manager";
import { formatDateForInput } from "@/lib/date-utils";
import { OperationTemplate } from "@/types/part";
import { apiClient } from '@/lib/api/client';;
import { toast } from "@/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define the schema for the operation form - used for both operations and templates
export const operationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["Not Started", "In Progress", "QC", "Complete"] as const).optional(),
  machiningMethods: z.string().optional(),
  setupInstructions: z.string().optional(),
  sequence: z.number().min(0, "Sequence must be a positive number"),
  estimatedStartTime: z.string().optional().nullable(),
  estimatedEndTime: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  isCustom: z.boolean().optional().default(true),
  // This field is used for templates to decide whether to sync documents
  includeDocuments: z.boolean().optional().default(true),
});

export type ModularOperationFormValues = z.infer<typeof operationFormSchema>;

export interface ModularOperationFormProps {
  // Support both operation and template
  entity?: Operation | OperationTemplate;
  entityType: 'operation' | 'template';
  // The parent entity ID (work order ID for operations, part ID for templates)
  parentId: string;
  onSubmit: (data: ModularOperationFormValues) => Promise<void>;
  isSubmitting: boolean;
  suggestedSequence?: number;
  // Callback when cancel is clicked
  onCancel?: () => void;
  // Whether this form needs the document section
  showDocuments?: boolean;
  // Additional documents to show (for templates)
  documents?: OperationDocument[];
}

export function ModularOperationForm({
  entity,
  entityType,
  parentId,
  onSubmit,
  isSubmitting,
  suggestedSequence = 10,
  onCancel,
  showDocuments = true,
  documents = []
}: ModularOperationFormProps) {
  // Handle both Operation and OperationTemplate types
  const isOperation = entityType === 'operation';
  const isTemplate = entityType === 'template';
  
  // Set default values based on entity type and existence
  const defaultValues = entity
    ? {
        name: entity.name,
        description: entity.description || "",
        status: isOperation ? (entity as Operation).status : "Not Started",
        machiningMethods: entity.machiningMethods || "",
        setupInstructions: entity.setupInstructions || "",
        sequence: entity.sequence,
        estimatedStartTime: isOperation ? formatDateForInput((entity as Operation).estimatedStartTime) : "",
        estimatedEndTime: isOperation ? formatDateForInput((entity as Operation).estimatedEndTime) : "",
        assignedToId: isOperation ? (entity as Operation).assignedTo?.id || undefined : undefined,
        comments: isOperation ? (entity as Operation).comments || "" : "",
        isCustom: isOperation ? (entity as Operation).isCustom || true : true,
        includeDocuments: true,
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
        includeDocuments: true,
      };

  const form = useForm<ModularOperationFormValues>({
    resolver: zodResolver(operationFormSchema),
    defaultValues,
  });

  const handleSubmit = async (values: ModularOperationFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Default fallback if no custom cancel handler
      window.history.back();
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

          {isOperation && (
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
          )}

          {!isOperation && (
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
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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

        {isOperation && (
          <>
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
          </>
        )}

        {showDocuments && isOperation && entity && (entity as Operation).id && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Operation Documents</h3>
            <OperationDocumentManager
              operationId={(entity as Operation).id}
              documents={(entity as Operation).documents}
              onDocumentAdded={() => {
                // Refresh operation data if needed
              }}
              onDocumentRemoved={() => {
                // Refresh operation data if needed
              }}
            />
          </Card>
        )}

        {showDocuments && isTemplate && documents && documents.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Template Documents</h3>
            <div className="space-y-2 border rounded-md p-2">
              {documents.map((doc) => {
                // Create a mutation for deleting template documents
                const queryClient = useQueryClient();
                const deleteDocumentMutation = useMutation({
                  mutationFn: async () => {
                    if (!doc.id) throw new Error("Document ID is required");
                    
                    // Delete from template_documents table
                    const { error } = await supabase
                      .from("template_documents")
                      .delete()
                      .eq("id", doc.id);
                      
                    if (error) throw error;
                    return doc.id;
                  },
                  onSuccess: () => {
                    toast.success("Document deleted successfully");
                    // Invalidate relevant queries
                    queryClient.invalidateQueries({ queryKey: ["part"] });
                    queryClient.invalidateQueries({ queryKey: ["operation-templates"] });
                  },
                  onError: (error: any) => {
                    console.error("Error deleting document:", error);
                    toast.error(`Failed to delete document: ${error.message || "Unknown error"}`);
                  },
                });
                
                return (
                  <div key={doc.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div className="flex items-center">
                      {doc.type?.includes('pdf') ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <Image className="h-4 w-4" />
                      )}
                      <span className="ml-2 text-sm">{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DocumentViewer 
                        document={doc}
                        documentType="operation"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteDocumentMutation.mutate()}
                        disabled={deleteDocumentMutation.isPending}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? "Saving..." 
              : isOperation 
                ? entity ? "Update Operation" : "Add Operation"
                : entity ? "Update Template" : "Save Template"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
