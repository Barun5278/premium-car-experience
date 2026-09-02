from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

from app.schemas.car import (
    CarListResponse,
    CarResponse,
    CompareMatrixRowSchema,
    CompareResponse,
    ExtendedVehicleInfo,
    HotspotSchema,
    VehicleDimensionsSchema,
)
from app.db.session import get_supabase_client


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

VEHICLE_TABLE = "vehicles"
BRANDS_TABLE = "brands"
SPECS_TABLE = "vehicle_specs"
PERFORMANCE_TABLE = "vehicle_performance"
DIMENSIONS_TABLE = "vehicle_dimensions"
MEDIA_TABLE = "vehicle_media"
HOTSPOTS_TABLE = "vehicle_hotspots"
FEATURES_TABLE = "features"
VEHICLE_FEATURES_TABLE = "vehicle_features"
CATEGORIES_TABLE = "categories"
VEHICLE_CATEGORIES_TABLE = "vehicle_categories"

# Public API limit clamps to protect the database from pathological requests.
API_MAX_LIMIT = 100
API_DEFAULT_LIMIT = 20

# Allowlisted sort columns. Anything else falls back to "featured".
SORT_COLUMN_MAP: Dict[str, str] = {
    "featured": "is_featured",
    "price_asc": "price_usd",
    "price_desc": "price_usd",
    "year_desc": "year",
    "year_asc": "year",
    "horsepower_desc": "vehicle_specs.horsepower",  # used only when joining
    "name_asc": "model",
}
DEFAULT_SORT = "featured"


