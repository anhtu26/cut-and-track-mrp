import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartDetailTabs } from "@/components/parts/part-detail-tabs";
import { ArrowLeft, Archive, FileEdit } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArchivePartDialog } from "@/components/parts/archive-part-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Part, OperationTemplate } from "@/types/part";
import { Skeleton } from "@/components/ui/skeleton";

export default function PartDetail() {
  const { partId } = useParams();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const navigate = useNavigate();
  const navigationAttempted = useRef(false);
  
  console.log("[PART DETAIL INIT] Part ID from router:", partId);
  
  // Only run navigation effect once to prevent loops
  useEffect(() => {
    if (!partId && !navigationAttempted.current) {
      console.error("[PART DETAIL ERROR] No part ID in route params");
      navigationAttempted.current = true;
      navigate("/parts");
    }
  }, [partId, navigate]);

  const { data: part, isLoading, error } = useQuery({
    queryKey: ["part", partId],
    queryFn: async () => {
      console.log("[PART DETAIL] Fetching part with ID:", partId);
      
      if (!partId) {
        console.error("[PART DETAIL ERROR] Part ID is missing");
        throw new Error("Part ID is required");
      }
      
      try {
        // FIX 1: Split the query into two parts to avoid foreign key relationship error
        // First, get the part data without the operation_templates
        const { data: partData, error: partError } = await supabase
          .from("parts")
          .select(`
            *,
            documents:part_documents(*)
          `)
          .eq("id", partId)
          .maybeSingle(); // FIX 2: Using maybeSingle instead of single to prevent errors

        if (partError) {
          console.error("[PART DETAIL ERROR]", partError);
          throw partError;
        }
        
        if (!partData) {
          console.error("[PART DETAIL ERROR] No part found with ID:", partId);
          return null; // Return null instead of throwing error for "not found" case
        }

        // FIX 3: Add explicit check for operation_templates table before querying
        let operationTemplates = [];
        try {
          // Check if the operation_templates table exists first
          const { error: checkError } = await supabase
            .from("operation_templates")
            .select("count")
            .limit(1)
            .throwOnError();
            
          // If we get here, the table exists
          console.log("[OPERATION TEMPLATES] Table check successful, proceeding with query");
            
          const { data: templatesData, error: templatesError } = await supabase
            .from("operation_templates")
            .select("*")
            .eq("part_id", partId);

          if (templatesError) {
            // Just log the error but don't fail the whole query
            console.error("[OPERATION TEMPLATES ERROR]", templatesError);
          } else if (templatesData) {
            operationTemplates = templatesData.map((template: any) => ({
              id: template.id,
              partId: template.part_id,
              name: template.name,
              description: template.description || "",
              machiningMethods: template.machining_methods || "",
              setupInstructions: template.setup_instructions || "",
              estimatedDuration: template.estimated_duration,
              sequence: template.sequence,
              createdAt: template.created_at,
              updatedAt: template.updated_at
            }));
          }
        } catch (templateQueryError) {
          // Catch but don't fail the whole part load - improved error handling
          console.error("[OPERATION TEMPLATES QUERY ERROR]", templateQueryError);
          console.warn("[OPERATION TEMPLATES] Continuing with empty templates list");
        }
        
        // FIX 4: Map the part data to the Part type
        console.log("[PART DETAIL] Supabase result:", partData);
        
        return {
          id: partData.id,
          name: partData.name,
          partNumber: partData.part_number,
          description: partData.description || "",
          active: partData.active,
          materials: partData.materials || [],
          setupInstructions: partData.setup_instructions,
          machiningMethods: partData.machining_methods,
          revisionNumber: partData.revision_number,
          createdAt: partData.created_at,
          updatedAt: partData.updated_at,
          archived: partData.archived,
          archivedAt: partData.archived_at,
          archiveReason: partData.archive_reason,
          documents: (partData.documents || []).map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            uploadedAt: doc.uploaded_at,
            type: doc.type
          })),
          operationTemplates: operationTemplates as OperationTemplate[]
        } as Part;
      } catch (error) {
        console.error("[PART DETAIL ERROR]", error);
        throw error;
      }
    },
    enabled: Boolean(partId), // FIX 5: Only run query if partId exists
    retry: 1, // Limit retry attempts
    staleTime: 30000, // FIX 6: Adding staleTime to prevent unnecessary refetches
    refetchOnWindowFocus: false, // FIX 7: Prevent refetch on window focus which can cause loops
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ["part-work-orders", partId],
    queryFn: async () => {
      if (!partId) {
        console.log("[WORK ORDERS] No partId available, skipping fetch");
        return [];
      }
      
      try {
        console.log("[WORK ORDERS] Fetching work orders for part:", partId);
        const { data, error } = await supabase
          .from("work_orders")
          .select(`
            id, 
            work_order_number,
            status,
            created_at,
            customer:customers(name)
          `)
          .eq("part_id", partId)
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error("[WORK ORDERS ERROR]", error);
          throw error;
        }
        
        console.log("[WORK ORDERS] Found:", data?.length || 0);
        return data.map((item: any) => ({
          id: item.id,
          workOrderNumber: item.work_order_number,
          status: item.status,
          createdAt: item.created_at,
          customer: {
            name: item.customer?.name || "Unknown Customer"
          }
        }));
      } catch (error) {
        console.error("[WORK ORDERS ERROR]", error);
        return [];
      }
    },
    enabled: Boolean(partId),
  });

  // Show loading state while the part data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <Button variant="outline" asChild size="sm">
            <Link to="/parts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Parts
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Only show error or not found after loading is complete
  if (error || !part) {
    console.error("[PART DETAIL] Error or missing part:", error);
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Part Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error 
            ? `Error: ${error.message}` 
            : "The part you are looking for does not exist or has been removed."}
        </p>
        <Button asChild>
          <Link to="/parts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parts
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <Button variant="outline" asChild size="sm">
          <Link to="/parts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parts
          </Link>
        </Button>
        <div className="flex gap-2">
          {!part.archived && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowArchiveDialog(true)}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive Part
              </Button>
              <Button asChild>
                <Link to={`/parts/${part.id}/edit`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit Part
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <CardTitle className="text-2xl">{part.name}</CardTitle>
              <p className="text-muted-foreground mt-1">Part Number: {part.partNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={part.active ? "default" : "outline"}>
                {part.active ? "Active" : "Inactive"}
              </Badge>
              {part.archived && (
                <Badge variant="destructive">Archived</Badge>
              )}
              {part.revisionNumber && (
                <Badge variant="outline" className="ml-2">
                  Rev {part.revisionNumber}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm">{new Date(part.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm">{new Date(part.updatedAt).toLocaleDateString()}</p>
            </div>
            {part.archived && part.archivedAt && (
              <div>
                <p className="text-sm font-medium text-destructive">Archived</p>
                <p className="text-sm">{new Date(part.archivedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          {part.archived && part.archiveReason && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Archive Reason:</p>
              <p className="text-sm mt-1">{part.archiveReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <PartDetailTabs 
        partId={part.id}
        description={part.description}
        materials={part.materials || []}
        documents={part.documents}
        operationTemplates={part.operationTemplates || []}
        workOrders={workOrders}
      />

      <ArchivePartDialog
        isOpen={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        partId={part.id}
        partName={part.name}
      />
    </div>
  );
}
