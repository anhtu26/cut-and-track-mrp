
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomerForm } from "@/components/customers/customer-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddCustomer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: createCustomer, isPending } = useMutation({
    mutationFn: async (data: {
      name: string;
      company: string;
      email: string;
      phone?: string | null;
      address?: string | null;
      notes?: string | null;
    }) => {
      console.log("Creating customer with data:", data);

      const { data: customer, error } = await supabase
        .from('customers')
        .insert([{
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          notes: data.notes || null,
          active: true
        }])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to create customer");
      }
      
      if (!customer) {
        throw new Error("No customer data returned from database");
      }
      
      return customer;
    },
    onSuccess: () => {
      toast.success("Customer created successfully");
      // Important: invalidate both customers query AND the cache for work order form
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate("/customers");
    },
    onError: (error: any) => {
      console.error("Error creating customer:", error);
      toast.error(error.message || "Failed to create customer");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm onSubmit={createCustomer} isSubmitting={isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
