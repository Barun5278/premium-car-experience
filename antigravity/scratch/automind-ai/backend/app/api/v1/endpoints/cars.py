from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.schemas.car import (
    CarFilterQuery,
    CarListResponse,
    CarResponse,
    CompareResponse,
)
from app.services.car_service import CarService


router = APIRouter()


@router.get(
    "",
    response_model=CarListResponse,
    summary="List cars with filtering, pagination, and sorting",
)
async def list_cars(
    make: Optional[str] = Query(None, description="Brand name (case-insensitive)"),
    body_type: Optional[str] = Query(None),
    fuel_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    min_year: Optional[int] = Query(None, ge=1900),
    max_year: Optional[int] = Query(None, le=2100),
    min_horsepower: Optional[int] = Query(None, ge=0),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("featured"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    filters = CarFilterQuery(
        make=make,
        body_type=body_type,
        fuel_type=fuel_type,
        min_price=min_price,
        max_price=max_price,
        min_year=min_year,
        max_year=max_year,
        min_horsepower=min_horsepower,
        search=search,
        sort_by=sort_by,
        page=page,
        limit=limit,
    )
    return await CarService.get_cars(filters)


@router.get(
    "/featured",
    response_model=List[CarResponse],
    summary="Get featured showcase vehicles",
)
async def get_featured_cars():
    return await CarService.get_featured_cars()


@router.get(
    "/compare",
    response_model=CompareResponse,
    summary="Compare multiple vehicles side by side",
)
async def compare_cars(
    ids: str = Query(..., description="Comma-separated vehicle IDs (2 or more)"),
):
    car_ids = [cid.strip() for cid in ids.split(",") if cid.strip()]
    if len(car_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="Must provide at least 2 vehicle IDs to compare",
        )
    return await CarService.compare_cars(car_ids)


@router.get(
    "/{car_id}",
    response_model=CarResponse,
    summary="Get a single vehicle by ID",
    responses={404: {"description": "Vehicle not found"}},
)
async def get_car_by_id(car_id: str):
    car = await CarService.get_car_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return car
