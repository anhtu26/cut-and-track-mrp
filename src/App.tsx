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
import Customers from "./pages/Customers";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/app-layout";
import AuthGuard from "./auth-guard";
import AddPart from "./pages/AddPart";
import EditPart from "./pages/EditPart";

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
              <Route path="/parts" element={<Parts />} />
              <Route path="/parts/new" element={<AddPart />} />
              <Route path="/parts/:partId" element={<PartDetail />} />
              <Route path="/parts/:partId/edit" element={<EditPart />} />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/customers" element={<Customers />} />
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
