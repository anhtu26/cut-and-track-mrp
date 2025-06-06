
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { WorkOrder } from "@/types/work-order";
import { WorkOrderCard } from "@/components/work-orders/work-order-card";

export default function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  
  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ["workOrders", includeArchived],
    queryFn: async () => {
      console.log("Fetching work orders, includeArchived:", includeArchived);
      
      try {
        // This is a workaround until we update the Supabase types
        const query = supabase
          .from('work_orders')
          .select(`
            *,
            customer:customers(*),
            part:parts(*),
            operations:operations(*)
          `)
          .order('created_at', { ascending: false });
  
        if (!includeArchived) {
          query.eq('archived', false);
        }
  
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching work orders:", error);
          throw error;
        }
        
        console.log("Fetched work orders:", data);
        
        // Transform the database response to match our WorkOrder interface
        return data.map((item: any) => ({
          id: item.id,
          workOrderNumber: item.work_order_number,
          purchaseOrderNumber: item.purchase_order_number,
          customer: {
            id: item.customer.id,
            name: item.customer.name,
            company: item.customer.company,
            email: item.customer.email,
            phone: item.customer.phone,
            address: item.customer.address,
            active: item.customer.active,
            notes: item.customer.notes,
            createdAt: item.customer.created_at,
            updatedAt: item.customer.updated_at,
            orderCount: item.customer.order_count || 0
          },
          customerId: item.customer_id,
          part: {
            id: item.part.id,
            name: item.part.name,
            partNumber: item.part.part_number,
            description: item.part.description,
            active: item.part.active,
            materials: item.part.materials || [],
            setupInstructions: item.part.setup_instructions,
            machiningMethods: item.part.machining_methods,
            revisionNumber: item.part.revision_number,
            createdAt: item.part.created_at,
            updatedAt: item.part.updated_at,
            documents: [],
            archived: item.part.archived,
            archivedAt: item.part.archived_at,
            archiveReason: item.part.archive_reason
          },
          partId: item.part_id,
          quantity: item.quantity,
          status: item.status,
          priority: item.priority,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          startDate: item.start_date,
          dueDate: item.due_date,
          completedDate: item.completed_date,
          assignedTo: item.assigned_to_id ? {
            id: item.assigned_to_id,
            name: item.assigned_to_name || "Unknown"
          } : undefined,
          notes: item.notes,
          operations: (item.operations || []).map((op: any) => ({
            id: op.id,
            workOrderId: op.work_order_id,
            name: op.name,
            description: op.description || "",
            status: op.status,
            machiningMethods: op.machining_methods || "",
            setupInstructions: op.setup_instructions || "",
            estimatedStartTime: op.estimated_start_time,
            estimatedEndTime: op.estimated_end_time,
            actualStartTime: op.actual_start_time,
            actualEndTime: op.actual_end_time,
            comments: op.comments,
            assignedTo: op.assigned_to_id ? {
              id: op.assigned_to_id,
              name: "Unknown" // We would need to fetch operator names separately
            } : undefined,
            createdAt: op.created_at,
            updatedAt: op.updated_at,
            documents: []
          })),
          archived: item.archived,
          archivedAt: item.archived_at,
          archiveReason: item.archive_reason
        })) as WorkOrder[];
      } catch (error) {
        console.error("Error in work orders query:", error);
        throw error;
      }
    },
  });

  const filteredWorkOrders = workOrders.filter(order => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      order.workOrderNumber?.toLowerCase().includes(lowerSearchTerm) ||
      order.purchaseOrderNumber?.toLowerCase().includes(lowerSearchTerm) ||
      order.customer.name.toLowerCase().includes(lowerSearchTerm) ||
      order.part.name.toLowerCase().includes(lowerSearchTerm) ||
      order.part.partNumber.toLowerCase().includes(lowerSearchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
        <Button asChild>
          <Link to="/work-orders/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Work Order
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by work order number, PO number, customer or part..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIncludeArchived(!includeArchived)}
          className="whitespace-nowrap"
        >
          {includeArchived ? "Hide Archived" : "Show Archived"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p>Loading work orders...</p>
        </div>
      ) : filteredWorkOrders.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filteredWorkOrders.map((workOrder) => (
            <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-xl font-semibold">No work orders found</p>
          <p className="text-muted-foreground">
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "Create your first work order to get started"}
          </p>
          <Button asChild className="mt-4">
            <Link to="/work-orders/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
