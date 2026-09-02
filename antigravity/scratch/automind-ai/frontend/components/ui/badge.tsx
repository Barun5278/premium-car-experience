import React, { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        cyan: "bg-cyan-950/70 text-cyan-300 border border-cyan-500/30",
        crimson: "bg-rose-950/70 text-rose-300 border border-rose-500/30",
        gold: "bg-amber-950/70 text-amber-300 border border-amber-500/30",
        emerald: "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30",
        slate: "bg-slate-800/80 text-slate-300 border border-slate-700/80",
        outline: "bg-transparent text-slate-400 border border-white/[0.12]",
        glass: "glass-surface text-slate-200 border-white/[0.10]",
      },
      size: {
        sm: "px-2 py-0.5 rounded-xs text-[10px]",
        md: "px-2.5 py-1 rounded-sm text-[11px]",
        lg: "px-3 py-1.5 rounded-sm text-xs",
      },
    },
    defaultVariants: {
      variant: "cyan",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, size, children, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
};

// Live Pulsing Beacon Badge
export interface LiveBadgeProps extends HTMLAttributes<HTMLDivElement> {
  color?: "cyan" | "emerald" | "crimson" | "amber";
  label?: string;
}

export const LiveBadge = ({
  color = "cyan",
  label = "Live",
  className,
  ...props
}: LiveBadgeProps) => {
  const dotColors = {
    cyan: "bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.9)]",
    emerald: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]",
    crimson: "bg-rose-500 shadow-[0_0_8px_rgba(255,42,84,0.9)]",
    amber: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-sm bg-slate-900/90 px-2.5 py-1 text-[11px] font-mono font-medium text-slate-300 border border-white/[0.08]",
        className
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            dotColors[color]
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            dotColors[color]
          )}
        />
      </span>
      <span className="uppercase tracking-widest">{label}</span>
    </div>
  );
};

// Spec Tag (for automotive attributes)
export interface SpecTagProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  value?: string | number;
}

export const SpecTag = ({ label, value, className, ...props }: SpecTagProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs bg-[#0F1420] px-2.5 py-1 text-xs font-mono border border-white/[0.07] text-slate-300",
        className
      )}
      {...props}
    >
      <span className="text-slate-400 font-semibold">{label}</span>
      {value !== undefined && (
        <>
          <span className="text-slate-400">:</span>
          <span className="text-white font-medium">{value}</span>
        </>
      )}
    </span>
  );
};
