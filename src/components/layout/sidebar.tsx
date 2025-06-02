
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SidebarNav } from "./sidebar-nav";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button 
            variant="secondary" 
            size="icon" 
            className="ml-2 h-10 w-10 rounded-md fixed bottom-4 left-4 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-50"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 pt-6 border-r-0" aria-describedby="sidebar-description">
          <div id="sidebar-description" className="sr-only">Application navigation sidebar</div>
          <div className="flex items-center gap-2 px-4 mb-6">
            <img src="/logo.jpg" alt="CUT & TRACK MRP" className="h-8 w-8 rounded-md" />
            <SheetTitle className="text-lg font-bold m-0">CUT & TRACK MRP</SheetTitle>
          </div>
          <SidebarNav className="px-2" />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden border-r bg-card/50 lg:block overflow-y-auto",
          className
        )}
      >
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-10 px-4 py-3 flex items-center gap-2">
          <img src="/logo.jpg" alt="CUT & TRACK MRP" className="h-8 w-8 rounded-md" />
          <h2 className="text-base font-semibold">CUT & TRACK MRP</h2>
        </div>
        <div className="py-4 px-2">
          <SidebarNav />
        </div>
      </div>
    </>
  );
}
