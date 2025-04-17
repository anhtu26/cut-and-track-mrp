
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

  const { mutateAsync: createPartMutation, isPending } = useMutation({
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
          revision_number: data.revisionNumber || "",
          active: typeof data.active === 'boolean' ? data.active : true,
          customer_id: data.customerId || null
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

  // Wrapper function to handle the type mismatch
  const handleSubmit = async (data: any): Promise<void> => {
    await createPartMutation(data);
    // Return void to satisfy the type requirements
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm" className="h-10 px-4 text-base">
          <Link to="/parts">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Parts
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Part</CardTitle>
        </CardHeader>
        <CardContent>
          <PartForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
