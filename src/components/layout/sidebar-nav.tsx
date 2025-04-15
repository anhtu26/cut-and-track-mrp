
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { BarChart2, FileText, Home, Package2, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: string[];
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
    allowedRoles: ["Admin", "Management"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    allowedRoles: ["Admin"],
  },
];

export function SidebarNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { user } = useUserStore();
  
  const filteredNavItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role || "")
  );

  return (
    <nav className={cn("flex flex-col gap-1", className)} {...props}>
      {filteredNavItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-accent text-accent-foreground"
                : "transparent text-muted-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive
                    ? "text-accent-foreground"
                    : "text-muted-foreground group-hover:text-accent-foreground"
                )}
              />
              <span>{item.title}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
