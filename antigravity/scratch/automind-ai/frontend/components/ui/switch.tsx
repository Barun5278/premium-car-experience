"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING_TRANSITION } from "@/lib/motion";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  accent?: "cyan" | "crimson" | "gold";
  className?: string;
}

export const Switch = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  accent = "cyan",
  className,
}: SwitchProps) => {
  const accentActiveClasses = {
    cyan: "bg-cyan-500 shadow-[0_0_12px_rgba(0,240,255,0.4)]",
    crimson: "bg-rose-500 shadow-[0_0_12px_rgba(255,42,84,0.4)]",
    gold: "bg-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.4)]",
  };

  return (
    <label
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-40",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-white/[0.12] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
          checked ? accentActiveClasses[accent] : "bg-[#0E1420]"
        )}
      >
        <motion.span
          layout
          transition={SPRING_TRANSITION}
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm mt-0.5 ml-0.5",
            checked ? "translate-x-5 bg-black" : "translate-x-0 bg-slate-300"
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-slate-200">{label}</span>
          )}
          {description && (
            <span className="text-xs text-slate-400 font-normal">{description}</span>
          )}
        </div>
      )}
    </label>
  );
};
