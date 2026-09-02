import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes conditionally and safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format raw numbers as USD currency
 */
export function formatCurrency(amount: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format mileage numbers with comma separators
 */
export function formatMileage(miles: number): string {
  return `${new Intl.NumberFormat("en-US").format(miles)} mi`;
}

/**
 * Format horsepower / performance metrics
 */
export function formatHP(hp: number): string {
  return `${hp} hp`;
}

/**
 * Format 0-60 mph acceleration timing
 */
export function formatAcceleration(seconds: number): string {
  return `${seconds.toFixed(1)}s (0-60 mph)`;
}
