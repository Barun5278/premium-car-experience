/**
 * AutoMind AI — Phase 3.1: Backend → Frontend Adapter
 *
 * Translates the FastAPI `CarResponse` JSON shape (the contract returned by
 * `GET /api/v1/cars`, `/cars/{id}`, `/cars/featured`, etc.) into the
 * existing frontend `Vehicle` interface used by every UI component.
 *
 * Why this file exists
 * --------------------
 * The backend returns data normalized across 11 tables (vehicles,
 * vehicle_specs, vehicle_performance, vehicle_dimensions, vehicle_media,
 * vehicle_hotspots, vehicle_features, vehicle_categories, brands,
 * categories, features). The frontend UI was built against a denormalized,
 * top-level `Vehicle` object with fields like `vehicle.brand`,
 * `vehicle.horsepower`, `vehicle.dimensions.length`, etc.
 *
 * This adapter is the single seam where the backend shape is mapped to the
 * frontend contract. Nothing else in the codebase needs to change.
 *
 * Strict rules
 * ------------
 * - No data is invented. Optional fields on the backend stay `undefined`
 *   on the frontend.
 * - Field names are translated; values are passed through as-is.
 * - The mapper is pure: no I/O, no logging, no error throwing on missing
 *   fields (returns best-effort `Vehicle`).
 * - Safe to call from both server and client components.
 */

import type {
  Vehicle,
  VehicleBodyType,
  VehicleDimensions,
  VehicleDrivetrain,
  VehicleFuelType,
  VehiclePerformance,
  VehicleTransmission,
  VehicleComparisonResult,
} from "../../types/vehicle";

// ---------------------------------------------------------------------------
// Backend types — mirror CarResponse from
// backend/app/schemas/car.py and CompareResponse / CompareMatrixRowSchema.
// Defined inline (not imported) because the existing lib/api/client.ts
// uses the OLD Car shape and we want a clean, accurate representation
// without coupling to that file.
// ---------------------------------------------------------------------------

export type BackendFuelType =
  | "Electric"
  | "Hybrid"
  | "Plug-in Hybrid"
  | "Petrol"
  | "Diesel";

export type BackendBodyType =
  | "Sedan"
  | "SUV"
  | "Hatchback"
  | "Coupe"
  | "Hypercar"
  | "Sports"
  | "Convertible"
  | "Crossover";

export type BackendTransmission =
  | "Automatic"
  | "Manual"
  | "Dual-Clutch"
  | "Direct-Drive"
  | "Single-Speed";

export type BackendDrivetrain = "AWD" | "RWD" | "FWD";

/** Mirrors backend's `CarSpecsSchema` (camelCased by Pydantic alias). */
export interface BackendCarSpecs {
  horsepower: number;
  torque: number;
  zeroToSixty: number;
  topSpeed: number;
  rangeOrMpg: string;
  engine?: string | null;
  batteryCapacity?: number | null;
  curbWeight: number;
}

/** Mirrors backend's `CarMediaSchema` (camelCased). */
export interface BackendHotspot {
  id: string;
  label: string;
  position: number[];
  description: string;
}

export interface BackendCarMedia {
  thumbnailUrl: string;
  galleryUrls: string[];
  model3dUrl?: string | null;
  hotspots?: BackendHotspot[] | null;
}

/** Mirrors backend's `ExtendedVehicleInfo` (camelCased). */
export interface BackendDimensions {
  length_mm?: number | null;
  width_mm?: number | null;
  height_mm?: number | null;
  wheelbase_mm?: number | null;
  curb_weight_kg?: number | null;
}

