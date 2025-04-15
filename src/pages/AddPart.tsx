
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PartForm } from "@/components/parts/part-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddPart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: createPart, isPending } = useMutation({
    mutationFn: async (data: any) => {
      console.log("Submitting data to Supabase:", data);
      
      // Ensure materials is an array even if empty
      const materials = Array.isArray(data.materials) ? data.materials : [];
      
      const { data: insertData, error } = await supabase
        .from("parts")
        .insert([{
          name: data.name || "",
          part_number: data.partNumber || "",
          description: data.description || "",
          materials: materials,
          setup_instructions: data.setupInstructions || "",
          machining_methods: data.machiningMethods || "",
          revision_number: data.revisionNumber || "",
          active: typeof data.active === 'boolean' ? data.active : true
        }])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Insert response:", insertData);
      return insertData;
    },
    onSuccess: (data) => {
      console.log("Part created successfully:", data);
      toast.success("Part created successfully");
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      navigate("/parts");
    },
    onError: (error: any) => {
      console.error("Error creating part:", error);
      let errorMessage = "Failed to create part";
      
      // Check for specific error messages from Supabase
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  });

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
          <CardTitle>Add New Part</CardTitle>
        </CardHeader>
        <CardContent>
          <PartForm onSubmit={createPart} isSubmitting={isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
