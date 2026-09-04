"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import { VehicleSortOption } from "@/types/vehicle";

export interface SortSelectProps {
  value: VehicleSortOption;
  onChange: (value: VehicleSortOption) => void;
}

export const SORT_OPTIONS: { label: string; value: VehicleSortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "year_desc" },
  { label: "Highest Horsepower", value: "horsepower_desc" },
  { label: "Name: A to Z", value: "name_asc" },
];

export const SortSelect: React.FC<SortSelectProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-slate-400 uppercase tracking-wider">
        <ArrowUpDown className="h-3 w-3 text-cyan-400" />
        Sort:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as VehicleSortOption)}
        aria-label="Sort vehicles"
        className="h-10 rounded-md border border-white/[0.10] bg-[#0A0E17] px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
