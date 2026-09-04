/**
 * Standalone adapter verification (no test framework).
 *
 * Verifies that `frontend/lib/api/adapter.ts` correctly maps a representative
 * backend `CarResponse` payload to the frontend `Vehicle` contract. Run with:
 *
 *   cd frontend
 *   npx tsx --tsconfig tsconfig.json scripts/verify-adapter.ts
 *
 * or, if tsx is not available, compile and run via tsc:
 *
 *   npx tsc --target es2022 --module commonjs --moduleResolution node scripts/verify-adapter.ts
 *   node scripts/verify-adapter.js
 *
 * Exits 0 on success, 1 on failure.
 */

import {
  toVehicle,
  toVehicleList,
  toComparisonResult,
  BackendCar,
  BackendPaginatedCars,
  BackendCompareResponse,
} from "../lib/api/adapter";
import type { Vehicle } from "../types/vehicle";

let failed = 0;
function check(label: string, cond: boolean, detail?: string): void {
  if (cond) {
    console.log(`  [PASS] ${label}`);
  } else {
    failed++;
    console.log(`  [FAIL] ${label}${detail ? ` :: ${detail}` : ""}`);
  }
}

// ---------------------------------------------------------------------------
// 1) Representative backend payload — modelled on Phase 1.5 seed for the
//    Porsche 911 GT3 RS (Porsche brand, Petrol, 2024, $241,300).
// ---------------------------------------------------------------------------
const sampleApiCar: BackendCar = {
  id: "porsche-911-gt3-rs-2024",
  make: "Porsche",
  model: "911 GT3 RS",
  year: 2024,
  trim: "Weissach Package",
  bodyType: "Sports",
  fuelType: "Petrol",
  transmission: "Dual-Clutch",
  drivetrain: "RWD",
  price: 241300,
  specs: {
    horsepower: 518,
    torque: 342,
    zeroToSixty: 3.0,
    topSpeed: 184,
    rangeOrMpg: "18 mpg",
    engine: "4.0L Naturally Aspirated Boxer-6",
    batteryCapacity: null,
    curbWeight: 0,
  },
  media: {
    thumbnailUrl: "https://images.unsplash.com/photo-primary.jpg",
    galleryUrls: [
      "https://images.unsplash.com/photo-primary.jpg",
      "https://images.unsplash.com/photo-secondary.jpg",
    ],
    model3dUrl: null,
    hotspots: null,
  },
  description: "The ultimate track weapon from Stuttgart.",
  highlights: ["Track Focused", "Naturally Aspirated", "Supercar"],
  isFeatured: true,
  createdAt: "2026-09-02T00:00:00Z",
  updatedAt: "2026-09-02T00:00:00Z",
  extended: {
    safetyRating: 5.0,
    seating: 2,
    mileage: 18,
    bootSpaceLiters: 132,
    engine: "4.0L Naturally Aspirated Boxer-6",
    dimensions: {
      length_mm: 4572,
      width_mm: 1900,
      height_mm: 1322,
      wheelbase_mm: 2457,
      curb_weight_kg: null,
    },
    featureNames: [
      "Active Aerodynamics with DRS",
      "Carbon Fiber Front Lid & Roof",
    ],
    categorySlugs: ["sports", "petrol", "track-focused"],
    year: 2024,
    currency: "USD",
    isFeatured: true,
    createdAt: "2026-09-02T00:00:00Z",
    updatedAt: "2026-09-02T00:00:00Z",
  },
};

const v: Vehicle = toVehicle(sampleApiCar);

check("id preserved", v.id === "porsche-911-gt3-rs-2024");
check("make -> brand mapping", v.brand === "Porsche", `got ${v.brand}`);
check("model preserved", v.model === "911 GT3 RS");
check("trim -> variant mapping", v.variant === "Weissach Package");
check("year preserved", v.year === 2024);
check("price preserved", v.price === 241300);
check("currency from extended", v.currency === "USD");
check("fuelType preserved (string enum)", v.fuelType === "Petrol");
check("bodyType preserved", v.bodyType === "Sports");
check("transmission preserved", v.transmission === "Dual-Clutch");
check("drivetrain preserved", v.drivetrain === "RWD");
check("horsepower from specs", v.horsepower === 518);
check("torque from specs", v.torque === 342);
check("mileage from extended", v.mileage === 18);
check("engine from extended", v.engine === "4.0L Naturally Aspirated Boxer-6");
check("seating from extended", v.seating === 2);
check("safetyRating from extended", v.safetyRating === 5.0);
check("bootSpace from extended", v.bootSpace === 132);
check("dimensions.length from extended.dimensions", v.dimensions.length === 4572);
check("dimensions.width from extended.dimensions", v.dimensions.width === 1900);
check("dimensions.height from extended.dimensions", v.dimensions.height === 1322);
check("dimensions.wheelbase from extended.dimensions", v.dimensions.wheelbase === 2457);
check("performance.zeroToSixty from specs", v.performance?.zeroToSixty === 3.0);
check("performance.topSpeed from specs", v.performance?.topSpeed === 184);
check("image from media.thumbnailUrl", v.image === sampleApiCar.media.thumbnailUrl);
check("gallery from media.galleryUrls (length)", v.gallery.length === 2);
check("features from extended.featureNames", v.features.length === 2);
check("isFeatured preserved", v.isFeatured === true);
check("tags from highlights", Array.isArray(v.tags) && v.tags.length === 3);
check("createdAt preserved", v.createdAt === sampleApiCar.createdAt);
check("updatedAt preserved", v.updatedAt === sampleApiCar.updatedAt);

