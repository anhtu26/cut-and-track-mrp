
import { useState } from "react";
import { CustomerCard } from "@/components/customers/customer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from '@/lib/api/client';;
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@/types/customer";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Ensure we always return an array even if data is null
        return (data || []).map((item: any) => ({
          id: item.id,
          name: item.name || "",
          company: item.company || "",
          email: item.email || "",
          phone: item.phone || "",
          address: item.address || "",
          active: item.active || false,
          notes: item.notes || "",
          createdAt: item.created_at || "",
          updatedAt: item.updated_at || "",
          orderCount: item.order_count || 0
        })) as Customer[];
      } catch (error) {
        console.error("Error fetching customers:", error);
        return []; // Return empty array on error
      }
    },
  });
  
  // Apply filtering with strict null/undefined checks
  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer => {
    if (!customer) return false;
    
    const searchLower = (searchTerm || "").toLowerCase();
    
    // Ensure each property exists before calling toLowerCase()
    const nameMatch = customer.name ? customer.name.toLowerCase().includes(searchLower) : false;
    const companyMatch = customer.company ? customer.company.toLowerCase().includes(searchLower) : false;
    const emailMatch = customer.email ? customer.email.toLowerCase().includes(searchLower) : false;
    const phoneMatch = customer.phone ? customer.phone.toLowerCase().includes(searchLower) : false;
    
    return nameMatch || companyMatch || emailMatch || phoneMatch;
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Button asChild>
          <Link to="/customers/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Customer
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p>Loading customers...</p>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-xl font-semibold">No customers found</p>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Add your first customer to get started"}
          </p>
          <Button asChild className="mt-4">
            <Link to="/customers/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Customer
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
