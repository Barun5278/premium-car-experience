import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleService } from "@/lib/services/vehicle-service";
import { VehicleDetailView } from "@/components/explore";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const vehicles = await VehicleService.getAllCars();
  return vehicles.map((v) => ({
    id: v.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const vehicle = await VehicleService.getCarById(params.id);

  if (!vehicle) {
    return {
      title: "Vehicle Not Found | AutoMind AI",
    };
  }

  return {
    title: `${vehicle.brand} ${vehicle.model} (${vehicle.year}) | AutoMind AI`,
    description: vehicle.description,
    openGraph: {
      title: `${vehicle.brand} ${vehicle.model} - ${vehicle.variant || ""}`,
      description: vehicle.description,
      images: [{ url: vehicle.image }],
    },
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const vehicle = await VehicleService.getCarById(params.id);

  if (!vehicle) {
    notFound();
  }

  // Fetch related vehicles (matching body type or fuel type, excluding current)
  const allVehicles = await VehicleService.getAllCars();
  const relatedVehicles = allVehicles
    .filter(
      (v) =>
        v.id !== vehicle.id &&
        (v.bodyType === vehicle.bodyType || v.brand === vehicle.brand || v.fuelType === vehicle.fuelType)
    )
    .slice(0, 3);

  return (
    <VehicleDetailView
      vehicle={vehicle}
      relatedVehicles={relatedVehicles}
    />
  );
}
