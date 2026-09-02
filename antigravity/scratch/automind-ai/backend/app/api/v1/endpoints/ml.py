from fastapi import APIRouter
from app.schemas.ml import ValuationRequest, ValuationResponse
from app.services.ml_service import ml_service

router = APIRouter()


@router.post("/predict-price", response_model=ValuationResponse, summary="Predict used car valuation via ML pipeline")
async def predict_car_price(payload: ValuationRequest):
    return await ml_service.predict_price(payload)
