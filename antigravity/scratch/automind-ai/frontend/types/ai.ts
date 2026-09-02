import { Car } from "./car";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  referencedCarIds?: string[];
}

export interface AssistantChatRequest {
  sessionId?: string;
  message: string;
  contextCarId?: string;
  preferences?: {
    budgetMax?: number;
    usage?: "daily" | "family" | "track" | "offroad" | "luxury";
  };
}

export interface AssistantChatResponse {
  sessionId: string;
  reply: string;
  suggestedQuestions: string[];
  recommendedCars?: Car[];
}

export interface RecommendationRequest {
  budgetMin: number;
  budgetMax: number;
  primaryUse: "commute" | "family" | "track" | "roadtrip" | "utility";
  preferredFuelTypes: string[];
  mustHaveFeatures: string[];
  aestheticPreference: "minimalist" | "aggressive" | "luxury" | "futuristic";
}

export interface RecommendationMatch {
  car: Car;
  matchScore: number; // 0 - 100
  aiRationale: string;
  pros: string[];
  cons: string[];
}

export interface RecommendationResponse {
  summary: string;
  topMatches: RecommendationMatch[];
}
