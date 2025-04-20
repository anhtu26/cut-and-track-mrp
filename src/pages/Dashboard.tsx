
import React from "react";
import { Card } from "@/components/ui/card";
import { KPIMetrics } from "@/components/dashboard/kpi-metrics";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/auth-provider";

export default function Dashboard() {
  const { user } = useAuthContext();

  const { data: workOrders = [], isLoading: isWorkOrdersLoading } = useQuery({
    queryKey: ["recentWorkOrders"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("work_orders")
          .select("*, customer:customers(*), part:parts(*), operations(*)")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        console.log("Fetched work orders:", data);
        return data || [];
      } catch (error) {
        console.error("Error fetching work orders:", error);
        return [];
      }
    },
  });

  // Mock data for top parts - would come from API in real app
  const { data: topParts = [], isLoading: isPartsLoading } = useQuery({
    queryKey: ["topParts"],
    queryFn: async () => {
      // This would be a real API call in production
      return [
        { name: "Hydraulic Manifold", orderCount: 12 },
        { name: "Precision Shaft", orderCount: 8 },
        { name: "Bearing Housing", orderCount: 7 },
        { name: "Custom Flange", orderCount: 5 }
      ];
    },
  });

  // Mock data for top customers - would come from API in real app
  const { data: topCustomers = [], isLoading: isCustomersLoading } = useQuery({
    queryKey: ["topCustomers"],
    queryFn: async () => {
      // This would be a real API call in production
      return [
        { name: "Airo Defense Systems", orderValue: 28500 },
        { name: "Precision Hydraulics", orderValue: 19200 },
        { name: "TechMach Industries", orderValue: 15800 },
        { name: "Aerospace Specialties", orderValue: 12400 }
      ];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Static KPI metrics component - no props needed */}
      <KPIMetrics />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Parts</h2>
          {isPartsLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {topParts.map((part, index) => (
                <div key={index} className="flex justify-between py-2 border-b last:border-0">
                  <span>{part.name}</span>
                  <span className="font-medium">{part.orderCount} orders</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Customers</h2>
          {isCustomersLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex justify-between py-2 border-b last:border-0">
                  <span>{customer.name}</span>
                  <span className="font-medium">${typeof customer.orderValue === 'number' ? customer.orderValue.toLocaleString() : customer.orderValue}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      
      <RecentOrdersTable orders={workOrders} isLoading={isWorkOrdersLoading} />
    </div>
  );
}
