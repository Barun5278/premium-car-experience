import {
  Vehicle,
  VehicleFilterOptions,
  VehicleSortOption,
  VehicleComparisonResult,
} from "@/types/vehicle";
import { SEED_VEHICLES } from "@/data/vehicles";

/**
 * Abstract Vehicle Repository Interface
 * Enables seamless swapping between InMemory seed data and PostgreSQL/Supabase/FastAPI
 */
export interface IVehicleRepository {
  getAll(): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
  search(query: string): Promise<Vehicle[]>;
  filter(options: VehicleFilterOptions): Promise<Vehicle[]>;
  getFeatured(): Promise<Vehicle[]>;
  getDistinctBrands(): Promise<string[]>;
  getDistinctBodyTypes(): Promise<string[]>;
  getDistinctFuelTypes(): Promise<string[]>;
  getPriceRange(): Promise<{ min: number; max: number }>;
  getHorsepowerRange(): Promise<{ min: number; max: number }>;
  compare(ids: string[]): Promise<VehicleComparisonResult>;
}

/**
 * In-Memory Vehicle Repository Implementation
 * Fast client-side and SSR repository operating on validated automotive seed dataset
 */
export class InMemoryVehicleRepository implements IVehicleRepository {
  private data: Vehicle[];

  constructor(initialData: Vehicle[] = SEED_VEHICLES) {
    this.data = [...initialData];
  }

  async getAll(): Promise<Vehicle[]> {
    return [...this.data];
  }

  async getById(id: string): Promise<Vehicle | null> {
    const found = this.data.find(
      (v) => v.id.toLowerCase() === id.toLowerCase()
    );
    return found ? { ...found } : null;
  }

