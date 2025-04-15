
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WorkOrder } from "@/types/work-order";
import { Link } from "react-router-dom";

interface RecentOrdersTableProps {
  orders: WorkOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent work orders
      </div>
    );
  }

  return (
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
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <Link to={`/work-orders/${order.id}`} className="text-blue-600 hover:underline">
                  {order.workOrderNumber}
                </Link>
              </TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell>{order.part.name}</TableCell>
              <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
