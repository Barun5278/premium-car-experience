import React, { HTMLAttributes } from "react";
import { Gauge, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading } from "./typography";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionSlot?: React.ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionSlot,
  className,
  ...props
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-lg border border-white/[0.06] bg-[#090D15]/60 backdrop-blur-md space-y-4 max-w-xl mx-auto",
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-white/[0.08] text-cyan-400">
        {icon || <SearchX className="h-6 w-6" />}
      </div>

      <div className="space-y-1.5">
        <Heading level="h3" className="text-lg sm:text-xl font-semibold">
          {title}
        </Heading>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionSlot && <div className="pt-2">{actionSlot}</div>}
    </div>
  );
};