# ---------------------------------------------------------------------------
# Public service
# ---------------------------------------------------------------------------
class CarService:
    """
    Reads from the Supabase catalog and assembles CarResponse objects that
    match the existing frontend contract.

    All methods are async and tolerant of a missing Supabase client: they
    return empty / None results rather than raising. Endpoints translate
    these into proper HTTP responses.
    """

    # ----- list ---------------------------------------------------------
    @staticmethod
    async def get_cars(filters: Optional[Any] = None) -> CarListResponse:
        """
        List vehicles with optional filtering, pagination, and sorting.

        `filters` may be either a CarFilterQuery instance or None.
        """
        page = max(1, int(getattr(filters, "page", 1) or 1))
        limit = max(1, min(API_MAX_LIMIT, int(getattr(filters, "limit", API_DEFAULT_LIMIT) or API_DEFAULT_LIMIT)))
        sort_by = getattr(filters, "sort_by", None) or DEFAULT_SORT

        client = get_supabase_client()
        if client is None:
            return CarService._empty_list(page, limit)

        # Build the base query.
        query = client.table(VEHICLE_TABLE).select("*", count="exact")

        # Filters
        if getattr(filters, "body_type", None):
            query = query.eq("body_type", filters.body_type)
        if getattr(filters, "fuel_type", None):
            query = query.eq("fuel_type", filters.fuel_type)
        if getattr(filters, "min_price", None) is not None:
            query = query.gte("price_usd", float(filters.min_price))
        if getattr(filters, "max_price", None) is not None:
            query = query.lte("price_usd", float(filters.max_price))
        if getattr(filters, "min_year", None) is not None:
            query = query.gte("year", int(filters.min_year))
        if getattr(filters, "max_year", None) is not None:
            query = query.lte("year", int(filters.max_year))

        make_filter = getattr(filters, "make", None)
        if make_filter:
            # The "make" string is a brand name. Resolve to a brand_id first
            # via a separate query so the filter stays parameter-safe.
            brand_id = CarService._resolve_brand_id_by_name(client, make_filter)
            if brand_id is None:
                # Brand not found -> no matches.
                return CarService._empty_list(page, limit)
            query = query.eq("brand_id", brand_id)

        # Horsepower requires a join. If requested, fetch matching vehicle_ids
        # from vehicle_specs first, then constrain the vehicles query.
        min_hp = getattr(filters, "min_horsepower", None)
        if min_hp is not None:
            hp_ids = CarService._vehicle_ids_with_min_horsepower(client, int(min_hp))
            if not hp_ids:
                return CarService._empty_list(page, limit)
            query = query.in_("id", hp_ids)

        # Search uses the GIN-indexed tsvector. PostgREST exposes it via the
        # `search_text` column with `@@` / `websearch_to_tsquery`. The
        # supabase-py SDK does not expose a generic FTS operator directly, so
        # we use a parameterized RPC-free path: filter via `textsearch`.
        # Falls back to plain ILIKE on model if the column is missing.
        search_term = getattr(filters, "search", None)
        if search_term:
            query = query.text_search("search_text", str(search_term), options={"type": "websearch"})

        # Sorting. The allowlist prevents arbitrary column names.
        sort_column = SORT_COLUMN_MAP.get(str(sort_by), "is_featured")
        if sort_column in {"price_usd", "year", "is_featured", "model"}:
            query = query.order(sort_column, desc=(sort_by in {"price_desc", "year_desc", "horsepower_desc"}))
        else:
            # "featured" maps to is_featured desc, but we also need a stable
            # secondary sort. Use created_at desc to be deterministic.
            query = query.order("is_featured", desc=True).order("created_at", desc=True)

        # Pagination via Range header (PostgREST).
        start = (page - 1) * limit
        end = start + limit - 1
        query = query.range(start, end)

        try:
            resp = query.execute()
        except Exception as e:
            print(f"[CarService] Supabase error in get_cars: {e}")
            return CarService._empty_list(page, limit)

        rows = list(resp.data or [])
        total = getattr(resp, "count", None)
        if total is None:
            total = len(rows)

        items = await CarService._assemble_many(client, [r["id"] for r in rows], rows)
        total_pages = (total + limit - 1) // limit if limit else 0
        return CarListResponse(
            items=items,
            total=int(total),
            page=page,
            limit=limit,
            totalPages=total_pages,
        )

    # ----- single -------------------------------------------------------
    @staticmethod
    async def get_car_by_id(car_id: str) -> Optional[CarResponse]:
        client = get_supabase_client()
        if client is None:
            return None

        try:
            resp = client.table(VEHICLE_TABLE).select("*").eq("id", car_id).limit(1).execute()
        except Exception as e:
            print(f"[CarService] Supabase error in get_car_by_id: {e}")
            return None

        rows = list(resp.data or [])
        if not rows:
            return None
        assembled = await CarService._assemble_many(client, [car_id], rows)
        return assembled[0] if assembled else None

    # ----- featured -----------------------------------------------------
    @staticmethod
    async def get_featured_cars(limit: int = 6) -> List[CarResponse]:
        client = get_supabase_client()
        if client is None:
            return []

        try:
            resp = (
                client.table(VEHICLE_TABLE)
                .select("*")
                .eq("is_featured", True)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
        except Exception as e:
            print(f"[CarService] Supabase error in get_featured_cars: {e}")
            return []

        rows = list(resp.data or [])
        if not rows:
            return []
        return await CarService._assemble_many(client, [r["id"] for r in rows], rows)

    # ----- compare ------------------------------------------------------
    @staticmethod
    async def compare_cars(car_ids: Sequence[str]) -> CompareResponse:
        client = get_supabase_client()
        if client is None:
            return CompareResponse(cars=[], comparisonMatrix=[])

        # Deduplicate while preserving order; ignore empties.
        seen: set[str] = set()
        unique_ids: List[str] = []
        for cid in car_ids:
            if cid and cid not in seen:
                seen.add(cid)
                unique_ids.append(cid)

        if not unique_ids:
            return CompareResponse(cars=[], comparisonMatrix=[])

        try:
            resp = client.table(VEHICLE_TABLE).select("*").in_("id", unique_ids).execute()
        except Exception as e:
            print(f"[CarService] Supabase error in compare_cars: {e}")
            return CompareResponse(cars=[], comparisonMatrix=[])

        rows = list(resp.data or [])
        cars = await CarService._assemble_many(client, [r["id"] for r in rows], rows)
        matrix = _build_comparison_matrix(cars)
        return CompareResponse(cars=cars, comparisonMatrix=matrix)

    # ----- internals ----------------------------------------------------
    @staticmethod
    def _empty_list(page: int, limit: int) -> CarListResponse:
        return CarListResponse(items=[], total=0, page=page, limit=limit, totalPages=0)

    @staticmethod
    def _resolve_brand_id_by_name(client: Any, name: str) -> Optional[int]:
        try:
            resp = client.table(BRANDS_TABLE).select("id").ilike("name", name).limit(1).execute()
        except Exception as e:
            print(f"[CarService] Supabase error resolving brand: {e}")
            return None
        rows = list(resp.data or [])
        if not rows:
            return None
        return int(rows[0]["id"])

    @staticmethod
    def _vehicle_ids_with_min_horsepower(client: Any, min_hp: int) -> List[str]:
        try:
            resp = client.table(SPECS_TABLE).select("vehicle_id").gte("horsepower", min_hp).execute()
        except Exception as e:
            print(f"[CarService] Supabase error in min_horsepower: {e}")
            return []
        return [r["vehicle_id"] for r in (resp.data or [])]

    @staticmethod
    async def _assemble_many(
        client: Any,
        ids: Sequence[str],
        base_rows: Sequence[Dict[str, Any]],
    ) -> List[CarResponse]:
        """
        For each vehicle row, build a CarResponse by joining the related
        tables in a single batched set of queries.
        """
        if not ids:
            return []

        id_set = set(ids)

        # Brands: one query for the unique brand_ids referenced.
        brand_ids = sorted({int(r["brand_id"]) for r in base_rows if r.get("brand_id") is not None})
        brands_by_id: Dict[int, Dict[str, Any]] = {}
        if brand_ids:
            try:
                resp = client.table(BRANDS_TABLE).select("id,name,slug").in_("id", brand_ids).execute()
                brands_by_id = {int(b["id"]): b for b in (resp.data or [])}
            except Exception as e:
                print(f"[CarService] Supabase error fetching brands: {e}")

        # 1:1 children
        specs_by_vid, perf_by_vid, dims_by_vid = _fetch_one_to_one(client, ids)

        # 1:N children
        media_by_vid = _fetch_grouped(client, MEDIA_TABLE, "vehicle_id", ids)
        hotspots_by_vid = _fetch_grouped(client, HOTSPOTS_TABLE, "vehicle_id", ids)

        # N:N junctions -> flatten to lists per vehicle.
        feature_names_by_vid = _fetch_feature_names_by_vehicle(client, ids)
        category_slugs_by_vid = _fetch_category_slugs_by_vehicle(client, ids)

        out: List[CarResponse] = []
        for row in base_rows:
            vid = row.get("id")
            if vid not in id_set:
                continue
            try:
                car = _assemble_one(
                    row=row,
                    brand=brands_by_id.get(int(row["brand_id"])) if row.get("brand_id") is not None else None,
                    specs=specs_by_vid.get(vid),
                    perf=perf_by_vid.get(vid),
                    dims=dims_by_vid.get(vid),
                    media_rows=media_by_vid.get(vid, []),
                    hotspot_rows=hotspots_by_vid.get(vid, []),
                    feature_names=feature_names_by_vid.get(vid, []),
                    category_slugs=category_slugs_by_vid.get(vid, []),
                )
                out.append(car)
            except Exception as e:
                # Never let one bad row take down the whole list.
                print(f"[CarService] Skipping vehicle {vid}: {e}")
                continue
        return out


# ---------------------------------------------------------------------------
# Module-level helpers
# ---------------------------------------------------------------------------
def _fetch_one_to_one(
    client: Any,
    vehicle_ids: Sequence[str],
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Dict[str, Any]], Dict[str, Dict[str, Any]]]:
    """Fetch vehicle_specs, vehicle_performance, vehicle_dimensions in three queries."""
    specs: Dict[str, Dict[str, Any]] = {}
    perf: Dict[str, Dict[str, Any]] = {}
    dims: Dict[str, Dict[str, Any]] = {}
    if not vehicle_ids:
        return specs, perf, dims
    try:
        r = client.table(SPECS_TABLE).select("*").in_("vehicle_id", vehicle_ids).execute()
        for row in (r.data or []):
            specs[row["vehicle_id"]] = row
    except Exception as e:
        print(f"[CarService] Supabase error fetching specs: {e}")
    try:
        r = client.table(PERFORMANCE_TABLE).select("*").in_("vehicle_id", vehicle_ids).execute()
        for row in (r.data or []):
            perf[row["vehicle_id"]] = row
    except Exception as e:
        print(f"[CarService] Supabase error fetching performance: {e}")
    try:
        r = client.table(DIMENSIONS_TABLE).select("*").in_("vehicle_id", vehicle_ids).execute()
        for row in (r.data or []):
            dims[row["vehicle_id"]] = row
    except Exception as e:
        print(f"[CarService] Supabase error fetching dimensions: {e}")
    return specs, perf, dims


