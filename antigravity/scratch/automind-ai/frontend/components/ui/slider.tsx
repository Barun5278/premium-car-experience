"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  unit?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      min,
      max,
      step = 1,
      value,
      onChange,
      formatValue,
      unit,
      disabled,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    const displayValue = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ""}`;

    return (
      <div className={cn("w-full space-y-2.5", className)}>
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
              {label}
            </span>
          )}
          <span className="font-mono text-sm font-bold text-cyan-400">
            {displayValue}
          </span>
        </div>

        <div className="relative flex items-center w-full py-1">
          {/* Custom Track Fill */}
          <div
            className="absolute left-0 h-1 bg-cyan-400 rounded-full pointer-events-none z-0"
            style={{ width: `${percentage}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            ref={ref}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full z-10"
            {...props}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-500">
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";
