import React from "react";
import { Metadata } from "next";
import { VehicleService } from "@/lib/services/vehicle-service";
import { ExploreView } from "@/components/explore";

// Phase 3.3: revalidate every 60s so the page reads the live HTTP
// repository on subsequent requests rather than serving a one-time
// pre-rendered snapshot.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore Cars | AutoMind AI",
  description:
    "Explore our complete fleet of high-performance, luxury, and electric vehicles with real-time telemetry specs, filtering, and comparison.",
};

export default async function ExplorePage() {
  // Retrieve initial catalog and dynamic facets via VehicleService
  const [vehicles, facets] = await Promise.all([
    VehicleService.getAllCars(),
    VehicleService.getFilterFacets(),
  ]);

  return <ExploreView initialVehicles={vehicles} facets={facets} />;
}
