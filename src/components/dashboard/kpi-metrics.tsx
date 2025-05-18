
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
    completedOrders: 43,
    completionRate: 75,
    avgCompletionDays: 4.2,
    onTimeDelivery: 92
  };
  
  // Static month name
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardStats
          title="Total Work Orders"
          value={staticData.totalWorkOrders}
          description={`Updated: ${new Date().toLocaleDateString()}`}
          icon={<Package className="h-6 w-6" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <CardStats
          title="In Progress"
          value={staticData.inProgressOrders}
          description={`${staticData.inProgressOrders} orders in production`}
          icon={<Clock className="h-6 w-6" />}
          className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <CardStats
          title="Completed"
          value={staticData.completedOrders}
          description={`${staticData.completionRate}% completion rate`}
          icon={<Users className="h-6 w-6" />}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <CardStats
          title="Avg. Completion Time"
          value={staticData.avgCompletionDays.toFixed(1)}
          description="Days per order"
          icon={<DollarSign className="h-6 w-6" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow duration-200"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Completion Progress</h3>
            <span className="text-sm font-semibold text-primary">{staticData.completionRate}%</span>
          </div>
          <Progress value={staticData.completionRate} className="h-2.5 rounded-full" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Target: 85%</span>
            <span>Monthly Goal</span>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">On-Time Delivery</h3>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">{staticData.onTimeDelivery}%</span>
          </div>
          <Progress value={staticData.onTimeDelivery} className="h-2.5 rounded-full bg-muted/50" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Target: 95%</span>
            <span>Monthly Goal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
