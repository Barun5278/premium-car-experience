from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.car import CarResponse


class AssistantChatRequest(BaseModel):
    session_id: Optional[str] = Field(None, alias="sessionId")
    message: str
    context_car_id: Optional[str] = Field(None, alias="contextCarId")
    preferences: Optional[Dict[str, Any]] = None

    class Config:
        populate_by_name = True


class AssistantChatResponse(BaseModel):
    session_id: str = Field(alias="sessionId")
    reply: str
    suggested_questions: List[str] = Field(alias="suggestedQuestions")
    recommended_cars: Optional[List[CarResponse]] = Field(None, alias="recommendedCars")

    class Config:
        populate_by_name = True


class RecommendationRequest(BaseModel):
    budget_min: float = Field(alias="budgetMin")
    budget_max: float = Field(alias="budgetMax")
    primary_use: str = Field(alias="primaryUse")
    preferred_fuel_types: List[str] = Field(alias="preferredFuelTypes")
    must_have_features: List[str] = Field(alias="mustHaveFeatures")
    aesthetic_preference: str = Field(alias="aestheticPreference")

    class Config:
        populate_by_name = True


class RecommendationMatch(BaseModel):
    car: CarResponse
    match_score: int = Field(alias="matchScore")
    ai_rationale: str = Field(alias="aiRationale")
    pros: List[str]
    cons: List[str]

    class Config:
        populate_by_name = True


class RecommendationResponse(BaseModel):
    summary: str
    top_matches: List[RecommendationMatch] = Field(alias="topMatches")

    class Config:
        populate_by_name = True
