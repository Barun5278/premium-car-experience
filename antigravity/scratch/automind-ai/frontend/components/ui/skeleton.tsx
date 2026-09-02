import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "pulse" | "shimmer";
}

export const Skeleton = ({
  className,
  variant = "pulse",
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn(
        "rounded-md bg-white/[0.06]",
        variant === "pulse" && "animate-pulse",
        className
      )}
      {...props}
    />
  );
};

// Car Card Skeleton Loader
export const CarCardSkeleton = () => {
  return (
    <Card variant="surface" padding="none" className="overflow-hidden space-y-0">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Skeleton className="h-12 w-full rounded-sm" />
          <Skeleton className="h-12 w-full rounded-sm" />
          <Skeleton className="h-12 w-full rounded-sm" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20 rounded-sm" />
        </div>
      </div>
    </Card>
  );
};

// Telemetry Spec Grid Skeleton
export const SpecGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} variant="telemetry" padding="md" className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-12" />
        </Card>
      ))}
    </div>
  );
};
