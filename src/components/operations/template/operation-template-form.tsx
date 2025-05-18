import { useState, useEffect } from "react";
import { OperationTemplate } from "@/types/part";
import { Operation } from "@/types/operation";
import { ModularOperationForm, ModularOperationFormValues } from "../shared/modular-operation-form";
import { apiClient } from '@/lib/api/client';;
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";

interface OperationTemplateFormProps {
  partId: string;
  operation?: Operation;
  existingTemplate?: OperationTemplate;
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Operation template form for adding/editing operation templates
 * Leverages the shared ModularOperationForm component
 */
export function OperationTemplateForm({ 
  partId, 
  operation, 
  existingTemplate, 
  onSubmit,
  onCancel 
}: OperationTemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // For document display in template form
  const [templateDocuments, setTemplateDocuments] = useState<any[]>([]);
  
  // Fetch template documents if we have an existing template
  useEffect(() => {
    const fetchTemplateDocuments = async () => {
      if (existingTemplate?.id) {
        try {
          const { data, error } = await supabase
            .from("template_documents")
            .select("*")
            .eq("template_id", existingTemplate.id);
            
          if (error) throw error;
          if (data) {
            // Map documents to OperationDocument format for ModularOperationForm
            const formattedDocs = data.map(doc => ({
              id: doc.id,
              name: doc.name,
              url: doc.url,
              type: doc.type,
              uploadedAt: doc.uploaded_at,
              size: doc.size
            }));
            setTemplateDocuments(formattedDocs);
          }
        } catch (error) {
          console.error("Error fetching template documents:", error);
        }
      }
    };
    
    fetchTemplateDocuments();
  }, [existingTemplate?.id]);
  
  // Create save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (values: ModularOperationFormValues) => {
      // Use partId directly instead of fetching from work order
      if (!partId) {
        throw new Error("Part ID is required");
      }
      
      // Create template data
      const templateData = {
        name: values.name,
        description: values.description || null,
        machining_methods: values.machiningMethods || null,
        setup_instructions: values.setupInstructions || null,
        sequence: values.sequence,
        part_id: partId,
        ...(existingTemplate ? { updated_at: new Date().toISOString() } : {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      };
      
      // If we have an operation ID, sync operation and documents to the template
      if (operation?.id) {
        // Include document syncing based on includeDocuments flag
        const syncOptions = {
          syncDocuments: values.includeDocuments !== false // Default to true if not specified
        };
        
        if (existingTemplate) {
          // Update existing template
          await supabase
            .from("operation_templates")
            .update(templateData)
            .eq("id", existingTemplate.id);
            
          if (syncOptions.syncDocuments) {
            // Sync documents to template
            await syncOperationDocumentsToTemplate(operation.id, partId, values.name);
          }
        } else {
          // Create new template
          const { data: newTemplate, error } = await supabase
            .from("operation_templates")
            .insert(templateData)
            .select("id")
            .single();
            
          if (error) throw error;
          
          if (syncOptions.syncDocuments && newTemplate?.id) {
            // Sync documents to the new template
            await syncOperationDocumentsToTemplate(operation.id, partId, values.name);
          }
        }
      } else {
        // Direct template creation without an operation
        if (existingTemplate) {
          // Update existing template
          await supabase
            .from("operation_templates")
            .update(templateData)
            .eq("id", existingTemplate.id);
        } else {
          // Create new template
          await supabase
            .from("operation_templates")
            .insert(templateData);
        }
      }
      
      // Return the part ID for invalidation
      return { partId };
    },
    onSuccess: (data) => {
      // Show success message
      toast.success(existingTemplate 
        ? "Template updated successfully" 
        : "Operation saved as template"
      );
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["part", data.partId] });
      queryClient.invalidateQueries({ queryKey: ["operation-templates"] });
      
      // Call custom onSubmit if provided
      if (onSubmit) {
        onSubmit(data);
      }
    },
    onError: (error: any) => {
      console.error("Error saving template:", error);
      toast.error(`Failed to save template: ${error.message || "Unknown error"}`);
    }
  });

  // Handle form submission
  const handleSubmit = async (values: ModularOperationFormValues) => {
    setIsSubmitting(true);
    
    try {
      await saveTemplateMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to sync operation documents to template
  async function syncOperationDocumentsToTemplate(
    operationId: string, 
    partId: string, 
    operationName: string
  ): Promise<void> {
    try {
      console.log(`Syncing documents from operation ${operationId} to template for part ${partId}`);
      
      // Get operation documents
      const { data: documents, error: documentsError } = await supabase
        .from("operation_documents")
        .select("*")
        .eq("operation_id", operationId);
        
      if (documentsError) throw documentsError;
      
      // Get template ID
      const { data: template, error: templateError } = await supabase
        .from("operation_templates")
        .select("id")
        .eq("part_id", partId)
        .eq("name", operationName)
        .maybeSingle();
        
      if (templateError) throw templateError;
      if (!template) {
        throw new Error("Template not found");
      }
      
      const templateId = template.id;
      
      // If no documents to sync, we're done
      if (!documents || documents.length === 0) {
        console.log("No documents to sync");
        return;
      }
      
      console.log(`Found ${documents.length} documents to sync to template`);
      
      // First, clear existing template documents to avoid duplicates
      const { error: deleteError } = await supabase
        .from("template_documents")
        .delete()
        .eq("template_id", templateId);
        
      if (deleteError) {
        console.error("Error clearing existing template documents:", deleteError);
        // Continue anyway to try inserting new documents
      }
      
      // Prepare template documents
      const templateDocuments = documents.map(doc => ({
        template_id: templateId,
        name: doc.name,
        url: doc.url,
        type: doc.type,
        uploaded_at: doc.uploaded_at || new Date().toISOString(),
        size: doc.size
      }));
      
      // Insert all documents to template
      if (templateDocuments.length > 0) {
        const { error: insertError } = await supabase
          .from("template_documents")
          .insert(templateDocuments);
          
        if (insertError) throw insertError;
        
        console.log(`Synced ${templateDocuments.length} documents to template ${templateId}`);
      }
    } catch (error) {
      console.error("Error syncing documents:", error);
      throw error;
    }
  }

  return (
    <ModularOperationForm
      entity={existingTemplate || operation}
      entityType="template"
      parentId={partId}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      showDocuments={true}
      documents={templateDocuments}
    />
  );
}
