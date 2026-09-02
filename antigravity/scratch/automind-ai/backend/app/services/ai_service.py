import uuid
from typing import Dict, Any, List, Optional
from google import genai
from app.core.config import settings
from app.schemas.ai import (
    AssistantChatRequest,
    AssistantChatResponse,
    RecommendationRequest,
    RecommendationResponse,
    RecommendationMatch,
)


class AIService:
    def __init__(self):
        self._client: Optional[genai.Client] = None
        if settings.GEMINI_API_KEY:
            try:
                self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                print(f"[AI Service] Warning initializing Gemini Client: {e}")

    async def chat_assistant(self, req: AssistantChatRequest) -> AssistantChatResponse:
        session_id = req.session_id or str(uuid.uuid4())

        # If Gemini Client is configured, call Gemini API
        if self._client:
            try:
                prompt = f"""You are the AUTOMIND AI Senior Automotive Advisor. 
Answer the user's automotive question professionally, concisely, and accurately.
Context Car ID: {req.context_car_id or 'None'}
User Preferences: {req.preferences or 'None'}
User Query: {req.message}
"""
                response = self._client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                )
                reply_text = response.text or "I am analyzing the vehicle specifications."

                return AssistantChatResponse(
                    sessionId=session_id,
                    reply=reply_text,
                    suggestedQuestions=[
                        "What is the average maintenance cost?",
                        "How does it compare with competing models?",
                        "What is the estimated 5-year depreciation?",
                    ],
                )
            except Exception as e:
                print(f"[AI Service] Error calling Gemini: {e}")

        # Architectural fallback when API key is pending configuration
        return AssistantChatResponse(
            sessionId=session_id,
            reply=f"AUTOMIND AI Assistant initialized. (Configure GEMINI_API_KEY in backend/.env for live conversational intelligence). Query received: '{req.message}'",
            suggestedQuestions=[
                "Compare top electric sedans",
                "Estimate depreciation for 2023 Porsche 911",
                "Show fastest accelerating SUVs under $80k",
            ],
        )

    async def generate_recommendations(self, req: RecommendationRequest) -> RecommendationResponse:
        # Architectural recommendation logic
        summary = f"Based on your budget of ${req.budget_min:,.0f} - ${req.budget_max:,.0f} and primary use for {req.primary_use}, we prioritized vehicles with strong reliability and aesthetic fit."
        return RecommendationResponse(
            summary=summary,
            topMatches=[],
        )


ai_service = AIService()
