
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/stores/user-store";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIMetrics } from "@/components/dashboard/kpi-metrics";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { WorkOrder } from "@/types/work-order";
import { Customer } from "@/types/customer";

export default function Dashboard() {
  const { user } = useUserStore();

  // Fetch KPI data from Supabase
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["dashboard-kpi"],
    queryFn: async () => {
      // Count of active jobs (work orders that are not Complete or Shipped)
      const { count: activeJobsCount, error: activeJobsError } = await supabase
        .from("work_orders")
        .select('*', { count: 'exact', head: true })
        .neq('status', 'Complete')
        .neq('status', 'Shipped');

      // Count of completed jobs this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: completedThisMonth, error: completedError } = await supabase
        .from("work_orders")
        .select('*', { count: 'exact', head: true })
        .in('status', ['Complete', 'Shipped'])
        .gte('completed_date', firstDayOfMonth);

      if (activeJobsError || completedError) {
        console.error("Error fetching KPI data:", activeJobsError || completedError);
        return {
          activeJobs: 0,
          completedThisMonth: 0,
          utilization: 0,
          monthlyRevenue: 0
        };
      }

      // For now, we'll use placeholder values for utilization and revenue
      // These would typically come from more complex queries or calculations
      return {
        activeJobs: activeJobsCount || 0,
        completedThisMonth: completedThisMonth || 0,
        utilization: 75, // Placeholder
        monthlyRevenue: 100000 // Placeholder
      };
    },
    refetchOnWindowFocus: false,
  });

  // Fetch recent work orders
  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["recent-work-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          id,
          work_order_number,
          status,
          due_date,
          part_id,
          customer_id,
          parts:part_id(name),
          customers:customer_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching work orders:", error);
        return [];
      }

      // Fixed: Properly map the data to match the WorkOrder type
      return data.map(order => ({
        id: order.id,
        workOrderNumber: order.work_order_number,
        status: order.status,
        dueDate: order.due_date,
        part: {
          id: order.part_id,
          name: order.parts && typeof order.parts === 'object' ? order.parts.name : 'Unknown Part'
        },
        customer: {
          id: order.customer_id,
          name: order.customers && typeof order.customers === 'object' ? order.customers.name : 'Unknown Customer'
        } as Customer
      })) as WorkOrder[];
    },
    refetchOnWindowFocus: false,
  });

  // If loading, show loading indicators
  if (kpiLoading && ordersLoading) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Work Orders</h2>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

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
          activeJobs={kpiData?.activeJobs || 0}
          completedThisMonth={kpiData?.completedThisMonth || 0}
          utilization={kpiData?.utilization || 0}
          monthlyRevenue={kpiData?.monthlyRevenue || 0}
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
            {recentOrders.length > 0 ? (
              <ul className="space-y-2">
                {recentOrders
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
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No upcoming due dates
              </p>
            )}
          </CardContent>
        </Card>

        {user?.role === "Admin" || user?.role === "Management" ? (
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>By order volume this year</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">
                Customer data will be available soon
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Assigned Jobs</CardTitle>
              <CardDescription>Work orders assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">
                No assigned jobs
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