def _fetch_grouped(
    client: Any,
    table: str,
    fk_column: str,
    vehicle_ids: Sequence[str],
) -> Dict[str, List[Dict[str, Any]]]:
    grouped: Dict[str, List[Dict[str, Any]]] = {vid: [] for vid in vehicle_ids}
    if not vehicle_ids:
        return grouped
    try:
        r = client.table(table).select("*").in_(fk_column, vehicle_ids).execute()
    except Exception as e:
        print(f"[CarService] Supabase error fetching {table}: {e}")
        return grouped
    for row in (r.data or []):
        vid = row.get(fk_column)
        if vid in grouped:
            grouped[vid].append(row)
    return grouped


def _fetch_feature_names_by_vehicle(
    client: Any, vehicle_ids: Sequence[str]
) -> Dict[str, List[str]]:
    """
    Resolve vehicle_features -> features.name for each vehicle.

    Does this in two queries (one for junctions, one for feature names)
    so we don't need embed-path syntax. Sufficient for the current scale.
    """
    out: Dict[str, List[str]] = {vid: [] for vid in vehicle_ids}
    if not vehicle_ids:
        return out
    try:
        junctions = client.table(VEHICLE_FEATURES_TABLE).select("vehicle_id,feature_id").in_("vehicle_id", vehicle_ids).execute()
        j_data = junctions.data or []
    except Exception as e:
        print(f"[CarService] Supabase error fetching vehicle_features: {e}")
        return out
    feature_ids = sorted({int(j["feature_id"]) for j in j_data if j.get("feature_id") is not None})
    if not feature_ids:
        return out
    try:
        feat_rows = client.table(FEATURES_TABLE).select("id,name").in_("id", feature_ids).execute()
    except Exception as e:
        print(f"[CarService] Supabase error fetching features: {e}")
        return out
    name_by_id = {int(f["id"]): f.get("name") for f in (feat_rows.data or [])}
    by_vid: Dict[str, List[int]] = {}
    for j in j_data:
        by_vid.setdefault(j["vehicle_id"], []).append(int(j["feature_id"]))
    for vid, fids in by_vid.items():
        for fid in fids:
            n = name_by_id.get(fid)
            if n and n not in out[vid]:
                out[vid].append(n)
    return out


