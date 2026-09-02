"use client";

import React, { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export const cardVariants = cva(
  "relative rounded-lg transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900/80 border border-white/[0.07] text-slate-100",
        surface:
          "bg-[#0B0F17] border border-white/[0.06] text-slate-100",
        elevated:
          "bg-[#111723] border border-white/[0.10] shadow-glass-elevated text-slate-100",
        glass:
          "glass-surface text-slate-100",
        interactive:
          "glass-surface-interactive cursor-pointer hover:border-cyan-400/40 hover:shadow-[0_4px_24px_rgba(0,240,255,0.10)]",
        telemetry:
          "bg-[#090D14] border border-white/[0.08] relative before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-cyan-500",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "surface",
      padding: "md",
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  withMotion?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, withMotion = false, children, ...props }, ref) => {
    if (withMotion) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(cardVariants({ variant, padding, className }))}
          {...(props as HTMLMotionProps<"div">)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-lg font-semibold tracking-tight text-white", className)}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-slate-400 font-normal leading-relaxed", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("pt-0", className)} {...props} />
);

export const CardFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center pt-4 border-t border-white/[0.06] mt-auto",
      className
    )}
    {...props}
  />
);

// Telemetry Spec Card
export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  statusColor?: "cyan" | "crimson" | "gold" | "emerald";
  trend?: string;
  icon?: React.ReactNode;
}

export const MetricCard = ({
  label,
  value,
  unit,
  statusColor = "cyan",
  trend,
  icon,
  className,
  ...props
}: MetricCardProps) => {
  const statusClasses = {
    cyan: "bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]",
    crimson: "bg-rose-500 shadow-[0_0_8px_rgba(255,42,84,0.8)]",
    gold: "bg-amber-400 shadow-[0_0_8px_rgba(212,175,55,0.8)]",
    emerald: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
  };

  return (
    <Card variant="telemetry" padding="md" className={cn("space-y-3", className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400 text-sm">{icon}</span>}
          <span className={cn("h-2 w-2 rounded-full", statusClasses[statusColor])} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-slate-400">{unit}</span>}
      </div>
      {trend && (
        <p className="font-mono text-[11px] text-slate-400 pt-1 border-t border-white/[0.04]">
          {trend}
        </p>
      )}
    </Card>
  );
};
