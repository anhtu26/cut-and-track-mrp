
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CustomerForm } from "@/components/customers/customer-form";
import { apiClient } from '@/lib/api/client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Customer } from "@/types";

// Import the same schema used in the form
const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function AddCustomer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: {
      name: string;
      company: string;
      email: string;
      phone?: string | null;
      address?: string | null;
      notes?: string | null;
    }) => {
      console.log("Creating customer with data:", data);

      // Ensure optional fields are properly passed as null when empty
      const customerData = {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        active: true
      };
      
      console.log("Formatted customer data for insertion:", customerData);

      const { data: customer, error } = await apiClient.customers.create(customerData);
      
      if (error) {
        console.error("API error:", error);
        throw new Error(error.message || "Failed to create customer");
      }

      if (!customer) {
        throw new Error("No customer data returned from database");
      }
      
      console.log("Successfully created customer:", customer);
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
          <CustomerForm 
            onSubmit={async (data) => {
              // Ensure data has all required fields for the mutation function
              const customerData = {
                name: data.name,
                company: data.company,
                email: data.email,
                phone: data.phone || null,
                address: data.address || null,
                notes: data.notes || null,
                active: true
              };
              
              await mutateAsync(customerData);
              return;
            }} 
            isSubmitting={isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