def _fetch_category_slugs_by_vehicle(
    client: Any, vehicle_ids: Sequence[str]
) -> Dict[str, List[str]]:
    out: Dict[str, List[str]] = {vid: [] for vid in vehicle_ids}
    if not vehicle_ids:
        return out
    try:
        junctions = client.table(VEHICLE_CATEGORIES_TABLE).select("vehicle_id,category_id").in_("vehicle_id", vehicle_ids).execute()
        j_data = junctions.data or []
    except Exception as e:
        print(f"[CarService] Supabase error fetching vehicle_categories: {e}")
        return out
    category_ids = sorted({int(j["category_id"]) for j in j_data if j.get("category_id") is not None})
    if not category_ids:
        return out
    try:
        cat_rows = client.table(CATEGORIES_TABLE).select("id,slug").in_("id", category_ids).execute()
    except Exception as e:
        print(f"[CarService] Supabase error fetching categories: {e}")
        return out
    slug_by_id = {int(c["id"]): c.get("slug") for c in (cat_rows.data or [])}
    by_vid: Dict[str, List[int]] = {}
    for j in j_data:
        by_vid.setdefault(j["vehicle_id"], []).append(int(j["category_id"]))
    for vid, cids in by_vid.items():
        for cid in cids:
            s = slug_by_id.get(cid)
            if s and s not in out[vid]:
                out[vid].append(s)
    return out


def _synthesize_range_or_mpg(fuel_type: Optional[str], mileage: Optional[int]) -> str:
    """
    Build the legacy `rangeOrMpg` string from `fuel_type` and `mileage`.
    The seed treats `mileage` as MPG for ICE and as range-miles for EVs;
    this helper preserves that semantic without inventing data.
    """
    if mileage is None:
        return ""
    if fuel_type == "Electric":
        return f"{int(mileage)} mi range"
    return f"{int(mileage)} mpg"


def _safe_int(v: Any) -> int:
    if v is None:
        return 0
    try:
        return int(v)
    except (TypeError, ValueError):
        return 0