  async search(query: string): Promise<Vehicle[]> {
    if (!query || query.trim() === "") {
      return [...this.data];
    }

    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = cleanQuery.split(/\s+/);

    return this.data.filter((vehicle) => {
      const searchableText = [
        vehicle.brand,
        vehicle.model,
        vehicle.variant,
        vehicle.year.toString(),
        vehicle.bodyType,
        vehicle.fuelType,
        vehicle.engine,
        vehicle.description,
        ...(vehicle.features || []),
        ...(vehicle.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return queryTokens.every((token) => searchableText.includes(token));
    });
  }

  async filter(options: VehicleFilterOptions): Promise<Vehicle[]> {
    let result = [...this.data];

    // 1. Search Query
    if (options.searchQuery && options.searchQuery.trim()) {
      result = await this.search(options.searchQuery);
    }

    // 2. Brand
    if (options.brand && options.brand !== "All") {
      result = result.filter(
        (v) => v.brand.toLowerCase() === options.brand!.toLowerCase()
      );
    }

    // 3. Body Type (Single or Multi-select)
    if (options.bodyType) {
      if (Array.isArray(options.bodyType) && options.bodyType.length > 0) {
        const set = new Set(options.bodyType.map((b) => b.toLowerCase()));
        result = result.filter((v) => set.has(v.bodyType.toLowerCase()));
      } else if (typeof options.bodyType === "string") {
        const bt = options.bodyType as string;
        if (bt !== "All") {
          result = result.filter((v) => v.bodyType.toLowerCase() === bt.toLowerCase());
        }
      }
    }

    // 4. Fuel Type
    if (options.fuelType) {
      if (Array.isArray(options.fuelType) && options.fuelType.length > 0) {
        const set = new Set(options.fuelType.map((f) => f.toLowerCase()));
        result = result.filter((v) => set.has(v.fuelType.toLowerCase()));
      } else if (typeof options.fuelType === "string") {
        const ft = options.fuelType as string;
        if (ft !== "All") {
          result = result.filter((v) => v.fuelType.toLowerCase() === ft.toLowerCase());
        }
      }
    }

    // 5. Transmission
    if (options.transmission) {
      result = result.filter(
        (v) => v.transmission.toLowerCase() === options.transmission!.toLowerCase()
      );
    }

    // 6. Drivetrain
    if (options.drivetrain) {
      result = result.filter((v) => v.drivetrain === options.drivetrain);
    }

    // 7. Price Bounds
    if (options.minPrice !== undefined) {
      result = result.filter((v) => v.price >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      result = result.filter((v) => v.price <= options.maxPrice!);
    }

    // 8. Year Bounds
    if (options.minYear !== undefined) {
      result = result.filter((v) => v.year >= options.minYear!);
    }
    if (options.maxYear !== undefined) {
      result = result.filter((v) => v.year <= options.maxYear!);
    }

    // 9. Horsepower Bounds
    if (options.minHorsepower !== undefined) {
      result = result.filter((v) => v.horsepower >= options.minHorsepower!);
    }
    if (options.maxHorsepower !== undefined) {
      result = result.filter((v) => v.horsepower <= options.maxHorsepower!);
    }

    // 10. Seating Capacity
    if (options.minSeating !== undefined) {
      result = result.filter((v) => v.seating >= options.minSeating!);
    }

    // 11. Featured Filter
    if (options.isFeatured !== undefined) {
      result = result.filter((v) => Boolean(v.isFeatured) === options.isFeatured);
    }

    return result;
  }

  async getFeatured(): Promise<Vehicle[]> {
    return this.data.filter((v) => v.isFeatured);
  }

  async getDistinctBrands(): Promise<string[]> {
    const brands = Array.from(new Set(this.data.map((v) => v.brand))).sort();
    return brands;
  }

  async getDistinctBodyTypes(): Promise<string[]> {
    const types = Array.from(new Set(this.data.map((v) => v.bodyType))).sort();
    return types;
  }

  async getDistinctFuelTypes(): Promise<string[]> {
    const fuels = Array.from(new Set(this.data.map((v) => v.fuelType))).sort();
    return fuels;
  }

  async getPriceRange(): Promise<{ min: number; max: number }> {
    const prices = this.data.map((v) => v.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  async getHorsepowerRange(): Promise<{ min: number; max: number }> {
    const hps = this.data.map((v) => v.horsepower);
    return {
      min: Math.min(...hps),
      max: Math.max(...hps),
    };
  }

  async compare(ids: string[]): Promise<VehicleComparisonResult> {
    const vehicles: Vehicle[] = [];
    for (const id of ids) {
      const v = await this.getById(id);
      if (v) vehicles.push(v);
    }

    const specDifferences = [
      {
        category: "Performance",
        attribute: "Horsepower",
        values: Object.fromEntries(vehicles.map((v) => [v.id, `${v.horsepower} HP`])),
        winnerVehicleId: vehicles.reduce((max, v) => (v.horsepower > max.horsepower ? v : max), vehicles[0])?.id,
      },
      {
        category: "Performance",
        attribute: "0-60 MPH Acceleration",
        values: Object.fromEntries(
          vehicles.map((v) => [v.id, v.performance?.zeroToSixty ? `${v.performance.zeroToSixty}s` : "N/A"])
        ),
        winnerVehicleId: vehicles.reduce((fastest, v) => {
          const vTime = v.performance?.zeroToSixty || 99;
          const fTime = fastest.performance?.zeroToSixty || 99;
          return vTime < fTime ? v : fastest;
        }, vehicles[0])?.id,
      },
      {
        category: "Economics",
        attribute: "Starting Price",
        values: Object.fromEntries(
          vehicles.map((v) => [v.id, `$${v.price.toLocaleString()} USD`])
        ),
        winnerVehicleId: vehicles.reduce((cheapest, v) => (v.price < cheapest.price ? v : cheapest), vehicles[0])?.id,
      },
      {
        category: "Powertrain",
        attribute: "Fuel / Propulsion",
        values: Object.fromEntries(vehicles.map((v) => [v.id, v.fuelType])),
      },
      {
        category: "Powertrain",
        attribute: "Drivetrain",
        values: Object.fromEntries(vehicles.map((v) => [v.id, v.drivetrain])),
      },
      {
        category: "Utility",
        attribute: "Seating Capacity",
        values: Object.fromEntries(vehicles.map((v) => [v.id, `${v.seating} Seats`])),
      },
      {
        category: "Utility",
        attribute: "Boot Space",
        values: Object.fromEntries(vehicles.map((v) => [v.id, `${v.bootSpace} Liters`])),
      },
    ];

    return {
      vehicles,
      specDifferences,
    };
  }
}

// Global Repository Singleton Instance
export const vehicleRepository = new InMemoryVehicleRepository();

/**
 * Vehicle Service Layer
 * High-level orchestration for UI controllers and AI / ML data feeds
 */
export class VehicleService {
  private static repository: IVehicleRepository = vehicleRepository;

  /**
   * Inject alternative repository implementation (e.g. Supabase / FastAPI client)
   */
  public static setRepository(repo: IVehicleRepository) {
    this.repository = repo;
  }

  /**
   * Retrieves all vehicles
   */
  public static async getAllCars(): Promise<Vehicle[]> {
    return this.repository.getAll();
  }

  /**
   * Retrieves a single vehicle by unique identifier
   */
  public static async getCarById(id: string): Promise<Vehicle | null> {
    return this.repository.getById(id);
  }

  /**
   * Full-text search across vehicle attributes
   */
  public static async searchCars(query: string): Promise<Vehicle[]> {
    return this.repository.search(query);
  }

  /**
   * Applies multi-criteria filters
   */
  public static async filterCars(filters: VehicleFilterOptions): Promise<Vehicle[]> {
    return this.repository.filter(filters);
  }

  /**
   * Pure deterministic sorting function
   */
  public static sortCars(cars: Vehicle[], sortBy: VehicleSortOption): Vehicle[] {
    const list = [...cars];

    switch (sortBy) {
      case "featured":
        return list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.price - a.price);
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);
      case "price_desc":
        return list.sort((a, b) => b.price - a.price);
      case "year_desc":
        return list.sort((a, b) => b.year - a.year);
      case "year_asc":
        return list.sort((a, b) => a.year - b.year);
      case "horsepower_desc":
        return list.sort((a, b) => b.horsepower - a.horsepower);
      case "mileage_asc":
        return list.sort((a, b) => a.mileage - b.mileage);
      case "name_asc":
        return list.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
      default:
        return list;
    }
  }

  /**
   * Retrieves featured vehicles for showcase sections
   */
  public static async getFeaturedCars(): Promise<Vehicle[]> {
    return this.repository.getFeatured();
  }

  /**
   * Compares multiple vehicles side by side
   */
  public static async compareCars(carIds: string[]): Promise<VehicleComparisonResult> {
    return this.repository.compare(carIds);
  }

  /**
   * Retrieves dynamic filter facets (brands, body types, fuel types, ranges)
   */
  public static async getFilterFacets() {
    const [brands, bodyTypes, fuelTypes, priceRange, hpRange] = await Promise.all([
      this.repository.getDistinctBrands(),
      this.repository.getDistinctBodyTypes(),
      this.repository.getDistinctFuelTypes(),
      this.repository.getPriceRange(),
      this.repository.getHorsepowerRange(),
    ]);

    return {
      brands,
      bodyTypes,
      fuelTypes,
      priceRange,
      hpRange,
    };
  }
}
