from typing import List, Optional
from pydantic import BaseModel, Field


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

    class Config:
        populate_by_name = True


class CarSpecsSchema(BaseModel):
    horsepower: int
    torque: int
    zero_to_sixty: float = Field(alias="zeroToSixty")
    top_speed: int = Field(alias="topSpeed")
    range_or_mpg: str = Field(alias="rangeOrMpg")
    engine: Optional[str] = None
    battery_capacity: Optional[float] = Field(None, alias="batteryCapacity")
    curb_weight: int = Field(alias="curbWeight")

    class Config:
        populate_by_name = True


class CarResponse(BaseModel):
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

    class Config:
        populate_by_name = True


class CarFilterQuery(BaseModel):
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
