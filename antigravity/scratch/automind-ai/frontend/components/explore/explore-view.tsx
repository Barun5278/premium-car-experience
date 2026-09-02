"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, RotateCcw, GitCompare, ArrowRight, Sparkles, Layers } from "lucide-react";
import { Vehicle, VehicleFilterOptions, VehicleSortOption } from "@/types/vehicle";
import { VehicleService } from "@/lib/services/vehicle-service";
import { Container } from "@/components/ui/container";
import { Heading, Text, Eyebrow } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { CarCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { VehicleCard } from "./vehicle-card";
import { SearchBar } from "./search-bar";
import { FilterSidebar } from "./filter-sidebar";
import { SortSelect } from "./sort-select";
import { formatCurrency } from "@/lib/utils";
import NextLink from "next/link";

export interface ExploreViewProps {
  initialVehicles: Vehicle[];
  facets: {
    brands: string[];
    bodyTypes: string[];
    fuelTypes: string[];
    priceRange: { min: number; max: number };
    hpRange: { min: number; max: number };
  };
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialVehicles,
  facets,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<VehicleFilterOptions>({});
  const [sortBy, setSortBy] = useState<VehicleSortOption>("featured");
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(initialVehicles);

  // Active filter count calculator
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brand) count++;
    if (filters.bodyType) count++;
    if (filters.fuelType) count++;
    if (filters.transmission) count++;
    if (filters.maxPrice !== undefined && filters.maxPrice < facets.priceRange.max) count++;
    if (filters.minHorsepower !== undefined && filters.minHorsepower > facets.hpRange.min) count++;
    if (filters.isFeatured) count++;
    return count;
  }, [filters, facets]);

  // Execute Search + Filter + Sort using VehicleService
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const executeQuery = async () => {
      // 1. Apply multi-criteria filters via service
      const combinedFilters: VehicleFilterOptions = {
        ...filters,
        searchQuery: searchQuery || undefined,
      };

      const results = await VehicleService.filterCars(combinedFilters);

      // 2. Apply deterministic sorting
      const sorted = VehicleService.sortCars(results, sortBy);

      if (!isCancelled) {
        setFilteredVehicles(sorted);
        setIsLoading(false);
      }
    };

    // Small debounce for rapid text typing
    const timer = setTimeout(executeQuery, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, filters, sortBy]);

  // Toggle vehicle in compare drawer
  const handleToggleCompare = (id: string) => {
    if (comparingIds.includes(id)) {
      setComparingIds(comparingIds.filter((cid) => cid !== id));
    } else {
      if (comparingIds.length >= 3) {
        // Limit max 3 cars for comparison
        setComparingIds([...comparingIds.slice(1), id]);
      } else {
        setComparingIds([...comparingIds, id]);
      }
    }
  };

  // Reset all filters and search
  const handleResetAll = () => {
    setSearchQuery("");
    setFilters({});
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen pb-28">
      {/* 1. Page Header with Atmospheric Lighting */}
      <section className="relative border-b border-white/[0.08] bg-[#070A12]/90 py-12 sm:py-16 overflow-hidden">
        {/* Ambient Cone Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/12 blur-[100px] rounded-full pointer-events-none" />

        <Container size="xl" className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <Eyebrow accent="cyan">Fleet Catalog</Eyebrow>
              <Heading level="h1" className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
                EXPLORE <span className="text-cyan-400">CARS</span>
              </Heading>
              <Text variant="lead" className="text-slate-400 text-sm sm:text-base">
                Discover machines engineered for every kind of drive. Search, filter specs, and compare telemetry.
              </Text>
            </div>

            <div className="flex items-center gap-3">
              <LiveBadge color="cyan" label="Catalog Online" />
              <Badge variant="outline">{facets.brands.length} Brands Verified</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Main Search & Controls Bar */}
      <section className="sticky top-16 sm:top-20 z-30 border-b border-white/[0.08] bg-[#06080C]/90 backdrop-blur-md py-4">
        <Container size="xl">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                totalMatches={filteredVehicles.length}
              />
            </div>

            {/* Controls: Mobile Filter Button & Sort Select */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant={activeFilterCount > 0 ? "primary" : "secondary"}
                size="md"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-cyan-400">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <SortSelect value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Active Filter Tags */}
          {(activeFilterCount > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-white/[0.05]">
              <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                Active:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 font-mono text-xs text-cyan-300">
                  Search: &quot;{searchQuery}&quot;
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-white"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.brand && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-slate-800/80 border border-white/[0.12] px-2 py-0.5 font-mono text-xs text-slate-200">
                  Brand: {filters.brand}
                  <button
                    onClick={() => setFilters({ ...filters, brand: undefined })}
                    className="hover:text-white"
                    aria-label="Remove brand filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.bodyType && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-slate-800/80 border border-white/[0.12] px-2 py-0.5 font-mono text-xs text-slate-200">
                  Body: {filters.bodyType as string}
                  <button
                    onClick={() => setFilters({ ...filters, bodyType: undefined })}
                    className="hover:text-white"
                    aria-label="Remove body type filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.fuelType && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-slate-800/80 border border-white/[0.12] px-2 py-0.5 font-mono text-xs text-slate-200">
                  Fuel: {filters.fuelType as string}
                  <button
                    onClick={() => setFilters({ ...filters, fuelType: undefined })}
                    className="hover:text-white"
                    aria-label="Remove fuel filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.transmission && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-slate-800/80 border border-white/[0.12] px-2 py-0.5 font-mono text-xs text-slate-200">
                  Transmission: {filters.transmission}
                  <button
                    onClick={() => setFilters({ ...filters, transmission: undefined })}
                    className="hover:text-white"
                    aria-label="Remove transmission filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.maxPrice !== undefined && filters.maxPrice < facets.priceRange.max && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-slate-800/80 border border-white/[0.12] px-2 py-0.5 font-mono text-xs text-slate-200">
                  Under {formatCurrency(filters.maxPrice)}
                  <button
                    onClick={() => setFilters({ ...filters, maxPrice: undefined })}
                    className="hover:text-white"
                    aria-label="Remove price filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.minHorsepower !== undefined && filters.minHorsepower > facets.hpRange.min && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-slate-800/80 border border-white/[0.12] px-2 py-0.5 font-mono text-xs text-slate-200">
                  {filters.minHorsepower}+ HP
                  <button
                    onClick={() => setFilters({ ...filters, minHorsepower: undefined })}
                    className="hover:text-white"
                    aria-label="Remove HP filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetAll}
                className="font-mono text-xs text-cyan-400 hover:underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* 3. Main Exploration Grid & Filter Layout */}
      <Container size="xl" className="pt-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters({})}
            distinctBrands={facets.brands}
            distinctBodyTypes={facets.bodyTypes}
            distinctFuelTypes={facets.fuelTypes}
            priceBounds={facets.priceRange}
            hpBounds={facets.hpRange}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            activeFilterCount={activeFilterCount}
          />

          {/* Vehicle Cards Grid Area */}
          <div className="flex-1 space-y-6">
            {/* Dynamic Result Counter */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
                {filteredVehicles.length}{" "}
                {filteredVehicles.length === 1 ? "MACHINE" : "VEHICLES"} AVAILABLE
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Showing {filteredVehicles.length} of {initialVehicles.length}
              </span>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredVehicles.length > 0 ? (
              /* Vehicle Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isComparing={comparingIds.includes(vehicle.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <EmptyState
                icon={<SlidersHorizontal className="h-7 w-7 text-cyan-400" />}
                title="NO MACHINES FOUND"
                description="We couldn't find any vehicles matching your current search and filter combination. Try adjusting your criteria or clearing filters."
                actionSlot={
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleResetAll}
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                  >
                    Clear Filters
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </Container>

      {/* 4. Floating Comparison Bar (when vehicles are selected) */}
      <AnimatePresence>
        {comparingIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 inset-x-0 z-40 max-w-2xl mx-auto px-4"
          >
            <div className="flex items-center justify-between rounded-lg border border-cyan-400/40 bg-[#080D18]/95 backdrop-blur-lg p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
                  <GitCompare className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    {comparingIds.length} {comparingIds.length === 1 ? "Vehicle" : "Vehicles"} Selected
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Compare technical specs and price matrices
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComparingIds([])}
                  className="font-mono text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Clear
                </button>
                <NextLink href={`/compare?ids=${comparingIds.join(",")}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    className="font-semibold text-xs uppercase tracking-wider"
                  >
                    Compare Now
                  </Button>
                </NextLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
