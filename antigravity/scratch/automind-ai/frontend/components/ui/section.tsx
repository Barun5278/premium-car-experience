import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./typography";

// Section Wrapper
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "md" | "lg";
  withBorder?: boolean;
}

export const Section = ({
  className,
  spacing = "md",
  withBorder = false,
  children,
  ...props
}: SectionProps) => {
  const spacingMap = {
    sm: "py-10 md:py-14",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
  };

  return (
    <section
      className={cn(
        spacingMap[spacing],
        withBorder && "border-b border-white/[0.06]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};

// Section Header
export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  eyebrowAccent?: "cyan" | "crimson" | "gold" | "slate";
  title: string;
  description?: string;
  align?: "left" | "center" | "between";
  actionSlot?: React.ReactNode;
}

export const SectionHeader = ({
  className,
  eyebrow,
  eyebrowAccent = "cyan",
  title,
  description,
  align = "left",
  actionSlot,
  ...props
}: SectionHeaderProps) => {
  if (align === "between") {
    return (
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12",
          className
        )}
        {...props}
      >
        <div className="space-y-2 max-w-2xl">
          {eyebrow && (
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              {eyebrow}
            </div>
          )}
          <Heading level="h2" className="text-2xl sm:text-3xl font-bold">
            {title}
          </Heading>
          {description && (
            <p className="text-sm sm:text-base text-slate-400 font-normal">
              {description}
            </p>
          )}
        </div>
        {actionSlot && <div className="flex-shrink-0">{actionSlot}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-3 mb-8 sm:mb-12",
        align === "center" && "text-center max-w-3xl mx-auto",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <div
          className={cn(
            "flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold",
            align === "center" ? "justify-center" : "",
            eyebrowAccent === "cyan" && "text-cyan-400",
            eyebrowAccent === "crimson" && "text-rose-400",
            eyebrowAccent === "gold" && "text-amber-400",
            eyebrowAccent === "slate" && "text-slate-400"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {eyebrow}
        </div>
      )}
      <Heading level="h2" className="text-2xl sm:text-3xl font-bold">
        {title}
      </Heading>
      {description && (
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
          {description}
        </p>
      )}
      {actionSlot && <div className="pt-2">{actionSlot}</div>}
    </div>
  );
};

// Layout Grid
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

export const Grid = ({
  className,
  cols = 3,
  gap = "md",
  children,
  ...props
}: GridProps) => {
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const gapMap = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div className={cn("grid", colsMap[cols], gapMap[gap], className)} {...props}>
      {children}
    </div>
  );
};
