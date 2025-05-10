
import { CardStats } from "@/components/ui/card-stats";
import { Clock, DollarSign, Package, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// Simple static component - no props needed as we're using static data
export function KPIMetrics() {
  // Static mock data
  const staticData = {
    totalWorkOrders: 58,
    inProgressOrders: 15,
    completionRate: 75,
    avgCompletionDays: 4.2
  };
  
  // Static month name
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardStats
        title="Total Work Orders"
        value={staticData.totalWorkOrders}
        description="All time"
        icon={<Package className="h-5 w-5" />}
      />
      <CardStats
        title="In Progress"
        value={staticData.inProgressOrders}
        description="Currently active"
        icon={<Clock className="h-5 w-5" />}
      />
      <CardStats
        title="Completion Rate"
        variant={staticData.completionRate > 80 ? "success" : "default"}
        value={`${staticData.completionRate}%`}
        icon={<Users className="h-5 w-5" />}
        description={`${staticData.completionRate}% completion rate`}
      />
      <div className="col-span-1 md:col-span-2 lg:col-span-4 px-4 pb-3 -mt-2">
        <Progress value={staticData.completionRate} className="h-1" />
      </div>
      <CardStats
        title="Avg. Completion Time"
        value={staticData.avgCompletionDays.toFixed(1)}
        description="Days per order"
        icon={<DollarSign className="h-5 w-5" />}
      />
    </div>
  );
}
