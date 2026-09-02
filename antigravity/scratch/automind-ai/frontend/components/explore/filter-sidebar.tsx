"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, RotateCcw, Check, Sparkles } from "lucide-react";
import { VehicleBodyType, VehicleFilterOptions, VehicleFuelType, VehicleTransmission } from "@/types/vehicle";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SPRING_TRANSITION } from "@/lib/motion";

export interface FilterSidebarProps {
  filters: VehicleFilterOptions;
  onChange: (filters: VehicleFilterOptions) => void;
  onReset: () => void;
  distinctBrands: string[];
  distinctBodyTypes: string[];
  distinctFuelTypes: string[];
  priceBounds: { min: number; max: number };
  hpBounds: { min: number; max: number };
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeFilterCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  distinctBrands,
  distinctBodyTypes,
  distinctFuelTypes,
  priceBounds,
  hpBounds,
  isMobileOpen,
  onCloseMobile,
  activeFilterCount,
}) => {
  const currentMaxPrice = filters.maxPrice ?? priceBounds.max;
  const currentMinHp = filters.minHorsepower ?? hpBounds.min;

  // Filter content markup reusable between desktop and mobile drawer
  const filterContent = (
    <div className="space-y-6">
      {/* Header: Title & Reset Button */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-cyan-400" />
          <h3 className="font-mono text-sm uppercase tracking-wider font-bold text-white">
            FILTERS
          </h3>
          {activeFilterCount > 0 && (
            <Badge variant="cyan" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 font-mono text-xs text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset All
          </button>
        )}
      </div>

      {/* 1. Body Type */}
      <div className="space-y-2.5">
        <label className="block font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Body Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...filters, bodyType: undefined })}
            className={cn(
              "px-2.5 py-1 rounded-sm text-xs font-mono transition-colors",
              !filters.bodyType
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                : "bg-slate-900/80 text-slate-400 border border-white/[0.08] hover:border-white/[0.2] hover:text-white"
            )}
          >
            All
          </button>
          {distinctBodyTypes.map((type) => {
            const isSelected = filters.bodyType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    bodyType: isSelected ? undefined : (type as VehicleBodyType),
                  })
                }
                className={cn(
                  "px-2.5 py-1 rounded-sm text-xs font-mono transition-colors",
                  isSelected
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : "bg-slate-900/80 text-slate-400 border border-white/[0.08] hover:border-white/[0.2] hover:text-white"
                )}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Fuel Type */}
      <div className="space-y-2.5">
        <label className="block font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Fuel & Propulsion
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...filters, fuelType: undefined })}
            className={cn(
              "px-2.5 py-1 rounded-sm text-xs font-mono transition-colors",
              !filters.fuelType
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                : "bg-slate-900/80 text-slate-400 border border-white/[0.08] hover:border-white/[0.2] hover:text-white"
            )}
          >
            All
          </button>
          {distinctFuelTypes.map((fuel) => {
            const isSelected = filters.fuelType === fuel;
            return (
              <button
                key={fuel}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    fuelType: isSelected ? undefined : (fuel as VehicleFuelType),
                  })
                }
                className={cn(
                  "px-2.5 py-1 rounded-sm text-xs font-mono transition-colors",
                  isSelected
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : "bg-slate-900/80 text-slate-400 border border-white/[0.08] hover:border-white/[0.2] hover:text-white"
                )}
              >
                {fuel}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Brand Selector */}
      <div className="space-y-2.5">
        <label className="block font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Brand
        </label>
        <select
          value={filters.brand || "All"}
          onChange={(e) =>
            onChange({
              ...filters,
              brand: e.target.value === "All" ? undefined : e.target.value,
            })
          }
          className="w-full h-10 rounded-md border border-white/[0.10] bg-[#0A0E17] px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
        >
          <option value="All">All Brands ({distinctBrands.length})</option>
          {distinctBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Transmission */}
      <div className="space-y-2.5">
        <label className="block font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Transmission
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {["All", "Automatic", "Dual-Clutch", "Manual", "Direct-Drive"].map((t) => {
            const isSelected =
              t === "All" ? !filters.transmission : filters.transmission === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    transmission:
                      t === "All" ? undefined : (t as VehicleTransmission),
                  })
                }
                className={cn(
                  "px-2 py-1.5 rounded-sm text-xs font-mono text-center transition-colors border",
                  isSelected
                    ? "bg-[#0F1829] border-cyan-400/50 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                    : "bg-[#0A0E17] border-white/[0.06] text-slate-400 hover:text-white"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Price Range Slider */}
      <div className="space-y-3 pt-2 border-t border-white/[0.06]">
        <Slider
          label="Max Budget"
          min={priceBounds.min}
          max={priceBounds.max}
          step={5000}
          value={currentMaxPrice}
          onChange={(val) => onChange({ ...filters, maxPrice: val })}
          formatValue={(val) => formatCurrency(val)}
        />
      </div>

      {/* 6. Minimum Horsepower */}
      <div className="space-y-3 pt-2 border-t border-white/[0.06]">
        <Slider
          label="Min Horsepower"
          min={hpBounds.min}
          max={hpBounds.max}
          step={25}
          value={currentMinHp}
          onChange={(val) => onChange({ ...filters, minHorsepower: val })}
          unit="HP"
        />
      </div>

      {/* 7. Featured Filter */}
      <div className="pt-2 border-t border-white/[0.06]">
        <label className="flex items-center justify-between cursor-pointer p-2 rounded-md bg-[#0A0E17] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
          <span className="font-mono text-xs text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Featured Showcases Only
          </span>
          <input
            type="checkbox"
            checked={Boolean(filters.isFeatured)}
            onChange={(e) =>
              onChange({
                ...filters,
                isFeatured: e.target.checked ? true : undefined,
              })
            }
            className="rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-400 h-4 w-4"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 rounded-lg border border-white/[0.08] bg-[#090D15]/80 backdrop-blur-md p-5 shadow-lg">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer / Modal */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING_TRANSITION}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#080C14] border-l border-white/[0.10] p-6 shadow-2xl overflow-y-auto lg:hidden flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.10]">
                  <h3 className="font-mono text-base font-bold uppercase text-white">
                    Filter Vehicles
                  </h3>
                  <button
                    type="button"
                    onClick={onCloseMobile}
                    className="p-1 rounded-sm text-slate-400 hover:text-white"
                    aria-label="Close filters drawer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {filterContent}
              </div>

              <div className="pt-6 border-t border-white/[0.08] mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onCloseMobile}
                  className="w-full uppercase font-bold text-xs"
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