// ---------------------------------------------------------------------------
// 2) Defensive: missing fields don't crash.
// ---------------------------------------------------------------------------
const minimalCar: BackendCar = {
  id: "x",
  make: "Test",
  model: "M",
  year: 2020,
  trim: null,
  bodyType: "Sedan",
  fuelType: "Petrol",
  transmission: "Automatic",
  drivetrain: "RWD",
  price: 0,
  specs: {
    horsepower: 0,
    torque: 0,
    zeroToSixty: 0,
    topSpeed: 0,
    rangeOrMpg: "",
    engine: null,
    batteryCapacity: null,
    curbWeight: 0,
  },
  media: {
    thumbnailUrl: "",
    galleryUrls: [],
    model3dUrl: null,
    hotspots: null,
  },
  description: "",
  highlights: [],
  isFeatured: false,
  createdAt: "",
  updatedAt: "",
  extended: null,
};

const mv = toVehicle(minimalCar);
check("defensive: brand defaults to make", mv.brand === "Test");
check("defensive: variant undefined when null", mv.variant === undefined);
check("defensive: mileage 0 when extended null", mv.mileage === 0);
check("defensive: features empty when extended null", mv.features.length === 0);
check("defensive: gallery empty when media empty", mv.gallery.length === 0);
check("defensive: dimensions all 0 when extended null", mv.dimensions.length === 0);
check("defensive: safetyRating 0 when extended null", mv.safetyRating === 0);

// ---------------------------------------------------------------------------
// 3) toVehicleList — paginated envelope.
// ---------------------------------------------------------------------------
const page: BackendPaginatedCars = {
  items: [sampleApiCar, sampleApiCar],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};
const list = toVehicleList(page);
check("toVehicleList length matches items", list.length === 2);
check("toVehicleList first item has correct brand", list[0].brand === "Porsche");

// Defensive: empty / missing items
check("toVehicleList empty input", toVehicleList({ items: [] }).length === 0);
check(
  "toVehicleList null input",
  // @ts-expect-error testing runtime safety
  toVehicleList(null).length === 0,
);

// ---------------------------------------------------------------------------
// 4) toComparisonResult — backend compare response -> frontend shape.
// ---------------------------------------------------------------------------
const cmp: BackendCompareResponse = {
  cars: [sampleApiCar],
  comparisonMatrix: [
    {
      category: "Performance",
      attribute: "Horsepower",
      values: { "porsche-911-gt3-rs-2024": "518 HP" },
      winnerVehicleId: "porsche-911-gt3-rs-2024",
    },
  ],
};
const cr = toComparisonResult(cmp);
check("toComparisonResult: vehicles length", cr.vehicles.length === 1);
check("toComparisonResult: vehicles[0] is a Vehicle", cr.vehicles[0].brand === "Porsche");
check("toComparisonResult: specDifferences count", cr.specDifferences.length === 1);
check("toComparisonResult: specDifferences[0].attribute", cr.specDifferences[0].attribute === "Horsepower");
check("toComparisonResult: winnerVehicleId preserved", cr.specDifferences[0].winnerVehicleId === "porsche-911-gt3-rs-2024");
check("toComparisonResult: values forwarded", cr.specDifferences[0].values["porsche-911-gt3-rs-2024"] === "518 HP");

// Defensive: empty / missing
const empty = toComparisonResult({ cars: [], comparisonMatrix: [] });
check("toComparisonResult empty: vehicles=0", empty.vehicles.length === 0);
check("toComparisonResult empty: specDifferences=0", empty.specDifferences.length === 0);

console.log("");
if (failed === 0) {
  console.log("ALL ADAPTER CHECKS PASSED");
  process.exit(0);
} else {
  console.log(`${failed} ADAPTER CHECK(S) FAILED`);
  process.exit(1);
}
