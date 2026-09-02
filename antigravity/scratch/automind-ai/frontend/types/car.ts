export * from "./vehicle";

// Backward-compatible type alias for legacy references
import { Vehicle } from "./vehicle";
export type Car = Vehicle;
export type CarBodyType = import("./vehicle").VehicleBodyType;
export type FuelType = import("./vehicle").VehicleFuelType;
export type TransmissionType = import("./vehicle").VehicleTransmission;
export type CarFilterParams = import("./vehicle").VehicleFilterOptions;
