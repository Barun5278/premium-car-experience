from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class HotspotSchema(BaseModel):
    id: str
    label: str
    position: List[float]
    description: str


class CarMediaSchema(BaseModel):
    thumbnail_url: str = Field(alias="thumbnailUrl")
    gallery_urls: List[str] = Field(alias="galleryUrls")
    model_3d_url: Optional[str] = Field(None, alias="model3dUrl")
    hotspots: Optional[List[HotspotSchema]] = None

    model_config = ConfigDict(populate_by_name=True)


class CarSpecsSchema(BaseModel):
    horsepower: int
    torque: int
    zero_to_sixty: float = Field(alias="zeroToSixty")
    top_speed: int = Field(alias="topSpeed")
    range_or_mpg: str = Field(alias="rangeOrMpg")
    engine: Optional[str] = None
    battery_capacity: Optional[float] = Field(None, alias="batteryCapacity")
    curb_weight: int = Field(alias="curbWeight")

    model_config = ConfigDict(populate_by_name=True)


class VehicleDimensionsSchema(BaseModel):
    """Optional sub-structure inside CarResponse.extended.dimensions."""

    length_mm: Optional[int] = None
    width_mm: Optional[int] = None
    height_mm: Optional[int] = None
    wheelbase_mm: Optional[int] = None
    curb_weight_kg: Optional[int] = None

    model_config = ConfigDict(populate_by_name=True)


class ExtendedVehicleInfo(BaseModel):
    """
    Optional structured extension attached to CarResponse.extended.

    All fields are optional. Values come directly from the Supabase
    catalog tables and are not invented by the API layer.
    """

    safety_rating: Optional[float] = Field(None, alias="safetyRating")
    seating: Optional[int] = None
    mileage: Optional[int] = None
    boot_space_liters: Optional[int] = Field(None, alias="bootSpaceLiters")
    engine: Optional[str] = None
    dimensions: Optional[VehicleDimensionsSchema] = None
    feature_names: Optional[List[str]] = Field(None, alias="featureNames")
    category_slugs: Optional[List[str]] = Field(None, alias="categorySlugs")
    year: Optional[int] = None
    currency: Optional[str] = None
    is_featured: Optional[bool] = Field(None, alias="isFeatured")
    created_at: Optional[str] = Field(None, alias="createdAt")
    updated_at: Optional[str] = Field(None, alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)


class CarResponse(BaseModel):
    """
    Top-level vehicle response.

    The `extended` field is new in Phase 2; existing fields are unchanged
    to preserve the frontend contract.
    """

    id: str
    make: str
    model: str
    year: int
    trim: Optional[str] = None
    body_type: str = Field(alias="bodyType")
    fuel_type: str = Field(alias="fuelType")
    transmission: str
    drivetrain: str
    price: float
    specs: CarSpecsSchema
    media: CarMediaSchema
    description: str
    highlights: List[str]
    is_featured: bool = Field(False, alias="isFeatured")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    extended: Optional[ExtendedVehicleInfo] = None

    model_config = ConfigDict(populate_by_name=True)


class CarListResponse(BaseModel):
    """Paginated list envelope for GET /api/v1/cars."""

    items: List[CarResponse]
    total: int
    page: int
    limit: int
    total_pages: int = Field(alias="totalPages")

    model_config = ConfigDict(populate_by_name=True)


class CompareMatrixRowSchema(BaseModel):
    """One row of the comparison matrix returned by /cars/compare."""

    category: str
    attribute: str
    values: dict
    winner_vehicle_id: Optional[str] = Field(None, alias="winnerVehicleId")

    model_config = ConfigDict(populate_by_name=True)


class CompareResponse(BaseModel):
    """Response for GET /api/v1/cars/compare."""

    cars: List[CarResponse]
    comparison_matrix: List[CompareMatrixRowSchema] = Field(alias="comparisonMatrix")

    model_config = ConfigDict(populate_by_name=True)


class CarFilterQuery(BaseModel):
    """
    Query parameters for GET /api/v1/cars.

    All filter values are optional. Sort column is restricted to a
    server-side allowlist; unknown values fall back to 'featured'.
    """

    make: Optional[str] = None
    body_type: Optional[str] = None
    fuel_type: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    min_horsepower: Optional[int] = None
    search: Optional[str] = None
    sort_by: Optional[str] = None
    page: int = 1
    limit: int = 20

    model_config = ConfigDict(populate_by_name=True)
