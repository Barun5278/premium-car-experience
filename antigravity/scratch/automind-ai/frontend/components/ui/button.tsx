"use client";

import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING_TRANSITION } from "@/lib/motion";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center font-medium transition-colors select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-cyan-500 text-black font-semibold hover:bg-cyan-400 shadow-cyan-glow hover:shadow-cyan-glow-lg border border-cyan-400/30",
        secondary:
          "bg-slate-900/90 text-slate-100 border border-white/[0.08] hover:bg-slate-800 hover:border-white/[0.16]",
        luxury:
          "bg-gradient-to-b from-amber-500/10 to-amber-900/20 text-amber-200 border border-amber-500/40 hover:border-amber-400 hover:shadow-gold-glow",
        crimson:
          "bg-rose-600 text-white font-semibold hover:bg-rose-500 shadow-crimson-glow border border-rose-400/30",
        outline:
          "bg-transparent text-slate-300 border border-white/[0.12] hover:bg-white/[0.04] hover:text-white hover:border-white/[0.24]",
        ghost:
          "bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.05]",
        glass:
          "glass-surface text-slate-200 hover:border-cyan-400/40 hover:text-white",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5 rounded-sm",
        md: "h-10 px-4 text-sm gap-2 rounded-md",
        lg: "h-12 px-6 text-base gap-2.5 rounded-lg",
        xl: "h-14 px-8 text-lg gap-3 rounded-lg font-semibold",
        icon: "h-10 w-10 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
        transition={SPRING_TRANSITION}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...(props as HTMLMotionProps<"button">)}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