def _assemble_one(
    *,
    row: Dict[str, Any],
    brand: Optional[Dict[str, Any]],
    specs: Optional[Dict[str, Any]],
    perf: Optional[Dict[str, Any]],
    dims: Optional[Dict[str, Any]],
    media_rows: List[Dict[str, Any]],
    hotspot_rows: List[Dict[str, Any]],
    feature_names: List[str],
    category_slugs: List[str],
) -> CarResponse:
    # ---- media ----
    sorted_media = sorted(
        media_rows,
        key=lambda r: (
            0 if r.get("is_primary") else 1,
            r.get("sort_order") if r.get("sort_order") is not None else 9999,
            r.get("created_at") or "",
        ),
    )
    primary_image: Optional[str] = None
    gallery: List[str] = []
    model_3d_url: Optional[str] = None
    for m in sorted_media:
        url = m.get("external_url") or (
            m.get("storage_path") if not m.get("external_url") else None
        )
        if not url:
            continue
        kind = m.get("kind")
        if kind == "model_3d" and model_3d_url is None:
            model_3d_url = url
            continue
        if kind in (None, "image", "thumbnail"):
            if primary_image is None:
                primary_image = url
            else:
                if url not in gallery:
                    gallery.append(url)

    if primary_image is None:
        primary_image = ""

    # ---- hotspots ----
    hotspot_models: List[HotspotSchema] = []
    for h in sorted(hotspot_rows, key=lambda r: r.get("sort_order") or 9999):
        try:
            hotspot_models.append(
                HotspotSchema(
                    id=str(h.get("id", "")),
                    label=str(h.get("label", "")),
                    position=[
                        float(h.get("position_x") or 0.0),
                        float(h.get("position_y") or 0.0),
                        float(h.get("position_z") or 0.0),
                    ],
                    description=str(h.get("description") or ""),
                )
            )
        except Exception:
            # Skip malformed hotspot rows rather than failing the whole vehicle.
            continue

    # ---- specs ----
    horsepower = _safe_int((specs or {}).get("horsepower"))
    torque_lb_ft = _safe_int((specs or {}).get("torque_lb_ft"))
    battery_capacity = (specs or {}).get("battery_capacity_kwh")
    if battery_capacity is not None:
        try:
            battery_capacity = float(battery_capacity)
        except (TypeError, ValueError):
            battery_capacity = None
    zero_to_sixty = float((perf or {}).get("zero_to_sixty_sec") or 0.0)
    top_speed = _safe_int((perf or {}).get("top_speed_mph"))
    range_or_mpg = _synthesize_range_or_mpg(row.get("fuel_type"), row.get("mileage"))
    engine_str = (specs or {}).get("engine") or row.get("engine")

    extended = ExtendedVehicleInfo(
        safetyRating=row.get("safety_rating"),
        seating=_safe_int(row.get("seating")) or None,
        mileage=_safe_int(row.get("mileage")) or None,
        bootSpaceLiters=_safe_int(row.get("boot_space_liters")) or None,
        engine=engine_str,
        dimensions=VehicleDimensionsSchema(
            length_mm=_safe_int((dims or {}).get("length_mm")) or None,
            width_mm=_safe_int((dims or {}).get("width_mm")) or None,
            height_mm=_safe_int((dims or {}).get("height_mm")) or None,
            wheelbase_mm=_safe_int((dims or {}).get("wheelbase_mm")) or None,
            curb_weight_kg=_safe_int((dims or {}).get("curb_weight_kg")) or None,
        ) if dims else None,
        featureNames=feature_names or None,
        categorySlugs=category_slugs or None,
        year=_safe_int(row.get("year")) or None,
        currency=row.get("currency"),
        isFeatured=bool(row.get("is_featured")),
        createdAt=row.get("created_at"),
        updatedAt=row.get("updated_at"),
    )

    return CarResponse(
        id=str(row.get("id", "")),
        make=str((brand or {}).get("name") or ""),
        model=str(row.get("model") or ""),
        year=_safe_int(row.get("year")),
        trim=row.get("variant"),
        bodyType=str(row.get("body_type") or ""),
        fuelType=str(row.get("fuel_type") or ""),
        transmission=str(row.get("transmission") or ""),
        drivetrain=str(row.get("drivetrain") or ""),
        price=float(row.get("price_usd") or 0.0),
        specs={
            "horsepower": horsepower,
            "torque": torque_lb_ft,
            "zeroToSixty": zero_to_sixty,
            "topSpeed": top_speed,
            "rangeOrMpg": range_or_mpg,
            "engine": engine_str,
            "batteryCapacity": battery_capacity,
            "curbWeight": _safe_int((dims or {}).get("curb_weight_kg")),
        },
        media={
            "thumbnailUrl": primary_image,
            "galleryUrls": gallery,
            "model3dUrl": model_3d_url,
            "hotspots": hotspot_models or None,
        },
        description=str(row.get("description") or ""),
        highlights=list(row.get("tags") or []),
        isFeatured=bool(row.get("is_featured")),
        createdAt=str(row.get("created_at") or ""),
        updatedAt=str(row.get("updated_at") or ""),
        extended=extended,
    )


