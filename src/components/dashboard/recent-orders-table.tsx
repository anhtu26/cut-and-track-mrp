
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WorkOrder } from "@/types/work-order";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RecentOrdersTableProps {
  orders: WorkOrder[] | any[];
  isLoading?: boolean;
}

export function RecentOrdersTable({ orders, isLoading = false }: RecentOrdersTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between border-b pb-2">
                <Skeleton className="h-4 w-[20%]" />
                <Skeleton className="h-4 w-[30%]" />
                <Skeleton className="h-4 w-[20%]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent work orders
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to safely access nested properties
  const safeGetNestedValue = (obj: any, path: string, defaultValue: any = 'Unknown') => {
    try {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                // Get work order number - adaptable to different data structures
                const workOrderNumber = order.workOrderNumber || order.work_order_number || `WO-${order.id.substring(0, 6)}`;
                
                // Get customer name - handles both nested objects and direct properties
                const customerName = safeGetNestedValue(order, 'customer.name') || 
                                    safeGetNestedValue(order, 'customers.name') || 
                                    'Unknown Customer';
                
                // Get part name - handles both nested objects and direct properties
                const partName = safeGetNestedValue(order, 'part.name') || 
                                safeGetNestedValue(order, 'parts.name') || 
                                'Unknown Part';
                
                // Get due date with fallback
                const dueDate = order.due_date || order.dueDate || new Date().toISOString();
                
                // Get status
                const status = order.status || 'Not Started';
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link to={`/work-orders/${order.id}`} className="text-blue-600 hover:underline">
                        {workOrderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{customerName}</TableCell>
                    <TableCell>{partName}</TableCell>
                    <TableCell>{new Date(dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Complete":
      return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Complete</Badge>;
    case "In Progress":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">In Progress</Badge>;
    case "QC":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">QC</Badge>;
    case "Shipped":
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">Shipped</Badge>;
    case "Not Started":
    default:
      return <Badge variant="outline">Not Started</Badge>;
  }
}
