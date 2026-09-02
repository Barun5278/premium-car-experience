"""
Fake Supabase client for local tests of CarService and the /api/v1/cars
endpoints. This module does NOT depend on pytest; it is imported by both
the standalone runner and any future pytest-based tests.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Fixture data (mirrors the structure of the Phase 1 catalog tables)
# ---------------------------------------------------------------------------
BRANDS = [
    {"id": 1, "slug": "porsche", "name": "Porsche"},
    {"id": 2, "slug": "lucid", "name": "Lucid"},
    {"id": 3, "slug": "bmw", "name": "BMW"},
    {"id": 4, "slug": "ferrari", "name": "Ferrari"},
]

CATEGORIES = [
    {"id": 1, "slug": "sedan", "name": "Sedan"},
    {"id": 2, "slug": "suv", "name": "SUV"},
    {"id": 3, "slug": "hatchback", "name": "Hatchback"},
    {"id": 4, "slug": "sports", "name": "Sports"},
    {"id": 5, "slug": "electric", "name": "Electric"},
]

FEATURES = [
    {"id": 10, "slug": "active-aero", "name": "Active Aerodynamics", "feature_group": "Exterior"},
    {"id": 11, "slug": "pccb", "name": "PCCB Brakes", "feature_group": "Chassis"},
    {"id": 12, "slug": "800v-charging", "name": "800V Charging", "feature_group": "Charging"},
]

VEHICLES = [
    {
        "id": "porsche-911-gt3-rs-2024",
        "brand_id": 1,
        "model": "911 GT3 RS",
        "variant": "Weissach Package",
        "year": 2024,
        "body_type": "Sports",
        "fuel_type": "Petrol",
        "transmission": "Dual-Clutch",
        "drivetrain": "RWD",
        "price_usd": 241300,
        "currency": "USD",
        "mileage": 18,
        "seating": 2,
        "safety_rating": 5.0,
        "boot_space_liters": 132,
        "engine": "4.0L NA Boxer-6",
        "description": "Track weapon.",
        "is_featured": True,
        "tags": ["Track Focused", "Naturally Aspirated"],
        "search_text": "",
        "created_at": "2026-09-02T00:00:00Z",
        "updated_at": "2026-09-02T00:00:00Z",
    },
    {
        "id": "porsche-taycan-turbo-s-2025",
        "brand_id": 1,
        "model": "Taycan",
        "variant": "Turbo S",
        "year": 2025,
        "body_type": "Sedan",
        "fuel_type": "Electric",
        "transmission": "Direct-Drive",
        "drivetrain": "AWD",
        "price_usd": 209000,
        "currency": "USD",
        "mileage": 360,
        "seating": 4,
        "safety_rating": 5.0,
        "boot_space_liters": 407,
        "engine": "Dual Permanent Magnet Motors",
        "description": "Electric hyper-sedan.",
        "is_featured": True,
        "tags": ["EV", "Fast Charging"],
        "search_text": "",
        "created_at": "2026-09-02T00:00:00Z",
        "updated_at": "2026-09-02T00:00:00Z",
    },
    {
        "id": "lucid-air-sapphire-2024",
        "brand_id": 2,
        "model": "Air",
        "variant": "Sapphire",
        "year": 2024,
        "body_type": "Sedan",
        "fuel_type": "Electric",
        "transmission": "Direct-Drive",
        "drivetrain": "AWD",
        "price_usd": 249000,
        "currency": "USD",
        "mileage": 427,
        "seating": 5,
        "safety_rating": 5.0,
        "boot_space_liters": 627,
        "engine": "Tri-Motor",
        "description": "Luxury electric super-sports sedan.",
        "is_featured": True,
        "tags": ["Tri-Motor", "Long Range EV"],
        "search_text": "",
        "created_at": "2026-09-02T00:00:00Z",
        "updated_at": "2026-09-02T00:00:00Z",
    },
    {
        "id": "bmw-m3-competition-2024",
        "brand_id": 3,
        "model": "M3",
        "variant": "Competition xDrive",
        "year": 2024,
        "body_type": "Sedan",
        "fuel_type": "Petrol",
        "transmission": "Automatic",
        "drivetrain": "AWD",
        "price_usd": 84300,
        "currency": "USD",
        "mileage": 19,
        "seating": 5,
        "safety_rating": 5.0,
        "boot_space_liters": 480,
        "engine": "3.0L TwinPower Turbo Inline-6",
        "description": "Sports sedan benchmark.",
        "is_featured": False,
        "tags": ["Twin Turbo", "Sports Sedan"],
        "search_text": "",
        "created_at": "2026-09-02T00:00:00Z",
        "updated_at": "2026-09-02T00:00:00Z",
    },
    {
        "id": "ferrari-296-gtb-2024",
        "brand_id": 4,
        "model": "296 GTB",
        "variant": "Assetto Fiorano",
        "year": 2024,
        "body_type": "Sports",
        "fuel_type": "Plug-in Hybrid",
        "transmission": "Dual-Clutch",
        "drivetrain": "RWD",
        "price_usd": 342986,
        "currency": "USD",
        "mileage": 22,
        "seating": 2,
        "safety_rating": 5.0,
        "boot_space_liters": 202,
        "engine": "2.9L V6 Hybrid",
        "description": "Mid-rear-engined berlinetta.",
        "is_featured": True,
        "tags": ["Hybrid Supercar"],
        "search_text": "",
        "created_at": "2026-09-02T00:00:00Z",
        "updated_at": "2026-09-02T00:00:00Z",
    },
]

SPECS = {
    "porsche-911-gt3-rs-2024": {
        "vehicle_id": "porsche-911-gt3-rs-2024",
        "horsepower": 518,
        "torque_lb_ft": 342,
        "battery_capacity_kwh": None,
        "voltage_architecture": None,
        "dc_fast_charge_kw": None,
        "epa_range_miles": None,
    },
    "porsche-taycan-turbo-s-2025": {
        "vehicle_id": "porsche-taycan-turbo-s-2025",
        "horsepower": 938,
        "torque_lb_ft": 818,
        "battery_capacity_kwh": 93.4,
        "voltage_architecture": 800,
        "dc_fast_charge_kw": 320,
        "epa_range_miles": 360,
    },
    "lucid-air-sapphire-2024": {
        "vehicle_id": "lucid-air-sapphire-2024",
        "horsepower": 1234,
        "torque_lb_ft": 1430,
        "battery_capacity_kwh": 118.0,
        "voltage_architecture": 900,
        "dc_fast_charge_kw": 300,
        "epa_range_miles": 427,
    },
    "bmw-m3-competition-2024": {
        "vehicle_id": "bmw-m3-competition-2024",
        "horsepower": 503,
        "torque_lb_ft": 479,
        "battery_capacity_kwh": None,
        "voltage_architecture": None,
        "dc_fast_charge_kw": None,
        "epa_range_miles": None,
    },
    "ferrari-296-gtb-2024": {
        "vehicle_id": "ferrari-296-gtb-2024",
        "horsepower": 819,
        "torque_lb_ft": 546,
        "battery_capacity_kwh": None,
        "voltage_architecture": None,
        "dc_fast_charge_kw": None,
        "epa_range_miles": None,
    },
}

PERFORMANCE = {
    "porsche-911-gt3-rs-2024": {
        "vehicle_id": "porsche-911-gt3-rs-2024",
        "zero_to_sixty_sec": 3.0,
        "top_speed_mph": 184,
        "braking_distance_ft": 92,
        "lateral_g": 1.25,
        "quarter_mile_sec": None,
        "nurburgring_time_sec": None,
    },
    "porsche-taycan-turbo-s-2025": {
        "vehicle_id": "porsche-taycan-turbo-s-2025",
        "zero_to_sixty_sec": 2.3,
        "top_speed_mph": 162,
        "braking_distance_ft": None,
        "lateral_g": 1.08,
        "quarter_mile_sec": None,
        "nurburgring_time_sec": None,
    },
    "lucid-air-sapphire-2024": {
        "vehicle_id": "lucid-air-sapphire-2024",
        "zero_to_sixty_sec": 1.89,
        "top_speed_mph": 205,
        "braking_distance_ft": None,
        "lateral_g": 1.15,
        "quarter_mile_sec": None,
        "nurburgring_time_sec": None,
    },
    "bmw-m3-competition-2024": {
        "vehicle_id": "bmw-m3-competition-2024",
        "zero_to_sixty_sec": 3.4,
        "top_speed_mph": 180,
        "braking_distance_ft": None,
        "lateral_g": 1.05,
        "quarter_mile_sec": None,
        "nurburgring_time_sec": None,
    },
    "ferrari-296-gtb-2024": {
        "vehicle_id": "ferrari-296-gtb-2024",
        "zero_to_sixty_sec": 2.7,
        "top_speed_mph": 205,
        "braking_distance_ft": None,
        "lateral_g": 1.2,
        "quarter_mile_sec": None,
        "nurburgring_time_sec": None,
    },
}

DIMENSIONS = {
    "porsche-911-gt3-rs-2024": {
        "vehicle_id": "porsche-911-gt3-rs-2024",
        "length_mm": 4572,
        "width_mm": 1900,
        "height_mm": 1322,
        "wheelbase_mm": 2457,
        "curb_weight_kg": 1450,
    },
}

MEDIA = [
    {
        "id": "m1",
        "vehicle_id": "porsche-911-gt3-rs-2024",
        "kind": "image",
        "external_url": "https://x/primary.jpg",
        "storage_path": None,
        "is_primary": True,
        "sort_order": 0,
    },
    {
        "id": "m2",
        "vehicle_id": "porsche-911-gt3-rs-2024",
        "kind": "image",
        "external_url": "https://x/gallery1.jpg",
        "storage_path": None,
        "is_primary": False,
        "sort_order": 1,
    },
    {
        "id": "m3",
        "vehicle_id": "porsche-911-gt3-rs-2024",
        "kind": "model_3d",
        "external_url": "https://x/model.glb",
        "storage_path": None,
        "is_primary": False,
        "sort_order": 0,
    },
    {
        "id": "m4",
        "vehicle_id": "porsche-taycan-turbo-s-2025",
        "kind": "image",
        "external_url": "https://x/taycan.jpg",
        "storage_path": None,
        "is_primary": True,
        "sort_order": 0,
    },
]

HOTSPOTS = [
    {
        "id": "h1",
        "vehicle_id": "porsche-911-gt3-rs-2024",
        "label": "Rear Wing",
        "description": "Active aerodynamics.",
        "position_x": 0.85,
        "position_y": 0.3,
        "position_z": 0.5,
        "sort_order": 0,
    },
]

VEHICLE_FEATURES = [
    {"vehicle_id": "porsche-911-gt3-rs-2024", "feature_id": 10},
    {"vehicle_id": "porsche-911-gt3-rs-2024", "feature_id": 11},
    {"vehicle_id": "porsche-taycan-turbo-s-2025", "feature_id": 12},
]

VEHICLE_CATEGORIES = [
    {"vehicle_id": "porsche-911-gt3-rs-2024", "category_id": 4},
    {"vehicle_id": "porsche-taycan-turbo-s-2025", "category_id": 1},
    {"vehicle_id": "porsche-taycan-turbo-s-2025", "category_id": 5},
]


# ---------------------------------------------------------------------------
# Query builder
# ---------------------------------------------------------------------------
class _Query:
    """
    A minimal chainable query object that supports the subset of operations
    used by CarService:

      .select(cols)
      .eq(col, val)
      .ilike(col, val)        -> ILIKE %val%
      .in_(col, [vals])
      .gte(col, val)
      .lte(col, val)
      .order(col, desc=bool)
      .range(start, end)
      .limit(n)
      .text_search(col, term, options)
    """

    def __init__(self, table: str, client: "FakeSupabaseClient"):
        self.table = table
        self.client = client
        self._filters: List[Dict[str, Any]] = []
        self._order: List[tuple] = []
        self._range: Optional[tuple] = None
        self._limit: Optional[int] = None
        self._text_search: Optional[tuple] = None

    def select(self, cols: str = "*", count: Optional[str] = None):
        # `count` is accepted to mirror the supabase-py API. The fake
        # does not actually paginate differently for "exact"; it just
        # notes the request and returns a row count in `Resp.count`.
        self._count = count
        return self

    def eq(self, col: str, val: Any):
        self._filters.append({"op": "eq", "col": col, "val": val})
        return self

    def ilike(self, col: str, pattern: str):
        self._filters.append({"op": "ilike", "col": col, "val": pattern})
        return self

    def in_(self, col: str, values: List[Any]):
        self._filters.append({"op": "in", "col": col, "val": list(values)})
        return self

    def gte(self, col: str, val: Any):
        self._filters.append({"op": "gte", "col": col, "val": val})
        return self

    def lte(self, col: str, val: Any):
        self._filters.append({"op": "lte", "col": col, "val": val})
        return self

    def order(self, col: str, desc: bool = False):
        self._order.append((col, bool(desc)))
        return self

    def range(self, start: int, end: int):
        self._range = (start, end)
        return self

    def limit(self, n: int):
        self._limit = int(n)
        return self

    def text_search(self, col: str, term: str, options: Optional[dict] = None):
        self._text_search = (col, term)
        return self

    def single(self):
        return self

    def execute(self):
        rows = self.client._select(self.table, self._filters)
        if self._text_search:
            col, term = self._text_search
            t = term.lower()
            rows = [r for r in rows if t in str(r.get(col, "")).lower()]
        if self._order:
            for col, desc in reversed(self._order):
                rows = sorted(rows, key=lambda r, c=col: (r.get(c) is None, r.get(c)), reverse=desc)
        if self._range is not None:
            start, end = self._range
            rows = rows[start:end + 1]
        if self._limit is not None:
            rows = rows[:self._limit]

        class _Resp:
            def __init__(self, data, count=None):
                self.data = data
                # PostgREST returns an integer when count="exact" is
                # requested. The fake approximates that with len(data).
                if count in (None, "exact", "planned"):
                    self.count = len(data)
                else:
                    try:
                        self.count = int(count)
                    except (TypeError, ValueError):
                        self.count = len(data)
        return _Resp(rows, count=self._count)


class FakeSupabaseClient:
    """In-memory Supabase replacement for local tests."""

    def __init__(self):
        self._tables: Dict[str, List[Dict[str, Any]]] = {
            "brands": [dict(r) for r in BRANDS],
            "categories": [dict(r) for r in CATEGORIES],
            "features": [dict(r) for r in FEATURES],
            "vehicles": [dict(r) for r in VEHICLES],
            "vehicle_specs": [dict(r) for r in SPECS.values()],
            "vehicle_performance": [dict(r) for r in PERFORMANCE.values()],
            "vehicle_dimensions": [dict(r) for r in DIMENSIONS.values()],
            "vehicle_media": [dict(r) for r in MEDIA],
            "vehicle_hotspots": [dict(r) for r in HOTSPOTS],
            "vehicle_features": [dict(r) for r in VEHICLE_FEATURES],
            "vehicle_categories": [dict(r) for r in VEHICLE_CATEGORIES],
        }

    def table(self, name: str) -> _Query:
        return _Query(name, self)

    def _select(self, table: str, filters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        rows = [dict(r) for r in self._tables.get(table, [])]
        for f in filters:
            op = f["op"]
            col = f["col"]
            val = f["val"]
            if op == "eq":
                rows = [r for r in rows if r.get(col) == val]
            elif op == "ilike":
                # strip surrounding % if present
                pat = val
                if pat.startswith("%") and pat.endswith("%"):
                    needle = pat[1:-1].lower()
                    rows = [r for r in rows if needle in str(r.get(col, "")).lower()]
                else:
                    rows = [r for r in rows if str(r.get(col, "")).lower() == pat.lower()]
            elif op == "in":
                rows = [r for r in rows if r.get(col) in val]
            elif op == "gte":
                rows = [r for r in rows if r.get(col) is not None and r.get(col) >= val]
            elif op == "lte":
                rows = [r for r in rows if r.get(col) is not None and r.get(col) <= val]
        return rows
