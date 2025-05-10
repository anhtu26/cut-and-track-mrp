
import React from "react";
import { Card } from "@/components/ui/card";
import { KPIMetrics } from "@/components/dashboard/kpi-metrics";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/auth-provider";

export default function Dashboard() {
  const { user } = useAuthContext();

  const { data: workOrders = [], isLoading: isWorkOrdersLoading } = useQuery({
    queryKey: ["recentWorkOrders"],
    queryFn: async () => {
      try {
        // For development without a backend, use mock data
        if (process.env.NODE_ENV === 'development') {
          return await apiClient.mock.getRecentWorkOrders();
        }
        
        // For production with local backend
        const { data, error } = await apiClient.workOrders.getRecent(5);
        
        if (error) throw error;
        console.log("Fetched work orders:", data);
        return data || [];
      } catch (error) {
        console.error("Error fetching work orders:", error);
        return [];
      }
    },
  });

  // Top parts - using local API client
  const { data: topParts = [], isLoading: isPartsLoading } = useQuery({
    queryKey: ["topParts"],
    queryFn: async () => {
      try {
        // Using mock data for development/demonstration purposes
        return await apiClient.mock.getTopParts();
      } catch (error) {
        console.error("Error fetching top parts:", error);
        return [];
      }
    },
  });

  // Top customers - using local API client
  const { data: topCustomers = [], isLoading: isCustomersLoading } = useQuery({
    queryKey: ["topCustomers"],
    queryFn: async () => {
      try {
        // Using mock data for development/demonstration purposes
        return await apiClient.mock.getTopCustomers();
      } catch (error) {
        console.error("Error fetching top customers:", error);
        return [];
      }
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
