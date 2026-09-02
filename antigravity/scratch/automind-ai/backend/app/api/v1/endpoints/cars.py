from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from app.schemas.car import CarResponse, CarFilterQuery
from app.services.car_service import CarService

router = APIRouter()


@router.get("", summary="List cars with filtering and pagination")
async def list_cars(
    make: Optional[str] = None,
    body_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    filters = CarFilterQuery(
        make=make,
        body_type=body_type,
        min_price=min_price,
        max_price=max_price,
        page=page,
        limit=limit,
    )
    return await CarService.get_cars(filters)


@router.get("/featured", summary="Get featured showcase vehicles")
async def get_featured_cars():
    return await CarService.get_featured_cars()


@router.get("/{car_id}", summary="Get car details by ID")
async def get_car_by_id(car_id: str):
    car = await CarService.get_car_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return car


@router.get("/compare", summary="Compare multiple vehicles side by side")
async def compare_cars(ids: str = Query(..., description="Comma-separated car IDs")):
    car_ids = [cid.strip() for cid in ids.split(",") if cid.strip()]
    if len(car_ids) < 2:
        raise HTTPException(status_code=400, detail="Must provide at least 2 vehicle IDs to compare")
    
    # Retrieval and comparison matrix assembly
    return {
        "cars": [],
        "comparisonMatrix": {},
    }
