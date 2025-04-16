import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomerForm } from "@/components/customers/customer-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Customer } from "@/types/customer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function EditCustomer() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch customer data
  const { data: customer, isLoading: isCustomerLoading, error: customerError } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      if (!customerId) {
        console.error("[EDIT LOAD ERROR] Customer ID is missing");
        throw new Error("Customer ID is required");
      }
      
      console.log("[EDIT LOAD] Requested customer ID:", customerId);
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();

        if (error) {
          console.error("[EDIT LOAD ERROR]", error);
          throw error;
        }
        
        console.log("[EDIT LOAD] Supabase result:", data);
        
        if (!data) {
          console.error("[EDIT LOAD ERROR] No customer found with ID:", customerId);
          throw new Error("Customer not found");
        }
        
        return {
          id: data.id,
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          address: data.address,
          active: data.active,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          orderCount: data.order_count || 0
        } as Customer;
      } catch (error) {
        console.error("[EDIT LOAD ERROR]", error);
        throw error;
      }
    },
    enabled: !!customerId,
  });

  // Update customer mutation
  const { mutateAsync: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: async (data: {
      name: string;
      company: string;
      email: string;
      phone?: string | null;
      address?: string | null;
      notes?: string | null;
    }) => {
      console.log("Updating customer with data:", data);

      if (!customerId) throw new Error("Customer ID is required");

      // Ensure optional fields are properly handled
      const customerData = {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null
      };
      
      console.log("Formatted customer data for update:", customerData);

      const { data: updatedCustomer, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', customerId)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to update customer");
      }
      
      console.log("Successfully updated customer:", updatedCustomer);
      return updatedCustomer;
    },
    onSuccess: () => {
      toast.success("Customer updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
    },
    onError: (error: any) => {
      console.error("Error updating customer:", error);
      toast.error(error.message || "Failed to update customer");
    },
  });

  // Archive/delete customer mutation
  const { mutateAsync: archiveCustomer, isPending: isArchiving } = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error("Customer ID is required");

      // First check if there are any work orders for this customer
      const { data: workOrders, error: workOrderError } = await supabase
        .from('work_orders')
        .select('id')
        .eq('customer_id', customerId);
      
      if (workOrderError) throw workOrderError;
      
      // If there are work orders, we'll set the customer as inactive instead of deleting
      if (workOrders && workOrders.length > 0) {
        console.log(`Customer has ${workOrders.length} work orders, setting as inactive`);
        const { error } = await supabase
          .from('customers')
          .update({ active: false })
          .eq('id', customerId);
        
        if (error) throw error;
        return { archived: true, deleted: false };
      }
      
      // If no work orders, we can delete the customer
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
      
      if (error) throw error;
      return { archived: false, deleted: true };
    },
    onSuccess: (result) => {
      if (result.deleted) {
        toast.success("Customer deleted successfully");
      } else {
        toast.success("Customer archived successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate("/customers");
    },
    onError: (error: any) => {
      console.error("Error archiving/deleting customer:", error);
      toast.error(error.message || "Failed to archive/delete customer");
    },
  });

  const handleArchiveCustomer = async () => {
    try {
      await archiveCustomer();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error in handleArchiveCustomer:", error);
    }
  };

  if (isCustomerLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <p className="text-destructive">
          Error loading customer: {customerError instanceof Error ? customerError.message : "Unknown error"}
        </p>
        <Button asChild variant="outline">
          <Link to="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isArchiving}>
              <Trash className="mr-2 h-4 w-4" />
              {isArchiving ? "Processing..." : "Archive/Delete"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                If this customer has work orders, it will be marked as inactive.
                Otherwise, it will be permanently deleted.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleArchiveCustomer}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isArchiving ? "Processing..." : "Proceed"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm 
            initialData={customer} 
            onSubmit={updateCustomer} 
            isSubmitting={isUpdating} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
