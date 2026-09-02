from typing import List, Optional
from pydantic import BaseModel, Field


class ValuationRequest(BaseModel):
    make: str
    model: str
    year: int
    mileage: float
    condition: str  # "excellent" | "good" | "fair" | "poor"
    fuel_type: str = Field(alias="fuelType")
    transmission: str
    location_state: Optional[str] = Field(None, alias="locationState")
    accident_history_count: Optional[int] = Field(0, alias="accidentHistoryCount")
    owner_count: Optional[int] = Field(1, alias="ownerCount")

    class Config:
        populate_by_name = True


class ValuationConfidenceInterval(BaseModel):
    low: float
    high: float
    confidence_score: float = Field(alias="confidenceScore")

    class Config:
        populate_by_name = True


class ValuationFeatureImpact(BaseModel):
    feature: str
    impact_dollar: float = Field(alias="impactDollar")
    direction: str  # "positive" | "negative"
    explanation: str

    class Config:
        populate_by_name = True


class ValuationResponse(BaseModel):
    predicted_price: float = Field(alias="predictedPrice")
    confidence_interval: ValuationConfidenceInterval = Field(alias="confidenceInterval")
    market_trend: str = Field(alias="marketTrend")
    estimated_days_to_sell: int = Field(alias="estimatedDaysToSell")
    feature_impacts: List[ValuationFeatureImpact] = Field(alias="featureImpacts")
    model_version: str = Field(alias="modelVersion")
    timestamp: str

    class Config:
        populate_by_name = True
