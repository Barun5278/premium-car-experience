"use client";

import React, { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { Heart, Sparkles, Zap, ArrowUpRight, Gauge, Activity, GitCompare } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Button } from "@/components/ui/button";
import { Badge, SpecTag } from "@/components/ui/badge";
import { formatCurrency, formatHP } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface VehicleCardProps {
  vehicle: Vehicle;
  isComparing?: boolean;
  onToggleCompare?: (vehicleId: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isComparing = false,
  onToggleCompare,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fuelVariantMap: Record<string, "cyan" | "emerald" | "gold" | "crimson" | "slate"> = {
    Electric: "cyan",
    "Plug-in Hybrid": "emerald",
    Hybrid: "emerald",
    Petrol: "crimson",
    Diesel: "slate",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between rounded-lg border border-white/[0.08] bg-[#090D15]/90 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_8px_30px_rgba(0,240,255,0.12)]"
    >
      {/* 1. Image Container with Badges & Action Overlays */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-[#060910]">
        {/* Subtle Image Skeleton / Placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
        )}

        <Image
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model} - ${vehicle.variant || ""}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          priority={vehicle.isFeatured}
        />

        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D15] via-transparent to-black/50" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant={fuelVariantMap[vehicle.fuelType] || "cyan"}
              size="sm"
            >
              {vehicle.fuelType}
            </Badge>
            <Badge variant="outline" size="sm">
              {vehicle.bodyType}
            </Badge>
            {vehicle.isFeatured && (
              <Badge variant="gold" size="sm">
                Featured
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            aria-label={isFavorite ? `Remove ${vehicle.model} from favorites` : `Add ${vehicle.model} to favorites`}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#06080C]/80 border border-white/[0.12] text-slate-300 backdrop-blur-md transition-colors hover:border-rose-400 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-transform active:scale-125",
                isFavorite && "fill-rose-500 text-rose-500"
              )}
            />
          </button>
        </div>

        {/* Bottom Image Overlay: Drivetrain / 0-60 Pill */}
        {vehicle.performance?.zeroToSixty && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-xs bg-black/75 px-2 py-0.5 font-mono text-[10px] text-cyan-300 border border-white/[0.08] backdrop-blur-sm">
              <Zap className="h-3 w-3 text-cyan-400" />
              0-60: {vehicle.performance.zeroToSixty}s
            </span>
            <span className="inline-flex items-center rounded-xs bg-black/75 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-white/[0.08] backdrop-blur-sm">
              {vehicle.drivetrain}
            </span>
          </div>
        )}
      </div>

      {/* 2. Vehicle Content & Specs */}
      <div className="flex flex-col flex-1 p-5 space-y-4 justify-between">
        <div className="space-y-2">
          {/* Brand & Year Header */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              {vehicle.brand} • {vehicle.year}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {vehicle.transmission}
            </span>
          </div>

          {/* Model & Variant Title */}
          <NextLink
            href={`/explore/${vehicle.id}`}
            className="block group-hover:text-cyan-300 transition-colors"
          >
            <h3 className="text-xl font-bold tracking-tight text-white line-clamp-1">
              {vehicle.model}{" "}
              {vehicle.variant && (
                <span className="text-sm font-medium text-slate-400 font-sans">
                  {vehicle.variant}
                </span>
              )}
            </h3>
          </NextLink>

          {/* Price Readout */}
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
              {formatCurrency(vehicle.price)}
            </span>
            <span className="font-mono text-[11px] text-slate-400 uppercase">
              MSRP
            </span>
          </div>
        </div>

        {/* Key Telemetry Spec Ribbon */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-md bg-[#06080C]/80 border border-white/[0.05] text-center">
          <div className="space-y-0.5">
            <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">
              POWER
            </span>
            <span className="block font-mono text-xs font-bold text-slate-200">
              {formatHP(vehicle.horsepower)}
            </span>
          </div>

          <div className="space-y-0.5 border-x border-white/[0.06]">
            <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">
              TORQUE
            </span>
            <span className="block font-mono text-xs font-bold text-slate-200">
              {vehicle.torque} lb-ft
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">
              {vehicle.fuelType === "Electric" ? "RANGE" : "EFFICIENCY"}
            </span>
            <span className="block font-mono text-xs font-bold text-cyan-300">
              {vehicle.fuelType === "Electric"
                ? `${vehicle.mileage} mi`
                : `${vehicle.mileage} mpg`}
            </span>
          </div>
        </div>

        {/* 3. Action Buttons: View Details & Compare */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          <NextLink href={`/explore/${vehicle.id}`} className="flex-1">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs uppercase tracking-wider font-semibold"
              rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              View Details
            </Button>
          </NextLink>

          <Button
            variant={isComparing ? "luxury" : "outline"}
            size="sm"
            onClick={() => onToggleCompare?.(vehicle.id)}
            aria-label={`Compare ${vehicle.brand} ${vehicle.model}`}
            className={cn(
              "px-3 text-xs",
              isComparing && "border-amber-400 text-amber-300 bg-amber-950/40"
            )}
            leftIcon={<GitCompare className="h-3.5 w-3.5" />}
          >
            {isComparing ? "Added" : "Compare"}
          </Button>
        </div>
      </div>
    </motion.article>
  );
};
