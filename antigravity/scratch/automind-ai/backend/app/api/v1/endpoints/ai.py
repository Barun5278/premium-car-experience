from fastapi import APIRouter
from app.schemas.ai import (
    AssistantChatRequest,
    AssistantChatResponse,
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/chat", response_model=AssistantChatResponse, summary="Conversational AI Automotive Assistant")
async def chat_with_assistant(payload: AssistantChatRequest):
    return await ai_service.chat_assistant(payload)


@router.post("/recommend", response_model=RecommendationResponse, summary="AI-Powered Smart Vehicle Recommendation")
async def get_car_recommendations(payload: RecommendationRequest):
    return await ai_service.generate_recommendations(payload)
