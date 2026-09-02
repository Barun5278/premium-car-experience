from fastapi import APIRouter
from app.api.v1.endpoints import health, cars, ml, ai

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(cars.router, prefix="/cars", tags=["Cars"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Engine"])
