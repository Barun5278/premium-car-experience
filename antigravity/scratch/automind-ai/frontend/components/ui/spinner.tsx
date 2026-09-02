import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  variant?: "cyan" | "crimson" | "gold" | "white";
}

export const Spinner = ({
  size = "md",
  label,
  variant = "cyan",
  className,
  ...props
}: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
  };

  const variantClasses = {
    cyan: "border-cyan-500/20 border-t-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]",
    crimson: "border-rose-500/20 border-t-rose-400 drop-shadow-[0_0_8px_rgba(255,42,84,0.6)]",
    gold: "border-amber-500/20 border-t-amber-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]",
    white: "border-white/20 border-t-white",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center gap-3",
        className
      )}
      {...props}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating HUD Ring */}
        <div
          className={cn(
            "animate-spin rounded-full",
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        {/* Subtle center telemetry beacon */}
        <span className="absolute h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      {label && (
        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
          {label}
        </span>
      )}
    </div>
  );
};
