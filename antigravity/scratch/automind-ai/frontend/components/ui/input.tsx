"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcutBadge?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      shortcutBadge,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            disabled={disabled}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-md border border-white/[0.10] bg-[#0A0E17] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500",
              "transition-all duration-200 focus:border-cyan-400 focus:bg-[#0D131F] focus:outline-none focus:ring-1 focus:ring-cyan-400/40",
              "disabled:cursor-not-allowed disabled:opacity-40",
              leftIcon && "pl-10",
              (rightIcon || shortcutBadge) && "pr-12",
              error && "border-rose-500/80 focus:border-rose-400 focus:ring-rose-500/40",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}

          {shortcutBadge && !rightIcon && (
            <div className="absolute right-2.5 pointer-events-none">
              <kbd className="rounded border border-white/[0.12] bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400">
                {shortcutBadge}
              </kbd>
            </div>
          )}
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

Input.displayName = "Input";
