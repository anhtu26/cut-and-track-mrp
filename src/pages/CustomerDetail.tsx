
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building, FileText, CalendarClock, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          status, priority, created_at, due_date, completed_date,
          part:parts(id, name, part_number)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((order: any) => ({
        id: order.id,
        workOrderNumber: order.work_order_number,
        purchaseOrderNumber: order.purchase_order_number,
        status: order.status,
        priority: order.priority,
        createdAt: order.created_at,
        dueDate: order.due_date,
        completedDate: order.completed_date,
        part: {
          id: order.part.id,
          name: order.part.name,
          partNumber: order.part.part_number
        }
      }));
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

  // Separate work orders by status for better display
  const activeWorkOrders = workOrders.filter(order => 
    !["Complete", "Shipped"].includes(order.status)
  );
  
  const completedWorkOrders = workOrders.filter(order => 
    ["Complete", "Shipped"].includes(order.status)
  );

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
                <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Customer since {format(new Date(customer.createdAt), "PPP")}</span>
              </div>
              
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Last updated on {format(new Date(customer.updatedAt), "PPP")}</span>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Total orders: {workOrders.length}</span>
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
            ) : (
              <Tabs defaultValue="active" className="w-full">
                <TabsList>
                  <TabsTrigger value="active">Active Orders ({activeWorkOrders.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed Orders ({completedWorkOrders.length})</TabsTrigger>
                  <TabsTrigger value="all">All Orders ({workOrders.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  {renderWorkOrdersTable(activeWorkOrders)}
                </TabsContent>
                
                <TabsContent value="completed">
                  {renderWorkOrdersTable(completedWorkOrders)}
                </TabsContent>
                
                <TabsContent value="all">
                  {renderWorkOrdersTable(workOrders)}
                </TabsContent>
              </Tabs>
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
  
  function renderWorkOrdersTable(orders: any[]) {
    if (orders.length === 0) {
      return (
        <div className="text-center p-8 bg-muted/10 border rounded-md">
          <p className="text-muted-foreground">No work orders found in this category.</p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order #</TableHead>
            <TableHead>PO Number</TableHead>
            <TableHead>Part</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link to={`/work-orders/${order.id}`} className="text-primary hover:underline">
                  {order.workOrderNumber}
                </Link>
              </TableCell>
              <TableCell>{order.purchaseOrderNumber || "—"}</TableCell>
              <TableCell>
                <Link to={`/parts/${order.part.id}`} className="text-primary hover:underline">
                  {order.part.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {order.part.partNumber}
                </div>
              </TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.priority}</TableCell>
              <TableCell>{format(new Date(order.createdAt), "PP")}</TableCell>
              <TableCell>{format(new Date(order.dueDate), "PP")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}
