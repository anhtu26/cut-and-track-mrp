
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

export default function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();

  // Fetch customer data
  const { data: customer, isLoading: isCustomerLoading, error: customerError } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID is required");
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Customer not found");
      
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
    },
    enabled: !!customerId,
  });

  // Fetch customer work orders
  const { data: workOrders = [], isLoading: isWorkOrdersLoading } = useQuery({
    queryKey: ["customer-work-orders", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID is required");
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id, work_order_number, purchase_order_number, 
          status, priority, created_at, due_date
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data;
    },
    enabled: !!customerId,
  });

  if (isCustomerLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-destructive">
          Error loading customer: {customerError instanceof Error ? customerError.message : "Unknown error"}
        </p>
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
        
        <Button asChild size="sm">
          <Link to={`/customers/${customerId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              <CardDescription className="text-xl font-medium mt-1">
                {customer.company}
              </CardDescription>
            </div>
            <Badge variant={customer.active ? "default" : "outline"}>
              {customer.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                  {customer.email}
                </a>
              </div>
              
              {customer.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={`tel:${customer.phone}`} className="hover:underline">
                    {customer.phone}
                  </a>
                </div>
              )}
              
              {customer.address && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Created on {format(new Date(customer.createdAt), "PPP")}</span>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{workOrders.length} Work Orders</span>
              </div>
            </div>
          </div>
          
          {customer.notes && (
            <div>
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                {customer.notes}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">Work Orders</h3>
            {isWorkOrdersLoading ? (
              <p>Loading work orders...</p>
            ) : workOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order #</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link to={`/work-orders/${order.id}`} className="text-primary hover:underline">
                          {order.work_order_number}
                        </Link>
                      </TableCell>
                      <TableCell>{order.purchase_order_number || "—"}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.priority}</TableCell>
                      <TableCell>{format(new Date(order.created_at), "PP")}</TableCell>
                      <TableCell>{format(new Date(order.due_date), "PP")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No work orders found for this customer.</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link to={`/work-orders/new?customerId=${customer.id}`}>
              Create Work Order
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
