/**
 * AutoMind AI — Automotive Domain Data Models
 * Scalable vehicle schema supporting exploration, comparison, ML valuation, and AI reasoning.
 */

export type VehicleBodyType =
  | "Sedan"
  | "SUV"
  | "Hatchback"
  | "Coupe"
  | "Hypercar"
  | "Sports"
  | "Convertible"
  | "Crossover";

export type VehicleFuelType =
  | "Electric"
  | "Hybrid"
  | "Plug-in Hybrid"
  | "Petrol"
  | "Diesel";

export type VehicleTransmission =
  | "Automatic"
  | "Manual"
  | "Dual-Clutch"
  | "Direct-Drive"
  | "Single-Speed";

export type VehicleDrivetrain = "AWD" | "RWD" | "FWD";

export interface VehicleDimensions {
  length: number;    // in mm
  width: number;     // in mm
  height: number;    // in mm
  wheelbase: number; // in mm
}

export interface VehiclePerformance {
  zeroToSixty: number; // in seconds (0-60 mph / 0-100 km/h)
  topSpeed: number;    // in mph
  brakingDistance?: number; // 60-0 mph in feet
  lateralG?: number;   // cornering grip
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  currency: string;
  fuelType: VehicleFuelType;
  transmission: VehicleTransmission;
  bodyType: VehicleBodyType;
  drivetrain: VehicleDrivetrain;
  horsepower: number;
  torque: number; // in lb-ft
  mileage: number; // in miles (range for EV or odometer)
  engine: string;
  seating: number;
  safetyRating: number; // e.g. 5.0
  bootSpace: number; // in Liters
  dimensions: VehicleDimensions;
  performance?: VehiclePerformance;
  features: string[];
  image: string;
  gallery: string[];
  description: string;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleFilterOptions {
  brand?: string;
  bodyType?: VehicleBodyType | VehicleBodyType[];
  fuelType?: VehicleFuelType | VehicleFuelType[];
  transmission?: VehicleTransmission;
  drivetrain?: VehicleDrivetrain;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minHorsepower?: number;
  maxHorsepower?: number;
  minSeating?: number;
  searchQuery?: string;
  isFeatured?: boolean;
}

export type VehicleSortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "year_desc"
  | "year_asc"
  | "horsepower_desc"
  | "mileage_asc"
  | "name_asc";

export interface VehicleComparisonResult {
  vehicles: Vehicle[];
  specDifferences: {
    category: string;
    attribute: string;
    values: Record<string, string | number>;
    winnerVehicleId?: string;
  }[];
}
