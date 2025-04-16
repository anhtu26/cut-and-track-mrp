
export type WorkOrderStatus = "Not Started" | "In Progress" | "QC" | "Complete" | "Shipped";
export type WorkOrderPriority = "Low" | "Normal" | "High" | "Critical";

// Badge variant mapping for shadcn/ui Badge component
export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

// Map status to badge variant
export function getStatusBadgeVariant(status: WorkOrderStatus): BadgeVariant {
  switch (status) {
    case "Complete":
      return "secondary"; // Instead of "success" which isn't a valid variant
    case "In Progress":
      return "default";
    case "QC":
      return "outline"; // Instead of "warning" which isn't a valid variant
    case "Shipped":
      return "secondary";
    default:
      return "outline";
  }
}

// Map priority to badge variant
export function getPriorityBadgeVariant(priority: WorkOrderPriority): BadgeVariant {
  switch (priority) {
    case "Critical":
      return "destructive";
    case "High":
      return "outline"; // Instead of "warning" which isn't a valid variant
    case "Normal":
      return "default";
    default:
      return "outline";
  }
}
