from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("", summary="System Health & Readiness")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "services": {
            "gemini_configured": bool(settings.GEMINI_API_KEY),
            "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
            "ml_engine": "ready",
        },
    }
