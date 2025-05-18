
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/providers/auth-provider";
import { BarChart2, FileText, Home, Package2, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { UserRole } from "@/hooks/use-auth";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: UserRole[];
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Parts",
    href: "/parts",
    icon: Package2,
  },
  {
    title: "Work Orders",
    href: "/work-orders",
    icon: FileText,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart2,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    allowedRoles: [UserRole.ADMIN],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    allowedRoles: [UserRole.ADMIN],
  },
];

export function SidebarNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { user } = useAuthContext();
  
  const filteredNavItems = navItems.filter(
    (item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
  );

  return (
    <nav className={cn("flex flex-col gap-2 py-2", className)} {...props}>
      {filteredNavItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30",
              isActive
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-muted-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground group-hover:text-primary"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.title}</span>
            </>
          )}
        </NavLink>
      ))}
      
      <div className="mt-6 px-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-medium">ITAR Compliant System</h4>
          <p className="text-xs text-muted-foreground">All data is securely stored on local servers per aerospace regulations.</p>
        </div>
      </div>
    </nav>
  );
}
