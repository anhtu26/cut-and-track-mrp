
import { useState } from "react";
import { WorkOrderCard } from "@/components/work-orders/work-order-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockWorkOrders } from "@/data/mock-data";
import { 
  CheckCircle2, 
  CircleDashed, 
  Filter, 
  PlayCircle, 
  PlusCircle, 
  Search, 
  ShieldAlert, 
  TruckIcon 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const filteredOrders = mockWorkOrders.filter(order => {
    // Apply search filter
    const matchesSearch = 
      !searchTerm || 
      order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.part.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
        <Button asChild>
          <Link to="/work-orders/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Work Order
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by work order number, customer, or part..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter(null)}
          className="min-w-fit"
        >
          <Filter className="mr-1 h-4 w-4" />
          All
        </Button>
        <Button
          variant={statusFilter === "Not Started" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("Not Started")}
          className="min-w-fit"
        >
          <CircleDashed className="mr-1 h-4 w-4" />
          Not Started
        </Button>
        <Button
          variant={statusFilter === "In Progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("In Progress")}
          className="min-w-fit"
        >
          <PlayCircle className="mr-1 h-4 w-4" />
          In Progress
        </Button>
        <Button
          variant={statusFilter === "QC" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("QC")}
          className="min-w-fit"
        >
          <ShieldAlert className="mr-1 h-4 w-4" />
          QC
        </Button>
        <Button
          variant={statusFilter === "Complete" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("Complete")}
          className="min-w-fit"
        >
          <CheckCircle2 className="mr-1 h-4 w-4" />
          Complete
        </Button>
        <Button
          variant={statusFilter === "Shipped" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("Shipped")}
          className="min-w-fit"
        >
          <TruckIcon className="mr-1 h-4 w-4" />
          Shipped
        </Button>
      </div>

      {filteredOrders.length > 0 ? (
        <>
          {statusFilter && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Filtering by: {statusFilter}
                <button 
                  className="ml-2 hover:text-destructive"
                  onClick={() => setStatusFilter(null)}
                >
                  ×
                </button>
              </Badge>
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <WorkOrderCard key={order.id} workOrder={order} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-xl font-semibold">No work orders found</p>
          <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}
