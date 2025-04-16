
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Parts from "./pages/Parts";
import PartDetail from "./pages/PartDetail";
import WorkOrders from "./pages/WorkOrders";
import AddWorkOrder from "./pages/AddWorkOrder";
import EditWorkOrder from "./pages/EditWorkOrder";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import AddOperation from "./pages/AddOperation";
import EditOperation from "./pages/EditOperation";
import OperationDetail from "./pages/OperationDetail";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/app-layout";
import AuthGuard from "./auth-guard";
import AddPart from "./pages/AddPart";
import EditPart from "./pages/EditPart";
import AddCustomer from "./pages/AddCustomer";
import EditCustomer from "./pages/EditCustomer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Parts Routes */}
              <Route path="/parts" element={<Parts />} />
              <Route path="/parts/new" element={<AddPart />} />
              <Route path="/parts/:partId" element={<PartDetail />} />
              <Route path="/parts/:partId/edit" element={<EditPart />} />
              
              {/* Work Orders Routes */}
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/work-orders/new" element={<AddWorkOrder />} />
              <Route path="/work-orders/:workOrderId" element={<WorkOrderDetail />} />
              <Route path="/work-orders/:workOrderId/edit" element={<EditWorkOrder />} />
              
              {/* Operations Routes */}
              <Route path="/work-orders/:workOrderId/operations/new" element={<AddOperation />} />
              <Route path="/work-orders/:workOrderId/operations/:operationId" element={<OperationDetail />} />
              <Route path="/work-orders/:workOrderId/operations/:operationId/edit" element={<EditOperation />} />
              
              {/* Customers Routes */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<AddCustomer />} />
              <Route path="/customers/:customerId" element={<CustomerDetail />} />
              <Route path="/customers/:customerId/edit" element={<EditCustomer />} />
            </Route>
            
            <Route path="/" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
