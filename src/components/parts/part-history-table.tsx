
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface PartHistoryItem {
  id: string;
  workOrderNumber: string;
  date: string;
  customer: string;
  quantity: number;
  status: "Complete" | "In Progress" | "QC" | "Not Started";
}

interface PartHistoryTableProps {
  history: PartHistoryItem[];
}

export function PartHistoryTable({ history }: PartHistoryTableProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No production history available
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <Link to={`/work-orders/${item.id}`} className="hover:underline text-blue-600">
                  {item.workOrderNumber}
                </Link>
              </TableCell>
              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
              <TableCell>{item.customer}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
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
    case "Not Started":
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Not Started</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
