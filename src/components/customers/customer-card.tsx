
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, CalendarClock, FileText, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Customer } from "@/types/customer";

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1 text-left">
            {customer.name}
          </CardTitle>
          <Badge variant={customer.active ? "default" : "outline"}>
            {customer.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">{customer.company}</p>
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{customer.phone}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">Client since {new Date(customer.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">{customer.orderCount} orders</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/customers/${customer.id}`}>View Details</Link>
        </Button>
        <Button asChild>
          <Link to={`/work-orders/new?customerId=${customer.id}`}>New Order</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
