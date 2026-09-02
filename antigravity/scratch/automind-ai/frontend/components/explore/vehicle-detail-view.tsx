"use client";

import React, { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Gauge,
  Sparkles,
  TrendingUp,
  GitCompare,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Fuel,
  Settings,
  Users,
  Box,
  Layers,
  Activity,
  Heart,
  Share2,
} from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Container } from "@/components/ui/container";
import { Heading, Text, Eyebrow, Metric } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge, LiveBadge, SpecTag } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VehicleCard } from "./vehicle-card";
import { formatCurrency, formatHP } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface VehicleDetailViewProps {
  vehicle: Vehicle;
  relatedVehicles: Vehicle[];
}

export const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({
  vehicle,
  relatedVehicles,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(vehicle.image);
  const [isFavorite, setIsFavorite] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* 1. Top Breadcrumb Bar */}
      <section className="border-b border-white/[0.08] bg-[#07090F]/90 backdrop-blur-md py-4">
        <Container size="xl">
          <div className="flex items-center justify-between">
            <NextLink
              href="/explore"
              className="inline-flex items-center gap-2 font-mono text-xs text-slate-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explore Cars
            </NextLink>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.10] bg-[#0B0F17] text-slate-300 hover:text-rose-400 hover:border-rose-400 transition-colors"
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    isFavorite && "fill-rose-500 text-rose-500"
                  )}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    showNotice("Vehicle link copied to clipboard!");
                  }
                }}
                aria-label="Share vehicle"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.10] bg-[#0B0F17] text-slate-300 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Floating Notice Toast */}
      {actionNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 right-6 z-50 rounded-md border border-cyan-400/40 bg-[#090D18]/95 px-4 py-3 text-xs font-mono text-cyan-300 shadow-2xl backdrop-blur-md"
        >
          {actionNotice}
        </motion.div>
      )}

      {/* 2. Main Vehicle Showcase & Hero Header */}
      <Container size="xl" className="pt-8 sm:pt-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Visual Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative h-[300px] sm:h-[420px] lg:h-[480px] w-full rounded-xl border border-white/[0.10] bg-[#060910] overflow-hidden group shadow-2xl">
              <Image
                src={selectedImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge variant="cyan">{vehicle.fuelType}</Badge>
                <Badge variant="outline">{vehicle.bodyType}</Badge>
                {vehicle.isFeatured && <Badge variant="gold">Featured</Badge>}
              </div>

              {/* Bottom Telemetry Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="bg-black/70 px-3 py-1 rounded-sm border border-white/[0.10] backdrop-blur-sm">
                  {vehicle.drivetrain} • {vehicle.engine}
                </span>
                <span className="hidden sm:inline-block bg-black/70 px-3 py-1 rounded-sm border border-white/[0.10] backdrop-blur-sm">
                  VIN: AM-{vehicle.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {vehicle.gallery && vehicle.gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {vehicle.gallery.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    aria-label={`View image ${index + 1}`}
                    className={cn(
                      "relative h-20 w-28 flex-shrink-0 rounded-md overflow-hidden border transition-all cursor-pointer",
                      selectedImage === imgUrl
                        ? "border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                        : "border-white/[0.10] opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Quick Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header info */}
            <div className="space-y-2">
              <Eyebrow accent="cyan">
                {vehicle.brand} • Model Year {vehicle.year}
              </Eyebrow>
              <Heading level="h1" className="text-3xl sm:text-4xl font-extrabold uppercase">
                {vehicle.model}
              </Heading>
              {vehicle.variant && (
                <p className="text-base text-cyan-300 font-medium font-mono">
                  {vehicle.variant}
                </p>
              )}
              <p className="text-sm text-slate-400 leading-relaxed pt-2">
                {vehicle.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-lg border border-white/[0.08] bg-[#090D16] space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                  MSRP Starting Price
                </span>
                <Badge variant="emerald">In Stock</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                  {formatCurrency(vehicle.price)}
                </span>
                <span className="font-mono text-xs text-slate-400 uppercase">
                  {vehicle.currency}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 pt-1">
                Estimated lease from {formatCurrency(Math.round(vehicle.price / 48))}/mo
              </p>
            </div>

            {/* Action Buttons: Compare, Ask AI, Predict Price */}
            <div className="space-y-3 pt-2">
              <NextLink href={`/compare?ids=${vehicle.id}`} className="block w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full uppercase font-bold text-xs shadow-cyan-glow"
                  leftIcon={<GitCompare className="h-4 w-4" />}
                >
                  Compare This Vehicle
                </Button>
              </NextLink>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="glass"
                  size="md"
                  onClick={() =>
                    showNotice(
                      `AutoMind AI Assistant will analyze the ${vehicle.brand} ${vehicle.model} in upcoming feature integration!`
                    )
                  }
                  leftIcon={<Sparkles className="h-4 w-4 text-cyan-400" />}
                  className="text-xs"
                >
                  Ask AI About This Car
                </Button>

                <Button
                  variant="luxury"
                  size="md"
                  onClick={() =>
                    showNotice(
                      `XGBoost Valuation Engine will compute depreciation for this ${vehicle.year} ${vehicle.model} in upcoming feature integration!`
                    )
                  }
                  leftIcon={<TrendingUp className="h-4 w-4" />}
                  className="text-xs"
                >
                  Predict Its Value
                </Button>
              </div>
            </div>

            {/* Quick Spec Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-md bg-[#080C14] border border-white/[0.06] space-y-1">
                <span className="font-mono text-[10px] uppercase text-slate-400">
                  ACCELERATION
                </span>
                <p className="font-mono text-lg font-bold text-white">
                  {vehicle.performance?.zeroToSixty ? `${vehicle.performance.zeroToSixty}s` : "N/A"}
                </p>
                <span className="text-[10px] text-cyan-400 font-mono">0-60 MPH</span>
              </div>

              <div className="p-3 rounded-md bg-[#080C14] border border-white/[0.06] space-y-1">
                <span className="font-mono text-[10px] uppercase text-slate-400">
                  MAX POWER
                </span>
                <p className="font-mono text-lg font-bold text-white">
                  {formatHP(vehicle.horsepower)}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">{vehicle.torque} lb-ft</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Comprehensive Specifications Matrix */}
        <section className="space-y-6 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow accent="cyan">Technical Telemetry</Eyebrow>
              <Heading level="h2" className="text-2xl font-bold">
                Detailed Specifications
              </Heading>
            </div>
            <Badge variant="outline">Verified OEM Data</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Powertrain Card */}
            <Card variant="telemetry" padding="md" className="space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono text-xs uppercase font-bold text-white">
                  POWERTRAIN
                </span>
                <Zap className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Engine / Propulsion</span>
                  <span className="font-mono text-white text-right max-w-[140px] truncate">
                    {vehicle.engine}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Horsepower</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {formatHP(vehicle.horsepower)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Torque</span>
                  <span className="font-mono text-white">{vehicle.torque} lb-ft</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Drivetrain</span>
                  <span className="font-mono text-white">{vehicle.drivetrain}</span>
                </div>
              </div>
            </Card>

            {/* Performance Card */}
            <Card variant="telemetry" padding="md" className="space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono text-xs uppercase font-bold text-white">
                  PERFORMANCE
                </span>
                <Gauge className="h-4 w-4 text-rose-400" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">0-60 MPH</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {vehicle.performance?.zeroToSixty ? `${vehicle.performance.zeroToSixty}s` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Top Speed</span>
                  <span className="font-mono text-white">
                    {vehicle.performance?.topSpeed ? `${vehicle.performance.topSpeed} mph` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Transmission</span>
                  <span className="font-mono text-white">{vehicle.transmission}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Efficiency / Range</span>
                  <span className="font-mono text-cyan-300">
                    {vehicle.fuelType === "Electric" ? `${vehicle.mileage} mi` : `${vehicle.mileage} mpg`}
                  </span>
                </div>
              </div>
            </Card>

            {/* Dimensions & Utility Card */}
            <Card variant="telemetry" padding="md" className="space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono text-xs uppercase font-bold text-white">
                  DIMENSIONS & UTILITY
                </span>
                <Box className="h-4 w-4 text-amber-400" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Length × Width</span>
                  <span className="font-mono text-white">
                    {vehicle.dimensions.length} × {vehicle.dimensions.width} mm
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Height</span>
                  <span className="font-mono text-white">{vehicle.dimensions.height} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Wheelbase</span>
                  <span className="font-mono text-white">{vehicle.dimensions.wheelbase} mm</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Boot Space</span>
                  <span className="font-mono text-white">{vehicle.bootSpace} Liters</span>
                </div>
              </div>
            </Card>

            {/* Safety & Seating Card */}
            <Card variant="telemetry" padding="md" className="space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono text-xs uppercase font-bold text-white">
                  SAFETY & CABIN
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Seating Capacity</span>
                  <span className="font-mono text-white">{vehicle.seating} Adults</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Safety Rating</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ★ {vehicle.safetyRating.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Body Style</span>
                  <span className="font-mono text-white">{vehicle.bodyType}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Currency</span>
                  <span className="font-mono text-white">{vehicle.currency}</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 4. Standard Features & Equipment */}
        {vehicle.features && vehicle.features.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-white/[0.08]">
            <div className="space-y-1">
              <Eyebrow accent="gold">Factory Equipment</Eyebrow>
              <Heading level="h2" className="text-2xl font-bold">
                Standard Features & Technology
              </Heading>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {vehicle.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-md border border-white/[0.06] bg-[#090D16]/80 text-xs text-slate-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Related Vehicles Section */}
        {relatedVehicles.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Eyebrow accent="cyan">Similar Machines</Eyebrow>
                <Heading level="h2" className="text-2xl font-bold">
                  You May Also Consider
                </Heading>
              </div>
              <NextLink href="/explore">
                <Button variant="ghost" size="sm" className="text-xs">
                  View Full Fleet
                </Button>
              </NextLink>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedVehicles.map((relCar) => (
                <VehicleCard key={relCar.id} vehicle={relCar} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};
