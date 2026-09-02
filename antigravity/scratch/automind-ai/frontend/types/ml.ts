export interface ValuationRequest {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: "excellent" | "good" | "fair" | "poor";
  fuelType: string;
  transmission: string;
  locationState?: string;
  accidentHistoryCount?: number;
  ownerCount?: number;
}

export interface ValuationConfidenceInterval {
  low: number;
  high: number;
  confidenceScore: number; // 0.0 - 1.0
}

export interface ValuationFeatureImpact {
  feature: string;
  impactDollar: number;
  direction: "positive" | "negative";
  explanation: string;
}

export interface ValuationResponse {
  predictedPrice: number;
  confidenceInterval: ValuationConfidenceInterval;
  marketTrend: "appreciating" | "stable" | "depreciating";
  estimatedDaysToSell: number;
  featureImpacts: ValuationFeatureImpact[];
  modelVersion: string;
  timestamp: string;
}
