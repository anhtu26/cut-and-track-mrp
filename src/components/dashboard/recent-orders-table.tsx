
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
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Recent Work Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md overflow-hidden">
          <Table className="[&_th]:py-3 [&_td]:py-4 [&_tr:hover]:bg-muted/30">
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="text-base font-semibold">Work Order</TableHead>
                <TableHead className="text-base font-semibold">Customer</TableHead>
                <TableHead className="text-base font-semibold">Part</TableHead>
                <TableHead className="text-base font-semibold">Due Date</TableHead>
                <TableHead className="text-base font-semibold">Status</TableHead>
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
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => window.location.href = `/work-orders/${order.id}`}>
                    <TableCell className="font-medium text-base">
                      <Link to={`/work-orders/${order.id}`} className="text-primary hover:text-primary/80 flex items-center gap-1">
                        {workOrderNumber}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                      </Link>
                    </TableCell>
                    <TableCell className="text-base">{customerName}</TableCell>
                    <TableCell className="text-base">{partName}</TableCell>
                    <TableCell className="text-base">{new Date(dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4">
          <Link to="/work-orders" className="text-primary text-base font-medium hover:text-primary/80 flex items-center gap-1">
            View All Work Orders
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Complete":
      return (
        <Badge variant="outline" className="font-medium text-base py-1 px-3 bg-green-100 text-green-800 border-green-300 dark:bg-green-900/80 dark:text-green-100 dark:border-green-700">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Complete
          </span>
        </Badge>
      );
    case "In Progress":
      return (
        <Badge variant="outline" className="font-medium text-base py-1 px-3 bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/80 dark:text-blue-100 dark:border-blue-700">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            In Progress
          </span>
        </Badge>
      );
    case "QC":
      return (
        <Badge variant="outline" className="font-medium text-base py-1 px-3 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/80 dark:text-amber-100 dark:border-amber-700">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            QC
          </span>
        </Badge>
      );
    case "Shipped":
      return (
        <Badge variant="outline" className="font-medium text-base py-1 px-3 bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/80 dark:text-purple-100 dark:border-purple-700">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            Shipped
          </span>
        </Badge>
      );
    case "Not Started":
    default:
      return (
        <Badge variant="outline" className="font-medium text-base py-1 px-3 bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-500"></span>
            Not Started
          </span>
        </Badge>
      );
  }
}
