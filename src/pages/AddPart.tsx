
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
      
      // Convert materials string to array if provided
      const materials = data.materials ? data.materials.split(',').map((m: string) => m.trim()) : [];
      
      // Create the part object with all fields
      const partData: Record<string, any> = {
        name: data.name || "",
        part_number: data.partNumber || "",
        description: data.description || "",
        materials: materials,
        revision_number: data.revisionNumber || "",
        active: typeof data.active === 'boolean' ? data.active : true
      };
      
      // Handle customerId - only include if it's a valid value (not empty and not "none")
      if (data.customerId && data.customerId !== "none") {
        console.log("Setting customer_id:", data.customerId);
        partData.customer_id = data.customerId;
      } else {
        // Explicitly set to null to avoid schema cache issues
        console.log("Setting customer_id to null");
        partData.customer_id = null;
      }

      console.log("Final part data:", partData);
      
      try {
        const { data: insertData, error } = await supabase
          .from("parts")
          .insert([partData])
          .select();
  
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Insert response:", insertData);
        return insertData;
      } catch (error) {
        console.error("Error during create part operation:", error);
        throw error;
      }
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
