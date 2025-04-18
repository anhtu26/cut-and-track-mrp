
import { CardStats } from "@/components/ui/card-stats";
import { Clock, DollarSign, Package, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export interface KPIMetricsProps {
  totalWorkOrders: number;
  completedWorkOrders: number;
  inProgressWorkOrders: number;
  averageCompletionDays: number;
  isLoading?: boolean;
}

export function KPIMetrics({
  totalWorkOrders,
  completedWorkOrders,
  inProgressWorkOrders,
  averageCompletionDays,
  isLoading = false,
}: KPIMetricsProps) {
  // Get current month name
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Calculate utilization (for now just a percentage of completed vs total)
  const utilization = totalWorkOrders > 0 
    ? Math.round((completedWorkOrders / totalWorkOrders) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardStats
        title="Total Work Orders"
        value={totalWorkOrders}
        description="All time"
        icon={<Package className="h-5 w-5" />}
      />
      <CardStats
        title="In Progress"
        value={inProgressWorkOrders}
        description="Currently active"
        icon={<Clock className="h-5 w-5" />}
      />
      <CardStats
        title="Completion Rate"
        variant={utilization > 80 ? "success" : "default"}
        value={`${utilization}%`}
        icon={<Users className="h-5 w-5" />}
        description={
          <div className="w-full pt-1">
            <Progress value={utilization} className="h-1" />
          </div>
        }
      />
      <CardStats
        title="Avg. Completion Time"
        value={averageCompletionDays.toFixed(1)}
        description="Days per order"
        icon={<DollarSign className="h-5 w-5" />}
      />
    </div>
  );
}