def _build_comparison_matrix(cars: Sequence[CarResponse]) -> List[CompareMatrixRowSchema]:
    if not cars:
        return []
    rows: List[CompareMatrixRowSchema] = []

    def _values(getter) -> dict:
        return {c.id: getter(c) for c in cars}

    def _pick_winner(values: dict, better: str) -> Optional[str]:
        # better in {"max", "min"}
        nums = [(vid, v) for vid, v in values.items() if isinstance(v, (int, float))]
        if not nums:
            return None
        if better == "max":
            winner, _ = max(nums, key=lambda kv: kv[1])
        else:
            winner, _ = min(nums, key=lambda kv: kv[1])
        return winner

    # Price
    price_values = _values(lambda c: c.price)
    rows.append(
        CompareMatrixRowSchema(
            category="Economics",
            attribute="Price",
            values={vid: f"${v:,.0f}" for vid, v in price_values.items()},
            winnerVehicleId=_pick_winner(price_values, "min"),
        )
    )
    # Horsepower
    hp_values = _values(lambda c: c.specs.horsepower)
    rows.append(
        CompareMatrixRowSchema(
            category="Performance",
            attribute="Horsepower",
            values={vid: f"{v} HP" for vid, v in hp_values.items()},
            winnerVehicleId=_pick_winner(hp_values, "max"),
        )
    )
    # Torque
    tq_values = _values(lambda c: c.specs.torque)
    rows.append(
        CompareMatrixRowSchema(
            category="Performance",
            attribute="Torque",
            values={vid: f"{v} lb-ft" for vid, v in tq_values.items()},
            winnerVehicleId=_pick_winner(tq_values, "max"),
        )
    )
    # 0-60
    zt_values = _values(lambda c: c.specs.zero_to_sixty)
    rows.append(
        CompareMatrixRowSchema(
            category="Performance",
            attribute="0-60 mph",
            values={vid: f"{v}s" for vid, v in zt_values.items()},
            winnerVehicleId=_pick_winner(zt_values, "min"),
        )
    )
    # Top speed
    ts_values = _values(lambda c: c.specs.top_speed)
    rows.append(
        CompareMatrixRowSchema(
            category="Performance",
            attribute="Top Speed",
            values={vid: f"{v} mph" for vid, v in ts_values.items()},
            winnerVehicleId=_pick_winner(ts_values, "max"),
        )
    )
    # Range / MPG
    rm_values = _values(lambda c: c.specs.range_or_mpg)
    rows.append(
        CompareMatrixRowSchema(
            category="Economy",
            attribute="Range / MPG",
            values=rm_values,
        )
    )
    # Body type
    rows.append(
        CompareMatrixRowSchema(
            category="Body",
            attribute="Body Style",
            values=_values(lambda c: c.body_type),
        )
    )
    # Fuel
    rows.append(
        CompareMatrixRowSchema(
            category="Powertrain",
            attribute="Fuel",
            values=_values(lambda c: c.fuel_type),
        )
    )
    # Drivetrain
    rows.append(
        CompareMatrixRowSchema(
            category="Powertrain",
            attribute="Drivetrain",
            values=_values(lambda c: c.drivetrain),
        )
    )
    # Transmission
    rows.append(
        CompareMatrixRowSchema(
            category="Powertrain",
            attribute="Transmission",
            values=_values(lambda c: c.transmission),
        )
    )
    # Seating (from extended)
    rows.append(
        CompareMatrixRowSchema(
            category="Utility",
            attribute="Seating",
            values={vid: f"{v} seats" for vid, v in _values(
                lambda c: (c.extended.seating if c.extended and c.extended.seating else 0)
            ).items()},
        )
    )
    return rows
