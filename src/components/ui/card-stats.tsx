
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { HTMLAttributes, ReactNode } from "react";

const cardStatsVariants = cva(
  "rounded-lg border p-4 flex flex-col gap-1",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        primary: "bg-primary text-primary-foreground",
        success: "bg-green-500 text-white",
        warning: "bg-amber-500 text-white",
        danger: "bg-red-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface CardStatsProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string | ReactNode;
  icon?: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export function CardStats({
  title,
  value,
  description,
  icon,
  variant,
  className,
  ...props
}: CardStatsProps) {
  return (
    <div className={cn(cardStatsVariants({ variant }), className)} {...props}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        {icon && <div className="h-5 w-5">{icon}</div>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <div className="text-xs opacity-80 mt-1">{description}</div>
      )}
    </div>
  );
}
