"use client";

import React, { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options = [], helperText, error, id, children, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full appearance-none rounded-md border border-white/[0.10] bg-[#0A0E17] px-3.5 py-2 pr-10 text-sm text-slate-100",
              "transition-all duration-200 focus:border-cyan-400 focus:bg-[#0D131F] focus:outline-none focus:ring-1 focus:ring-cyan-400/40",
              "disabled:cursor-not-allowed disabled:opacity-40",
              error && "border-rose-500/80 focus:border-rose-400 focus:ring-rose-500/40",
              className
            )}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-[#0A0E17] text-slate-100 py-1"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute right-3 flex items-center text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {error ? (
          <p className="text-xs font-mono text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
