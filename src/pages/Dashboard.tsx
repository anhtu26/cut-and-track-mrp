
import { KPIMetrics } from "@/components/dashboard/kpi-metrics";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockKpiData, mockWorkOrders } from "@/data/mock-data";
import { useUserStore } from "@/stores/user-store";
import { WorkOrder } from "@/types/work-order";

export default function Dashboard() {
  const { user } = useUserStore();
  // Explicitly cast mockWorkOrders to WorkOrder[] to ensure type compatibility
  const recentOrders = (mockWorkOrders as unknown as WorkOrder[]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Performance Overview</h2>
        <KPIMetrics 
          activeJobs={mockKpiData.activeJobs}
          completedThisMonth={mockKpiData.completedThisMonth}
          utilization={mockKpiData.utilization}
          monthlyRevenue={mockKpiData.monthlyRevenue}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Work Orders</h2>
        <RecentOrdersTable orders={recentOrders} />
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Due Dates</CardTitle>
            <CardDescription>Work orders due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(mockWorkOrders as unknown as WorkOrder[])
                .filter(wo => {
                  const dueDate = new Date(wo.dueDate);
                  const today = new Date();
                  const inNextWeek = new Date();
                  inNextWeek.setDate(today.getDate() + 7);
                  return dueDate >= today && dueDate <= inNextWeek && wo.status !== "Complete" && wo.status !== "Shipped";
                })
                .map(wo => (
                  <li key={wo.id} className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">{wo.workOrderNumber}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(wo.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        {user?.role === "Admin" || user?.role === "Management" ? (
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>By order volume this year</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(mockWorkOrders as unknown as WorkOrder[])
                  .reduce((acc, wo) => {
                    const existing = acc.find(c => c.id === wo.customer.id);
                    if (existing) {
                      existing.count += 1;
                    } else {
                      acc.push({ id: wo.customer.id, name: wo.customer.name, count: 1 });
                    }
                    return acc;
                  }, [] as { id: string, name: string, count: number }[])
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((customer, i) => (
                    <li key={customer.id} className="flex items-center justify-between border-b pb-2">
                      <span>{i + 1}. {customer.name}</span>
                      <span className="text-sm font-medium">{customer.count} orders</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Assigned Jobs</CardTitle>
              <CardDescription>Work orders assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <ul className="space-y-2">
                  {(mockWorkOrders as unknown as WorkOrder[])
                    .filter(wo => wo.assignedTo?.id === user.id)
                    .map(wo => (
                      <li key={wo.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <span className="font-medium">{wo.workOrderNumber}</span>
                          <span className="text-xs block text-muted-foreground">{wo.part.name}</span>
                        </div>
                        <span className="text-sm">{wo.status}</span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No assigned jobs
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
