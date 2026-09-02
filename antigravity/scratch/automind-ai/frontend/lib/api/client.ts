import {
  Car,
  CarFilterParams,
  PaginatedResult,
  ValuationRequest,
  ValuationResponse,
  AssistantChatRequest,
  AssistantChatResponse,
  RecommendationRequest,
  RecommendationResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error [${response.status}] ${endpoint}: ${errorBody}`);
  }

  return response.json();
}

export const api = {
  // Cars & Showcase
  cars: {
    list: (params?: CarFilterParams) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null) query.append(key, String(val));
        });
      }
      return fetcher<PaginatedResult<Car>>(`/cars?${query.toString()}`);
    },
    getById: (id: string) => fetcher<Car>(`/cars/${id}`),
    getFeatured: () => fetcher<Car[]>(`/cars/featured`),
    compare: (carIds: string[]) =>
      fetcher<{ cars: Car[]; comparisonMatrix: Record<string, unknown> }>(
        `/cars/compare?ids=${carIds.join(",")}`
      ),
  },

  // ML Valuation
  ml: {
    predictPrice: (payload: ValuationRequest) =>
      fetcher<ValuationResponse>("/ml/predict-price", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Gemini AI Assistant
  ai: {
    chat: (payload: AssistantChatRequest) =>
      fetcher<AssistantChatResponse>("/ai/chat", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    recommend: (payload: RecommendationRequest) =>
      fetcher<RecommendationResponse>("/ai/recommend", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Health
  health: () => fetcher<{ status: string; version: string; services: Record<string, string> }>("/health"),
};
