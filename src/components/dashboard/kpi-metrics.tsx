
import { CardStats } from "@/components/ui/card-stats";
import { Clock, DollarSign, Package, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface KPIMetricsProps {
  activeJobs: number;
  completedThisMonth: number;
  utilization: number;
  monthlyRevenue: number;
}

export function KPIMetrics({
  activeJobs,
  completedThisMonth,
  utilization,
  monthlyRevenue,
}: KPIMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardStats
        title="Active Jobs"
        value={activeJobs}
        description="Currently in progress"
        icon={<Package className="h-5 w-5" />}
      />
      <CardStats
        title="Completed This Month"
        value={completedThisMonth}
        description="Jobs finished & shipped"
        icon={<Clock className="h-5 w-5" />}
      />
      <CardStats
        title="Machine Utilization"
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
        title="Monthly Revenue"
        value={`$${monthlyRevenue.toLocaleString()}`}
        description="April 2025"
        icon={<DollarSign className="h-5 w-5" />}
      />
    </div>
  );
}
