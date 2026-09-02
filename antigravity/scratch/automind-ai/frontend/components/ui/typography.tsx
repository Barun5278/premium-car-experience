import React, { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Heading Component
export const headingVariants = cva("font-bold text-white tracking-tight", {
  variants: {
    level: {
      h1: "text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase",
      h2: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
      h3: "text-xl sm:text-2xl font-semibold tracking-tight",
      h4: "text-lg sm:text-xl font-semibold",
    },
    intent: {
      default: "text-white",
      cyan: "text-cyan-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]",
      gradient: "bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent",
      gold: "text-amber-300 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]",
    },
  },
  defaultVariants: {
    level: "h2",
    intent: "default",
  },
});

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading = ({
  className,
  level = "h2",
  intent,
  as,
  children,
  ...props
}: HeadingProps) => {
  const Component = as || level || "h2";
  return (
    <Component
      className={cn(headingVariants({ level, intent, className }))}
      {...props}
    >
      {children}
    </Component>
  );
};

// Text Component
export const textVariants = cva("text-slate-300", {
  variants: {
    variant: {
      lead: "text-lg sm:text-xl text-slate-300 leading-relaxed font-normal",
      body: "text-sm sm:text-base text-slate-300 leading-relaxed",
      small: "text-xs sm:text-sm text-slate-400 leading-normal",
      muted: "text-xs text-slate-500 font-normal",
      mono: "font-mono text-xs text-slate-400 tracking-wider",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TextProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
}

export const Text = ({
  className,
  variant,
  as: Component = "p",
  children,
  ...props
}: TextProps) => {
  return (
    <Component className={cn(textVariants({ variant, className }))} {...props}>
      {children}
    </Component>
  );
};

// Eyebrow (Cinematic Technical Label)
export interface EyebrowProps extends HTMLAttributes<HTMLDivElement> {
  accent?: "cyan" | "crimson" | "gold" | "slate";
}

export const Eyebrow = ({
  className,
  accent = "cyan",
  children,
  ...props
}: EyebrowProps) => {
  const accentClasses = {
    cyan: "text-cyan-400 before:bg-cyan-400",
    crimson: "text-rose-400 before:bg-rose-400",
    gold: "text-amber-400 before:bg-amber-400",
    slate: "text-slate-400 before:bg-slate-400",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold",
        accentClasses[accent],
        className
      )}
      {...props}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </div>
  );
};

// Metric (Telemetry Big Stat Display)
export interface MetricProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  unit?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export const Metric = ({
  value,
  label,
  unit,
  change,
  changeType = "neutral",
  className,
  ...props
}: MetricProps) => {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <p className="font-mono text-xs text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-slate-400">{unit}</span>
        )}
      </div>
      {change && (
        <span
          className={cn(
            "inline-block font-mono text-[11px] font-medium",
            changeType === "positive" && "text-emerald-400",
            changeType === "negative" && "text-rose-400",
            changeType === "neutral" && "text-slate-400"
          )}
        >
          {change}
        </span>
      )}
    </div>
  );
};