export interface BackendExtended {
  safetyRating?: number | null;
  seating?: number | null;
  mileage?: number | null;
  bootSpaceLiters?: number | null;
  engine?: string | null;
  dimensions?: BackendDimensions | null;
  featureNames?: string[] | null;
  categorySlugs?: string[] | null;
  year?: number | null;
  currency?: string | null;
  isFeatured?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Mirrors backend's `CarResponse` (camelCased JSON). */
export interface BackendCar {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  bodyType: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  price: number;
  specs: BackendCarSpecs;
  media: BackendCarMedia;
  description: string;
  highlights: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  extended?: BackendExtended | null;
}

/** Mirrors backend's `CarListResponse` envelope. */
export interface BackendPaginatedCars {
  items: BackendCar[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Mirrors backend's `CompareMatrixRowSchema`. */
export interface BackendCompareMatrixRow {
  category: string;
  attribute: string;
  values: Record<string, unknown>;
  winnerVehicleId?: string | null;
}

/** Mirrors backend's `CompareResponse`. */
export interface BackendCompareResponse {
  cars: BackendCar[];
  comparisonMatrix: BackendCompareMatrixRow[];
}

// ---------------------------------------------------------------------------
// Narrowing helpers
// ---------------------------------------------------------------------------

function isBackendFuelType(v: string): v is BackendFuelType {
  return (
    v === "Electric" ||
    v === "Hybrid" ||
    v === "Plug-in Hybrid" ||
    v === "Petrol" ||
    v === "Diesel"
  );
}

function isBackendBodyType(v: string): v is BackendBodyType {
  return (
    v === "Sedan" ||
    v === "SUV" ||
    v === "Hatchback" ||
    v === "Coupe" ||
    v === "Hypercar" ||
    v === "Sports" ||
    v === "Convertible" ||
    v === "Crossover"
  );
}

function isBackendTransmission(v: string): v is BackendTransmission {
  return (
    v === "Automatic" ||
    v === "Manual" ||
    v === "Dual-Clutch" ||
    v === "Direct-Drive" ||
    v === "Single-Speed"
  );
}

function isBackendDrivetrain(v: string): v is BackendDrivetrain {
  return v === "AWD" || v === "RWD" || v === "FWD";
}

/** Safe int — clamps to integer, defaults to 0 for null/NaN. */
function toInt(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/** Safe int with fallback to a default (used for required fields). */
function toIntOr(v: unknown, fallback: number): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/** Safe float — defaults to 0 for null/NaN. */
function toFloat(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Safe float with fallback. */
function toFloatOr(v: unknown, fallback: number): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Safe string — defaults to "" for null/undefined. */
function toStr(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

// ---------------------------------------------------------------------------
// Single-vehicle mapper
// ---------------------------------------------------------------------------

/**
 * Convert one backend `CarResponse` into one frontend `Vehicle`.
 *
 * Strict — never throws on missing fields. The backend's data layer
 * guarantees all NOT-NULL fields, so this should always succeed. If a
 * field is missing (which would indicate a schema drift), we use a safe
 * default rather than crashing the page.
 */
export function toVehicle(api: BackendCar): Vehicle {
  const ext = api.extended ?? {};
  const dimsSrc = ext.dimensions ?? {};
  const specs = api.specs ?? ({} as BackendCarSpecs);

  // Narrow the string enums with safe fallbacks.
  const fuelType: VehicleFuelType = isBackendFuelType(api.fuelType)
    ? api.fuelType
    : "Petrol";
  const bodyType: VehicleBodyType = isBackendBodyType(api.bodyType)
    ? api.bodyType
    : "Sedan";
  const transmission: VehicleTransmission = isBackendTransmission(api.transmission)
    ? api.transmission
    : "Automatic";
  const drivetrain: VehicleDrivetrain = isBackendDrivetrain(api.drivetrain)
    ? api.drivetrain
    : "RWD";

  // Dimensions — backend uses _mm suffix; frontend contract uses bare names.
  const dimensions: VehicleDimensions = {
    length: toIntOr(dimsSrc.length_mm, 0),
    width: toIntOr(dimsSrc.width_mm, 0),
    height: toIntOr(dimsSrc.height_mm, 0),
    wheelbase: toIntOr(dimsSrc.wheelbase_mm, 0),
  };

  // Performance sub-object — backend has 0-60 and top-speed in `specs`;
  // the optional braking distance and lateral G are not currently surfaced
  // by the backend, so they remain undefined.
  const performance: VehiclePerformance = {
    zeroToSixty: toFloat(specs.zeroToSixty),
    topSpeed: toInt(specs.topSpeed),
  };

  // Engine description — prefer the engine surfaced in extended (canonical
  // for the vehicle row), fall back to specs.engine, finally to "".
  const engine = toStr(ext.engine ?? specs.engine ?? "");

  return {
    id: toStr(api.id),
    brand: toStr(api.make),
    model: toStr(api.model),
    variant: api.trim ?? undefined,
    year: toIntOr(api.year, 0),
    price: toFloat(api.price),
    currency: toStr(ext.currency ?? "USD", "USD"),
    fuelType,
    transmission,
    bodyType,
    drivetrain,
    horsepower: toInt(specs.horsepower),
    torque: toInt(specs.torque),
    mileage: toInt(ext.mileage),
    engine,
    seating: toInt(ext.seating),
    safetyRating: toFloatOr(ext.safetyRating, 0),
    bootSpace: toInt(ext.bootSpaceLiters),
    dimensions,
    performance,
    features: Array.isArray(ext.featureNames) ? [...ext.featureNames] : [],
    image: toStr(api.media?.thumbnailUrl ?? ""),
    gallery: Array.isArray(api.media?.galleryUrls) ? [...api.media.galleryUrls] : [],
    description: toStr(api.description),
    isFeatured: Boolean(api.isFeatured),
    tags: Array.isArray(api.highlights) ? [...api.highlights] : [],
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

/**
 * Convert a list of backend cars. Returns an empty array if `api.items`
 * is missing or empty.
 */
export function toVehicleList(api: BackendPaginatedCars | { items: BackendCar[] }): Vehicle[] {
  if (!api || !Array.isArray(api.items)) return [];
  return api.items.map(toVehicle);
}

// ---------------------------------------------------------------------------
// Comparison mapper
// ---------------------------------------------------------------------------

/**
 * Convert a backend `CompareResponse` into a frontend
 * `VehicleComparisonResult`. The two shapes are nearly identical; the only
 * renaming is `comparisonMatrix` → `specDifferences`.
 */
export function toComparisonResult(api: BackendCompareResponse): VehicleComparisonResult {
  const cars: Vehicle[] = Array.isArray(api?.cars) ? api.cars.map(toVehicle) : [];
  const specDifferences = Array.isArray(api?.comparisonMatrix)
    ? api.comparisonMatrix.map((row) => ({
        category: toStr(row.category),
        attribute: toStr(row.attribute),
        values:
          row.values && typeof row.values === "object"
            ? (row.values as Record<string, string | number>)
            : {},
        winnerVehicleId: row.winnerVehicleId ?? undefined,
      }))
    : [];
  return { vehicles: cars, specDifferences };
}
