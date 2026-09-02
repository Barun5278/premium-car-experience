"use client";

import React, { HTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const alertVariants = cva(
  "relative flex items-start gap-3 rounded-md p-4 text-sm border transition-all",
  {
    variants: {
      variant: {
        info: "bg-cyan-950/40 border-cyan-500/30 text-cyan-200 [&>svg]:text-cyan-400",
        warning: "bg-amber-950/40 border-amber-500/30 text-amber-200 [&>svg]:text-amber-400",
        error: "bg-rose-950/40 border-rose-500/30 text-rose-200 [&>svg]:text-rose-400",
        success: "bg-emerald-950/40 border-emerald-500/30 text-emerald-200 [&>svg]:text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  onDismiss?: () => void;
  actionSlot?: React.ReactNode;
}

export const Alert = ({
  className,
  variant = "info",
  title,
  children,
  onDismiss,
  actionSlot,
  ...props
}: AlertProps) => {
  const Icon = {
    info: Info,
    warning: TriangleAlert,
    error: AlertCircle,
    success: CheckCircle2,
  }[variant || "info"];

  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        {title && (
          <h5 className="font-mono text-xs uppercase tracking-wider font-semibold">
            {title}
          </h5>
        )}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
        {actionSlot && <div className="pt-2">{actionSlot}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 -mr-1"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
