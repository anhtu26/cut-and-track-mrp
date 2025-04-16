import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PartForm } from "@/components/parts/part-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Part } from "@/types/part";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPart() {
  const { partId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log("[EDIT PART] Part ID from router:", partId);

  // Early validation of partId
  if (!partId) {
    console.error("[EDIT LOAD ERROR] Part ID is missing from route params");
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
        <p className="text-muted-foreground mb-6">No part ID was provided.</p>
        <Button asChild>
          <Link to="/parts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parts
          </Link>
        </Button>
      </div>
    );
  }

  const { data: part, isLoading, error } = useQuery({
    queryKey: ["part", partId],
    queryFn: async () => {
      console.log("[EDIT LOAD] Requested part ID:", partId);
      
      try {
        const { data, error } = await supabase
          .from("parts")
          .select(`
            *,
            documents:part_documents(*)
          `)
          .eq("id", partId)
          .maybeSingle();

        if (error) {
          console.error("[EDIT LOAD ERROR]", error);
          throw error;
        }
        
        console.log("[EDIT LOAD] Supabase result:", data);
        
        if (!data) {
          console.error("[EDIT LOAD ERROR] No part found with ID:", partId);
          throw new Error("Part not found");
        }

        return {
          id: data.id,
          name: data.name,
          partNumber: data.part_number,
          description: data.description || "",
          active: data.active,
          materials: data.materials || [],
          setupInstructions: data.setup_instructions,
          machiningMethods: data.machining_methods,
          revisionNumber: data.revision_number,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          archived: data.archived,
          archivedAt: data.archived_at,
          archiveReason: data.archive_reason,
          documents: (data.documents || []).map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            uploadedAt: doc.uploaded_at,
            type: doc.type
          }))
        } as Part;
      } catch (error) {
        console.error("[EDIT LOAD ERROR]", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: updatePartMutation, isPending } = useMutation({
    mutationFn: async (data: any) => {
      console.log("[UPDATE] Updating part with data:", data);
      
      // Ensure materials is an array
      const materials = Array.isArray(data.materials) ? data.materials : [];
      
      const { data: updateData, error } = await supabase
        .from("parts")
        .update({
          name: data.name || "",
          part_number: data.partNumber || "",
          description: data.description || "",
          materials: materials,
          setup_instructions: data.setupInstructions || "",
          machining_methods: data.machiningMethods || "",
          revision_number: data.revisionNumber || "",
          active: typeof data.active === 'boolean' ? data.active : true,
          updated_at: new Date().toISOString()
        })
        .eq("id", partId)
        .select();

      if (error) {
        console.error("[UPDATE ERROR] Supabase update error:", error);
        throw error;
      }
      
      console.log("[UPDATE SUCCESS] Update response:", updateData);
      return updateData;
    },
    onSuccess: (data) => {
      console.log("[UPDATE SUCCESS] Part updated successfully:", data);
      
      // FIX 1: Force invalidate queries to ensure fresh data before navigation
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
      
      // FIX 2: Add a slight delay to ensure the query cache is updated before navigation
      // This helps prevent the "Not Found" issue after editing
      setTimeout(() => {
        console.log("[NAVIGATION] Redirecting to part details:", `/parts/${partId}`);
        
        // FIX 3: Double check that partId is still valid
        if (partId) {
          toast.success("Part updated successfully");
          navigate(`/parts/${partId}`);
        } else {
          console.error("[NAVIGATION ERROR] Missing partId before navigation");
          toast.error("Navigation error: Part ID is missing");
          navigate("/parts");
        }
      }, 300);
    },
    onError: (error: any) => {
      console.error("[UPDATE ERROR] Error updating part:", error);
      let errorMessage = "Failed to update part";
      
      // Check for specific error messages from Supabase
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  });

  const handleSubmit = async (data: any): Promise<void> => {
    console.log("[FORM SUBMIT] Submitting part update:", data);
    await updatePartMutation(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild size="sm">
            <Link to="/parts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Parts
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-8 w-64" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Part Not Found</h1>
        <p className="text-muted-foreground mb-6">The part you are trying to edit does not exist or has been removed.</p>
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
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to={`/parts/${partId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Part Details
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Part: {part.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <PartForm 
            initialData={part}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
