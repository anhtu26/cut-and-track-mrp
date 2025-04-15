
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

export default function EditPart() {
  const { partId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: part, isLoading } = useQuery({
    queryKey: ["part", partId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .eq("id", partId)
        .single();

      if (error) throw error;

      return {
        ...data,
        partNumber: data.part_number,
        setupInstructions: data.setup_instructions,
        machiningMethods: data.machining_methods,
        revisionNumber: data.revision_number,
      } as Part;
    },
  });

  const { mutateAsync: updatePart, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("parts")
        .update({
          name: data.name,
          part_number: data.partNumber,
          description: data.description,
          materials: data.materials,
          setup_instructions: data.setupInstructions,
          machining_methods: data.machiningMethods,
          revision_number: data.revisionNumber,
          active: data.active,
          updated_at: new Date().toISOString()
        })
        .eq("id", partId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Part updated successfully");
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      queryClient.invalidateQueries({ queryKey: ["part", partId] });
      navigate(`/parts/${partId}`);
    },
    onError: (error) => {
      console.error("Error updating part:", error);
      toast.error("Failed to update part");
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!part) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
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
            onSubmit={updatePart}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
