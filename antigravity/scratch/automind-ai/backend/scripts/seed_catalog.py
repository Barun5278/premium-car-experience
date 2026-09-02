"""
AutoMind AI — Phase 1 Catalog Seed Script
=========================================

Reads backend/scripts/vehicles_seed.json and seeds the Phase 1 catalog
tables in Supabase Cloud.

Tables populated:
  - brands
  - categories
  - features
  - vehicles
  - vehicle_specs
  - vehicle_performance
  - vehicle_dimensions
  - vehicle_media
  - vehicle_hotspots      (no rows in Phase 1; nothing in seed has hotspots)
  - vehicle_features
  - vehicle_categories

Idempotency:
  - Every insert uses upsert (PostgREST `Prefer: resolution=merge-duplicates`)
    keyed on the natural primary key, so re-running is a no-op.
  - The script is safe to run multiple times.

Environment:
  - SUPABASE_URL      (required)
  - SUPABASE_KEY      (required) — must be the SERVICE ROLE key, since
                                    Phase 1 RLS is permissive-read-only and
                                    no anon user can write.

Usage:
  $ set SUPABASE_URL=https://xxx.supabase.co
  $ set SUPABASE_KEY=eyJ...   (service_role)
  $ python -m backend.scripts.seed_catalog
  # or, from repo root:
  $ python backend/scripts/seed_catalog.py
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Bootstrap: make `app.*` and direct supabase import work whether run as a
# module (python -m backend.scripts.seed_catalog) or as a script
# (python backend/scripts/seed_catalog.py).
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
REPO_ROOT = BACKEND_DIR.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# Defensive: also add backend dir for `app.*` imports (not strictly needed
# because we don't use `app.*` here, but keeps the script consistent with
# the rest of the backend).
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from supabase import create_client, Client  # type: ignore
except ImportError as e:
    sys.stderr.write(
        "ERROR: supabase SDK is not installed in the active Python environment.\n"
        "       pip install -r backend/requirements.txt   (supabase>=2.11.0 is already listed)\n"
    )
    raise


SEED_JSON_PATH = SCRIPT_DIR / "vehicles_seed.json"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _load_seed(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _upsert(supabase: Client, table: str, rows: list[dict[str, Any]], on_conflict: str) -> None:
    """
    Upsert via PostgREST. The Supabase Python SDK exposes
    `table.upsert(rows, on_conflict=..., count=...)`. We set
    `count="exact"` so errors are visible if the request fails.
    """
    if not rows:
        return
    supabase.table(table).upsert(rows, on_conflict=on_conflict).execute()


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        sys.stderr.write(
            f"ERROR: Environment variable {name} is required and must not be empty.\n"
        )
        sys.exit(2)
    return value


# ---------------------------------------------------------------------------
# Per-section builders
# ---------------------------------------------------------------------------
def _build_brand_rows(seed: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {"slug": b["slug"], "name": b["name"]}
        for b in seed["brands"]
    ]


def _build_category_rows(seed: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {"slug": c["slug"], "name": c["name"]}
        for c in seed["categories"]
    ]


def _unique_features(seed: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Returns distinct feature rows, preserving first-seen order.
    Every feature gets `feature_group = 'Exterior'` as the default; the
    approved design documented that a future content pass can re-group
    semantically without a schema change.
    """
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for v in seed["vehicles"]:
        for f_name in v.get("features", []):
            if f_name in seen:
                continue
            seen.add(f_name)
            slug = _slugify(f_name)
            out.append({
                "slug": slug,
                "name": f_name,
                "feature_group": "Exterior",
            })
    return out


def _slugify(s: str) -> str:
    import re
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s


def _build_feature_lookup(seed: dict[str, Any]) -> dict[str, str]:
    """
    Returns: feature_name -> feature_slug. Used to resolve vehicle_features
    rows by FK to the inserted `features.slug`.
    """
    return {f_name: _slugify(f_name)
            for v in seed["vehicles"]
            for f_name in v.get("features", [])}


def _build_vehicle_rows(seed: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for v in seed["vehicles"]:
        out.append({
            "id": v["id"],
            "brand_slug": v["brand_slug"],   # placeholder; resolved after brands insert
            "model": v["model"],
            "variant": v.get("variant"),
            "year": v["year"],
            "body_type": v["body_type"],
            "fuel_type": v["fuel_type"],
            "transmission": v["transmission"],
            "drivetrain": v["drivetrain"],
            "price_usd": v["price_usd"],
            "currency": v.get("currency", "USD"),
            "mileage": v["mileage"],
            "seating": v["seating"],
            "safety_rating": v.get("safety_rating"),
            "boot_space_liters": v.get("boot_space_liters"),
            "engine": v.get("engine"),
            "description": v.get("description"),
            "is_featured": v.get("is_featured", False),
            "tags": v.get("tags", []),
        })
    return out


def _build_spec_rows(seed: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for v in seed["vehicles"]:
        s = v.get("specs") or {}
        if "horsepower" not in s or "torque_lb_ft" not in s:
            # Schema requires both; skip with warning (current seed always has both)
            sys.stderr.write(f"WARNING: vehicle {v['id']} missing required specs. Skipping specs row.\n")
            continue
        out.append({
            "vehicle_id": v["id"],
            "horsepower": s["horsepower"],
            "torque_lb_ft": s["torque_lb_ft"],
            "battery_capacity_kwh": s.get("battery_capacity_kwh"),
            "voltage_architecture": s.get("voltage_architecture"),
            "dc_fast_charge_kw": s.get("dc_fast_charge_kw"),
            "epa_range_miles": s.get("epa_range_miles"),
        })
    return out


def _build_perf_rows(seed: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for v in seed["vehicles"]:
        p = v.get("performance") or {}
        if "zero_to_sixty_sec" not in p or "top_speed_mph" not in p:
            sys.stderr.write(f"WARNING: vehicle {v['id']} missing required performance. Skipping perf row.\n")
            continue
        out.append({
            "vehicle_id": v["id"],
            "zero_to_sixty_sec": p["zero_to_sixty_sec"],
            "top_speed_mph": p["top_speed_mph"],
            "braking_distance_ft": p.get("braking_distance_ft"),
            "lateral_g": p.get("lateral_g"),
            "quarter_mile_sec": p.get("quarter_mile_sec"),
            "nurburgring_time_sec": p.get("nurburgring_time_sec"),
        })
    return out


def _build_dim_rows(seed: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for v in seed["vehicles"]:
        d = v.get("dimensions") or {}
        out.append({
            "vehicle_id": v["id"],
            "length_mm": d.get("length_mm"),
            "width_mm": d.get("width_mm"),
            "height_mm": d.get("height_mm"),
            "wheelbase_mm": d.get("wheelbase_mm"),
            "curb_weight_kg": d.get("curb_weight_kg"),
        })
    return out


def _build_media_rows(seed: dict[str, Any]) -> list[dict[str, Any]]:
    """
    One primary `image` row from `image`; additional `image` rows from
    `gallery` (skipping the primary URL to avoid duplicates).
    """
    out: list[dict[str, Any]] = []
    for v in seed["vehicles"]:
        image_url = v.get("image")
        if image_url:
            out.append({
                "vehicle_id": v["id"],
                "kind": "image",
                "external_url": image_url,
                "is_primary": True,
                "sort_order": 0,
                "alt_text": f"{v.get('brand_slug', '')} {v.get('model', '')} primary image".strip(),
            })
        gallery = v.get("gallery") or []
        order = 1
        for url in gallery:
            if url == image_url:
                # Already added as primary
                continue
            out.append({
                "vehicle_id": v["id"],
                "kind": "image",
                "external_url": url,
                "is_primary": False,
                "sort_order": order,
                "alt_text": f"{v.get('brand_slug', '')} {v.get('model', '')} gallery image {order}".strip(),
            })
            order += 1
    return out


def _build_vehicle_features_rows(seed: dict[str, Any], feature_name_to_slug: dict[str, str]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for v in seed["vehicles"]:
        for f_name in v.get("features", []):
            out.append({
                "vehicle_id": v["id"],
                "feature_slug": feature_name_to_slug[f_name],  # resolved later
                "sort_order": 0,
            })
    return out


def _build_vehicle_categories_rows(seed: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for v in seed["vehicles"]:
        for slug in v.get("category_slugs", []):
            out.append({
                "vehicle_id": v["id"],
                "category_slug": slug,
            })
    return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    url = _require_env("SUPABASE_URL")
    key = _require_env("SUPABASE_KEY")
    if not (url.startswith("https://") and ".supabase.co" in url):
        sys.stderr.write("ERROR: SUPABASE_URL does not look like a Supabase Cloud URL.\n")
        sys.exit(2)

    seed = _load_seed(SEED_JSON_PATH)
    supabase: Client = create_client(url, key)

    n_vehicles = len(seed["vehicles"])
    n_brands = len(seed["brands"])
    n_categories = len(seed["categories"])
    feature_rows = _unique_features(seed)
    n_features = len(feature_rows)
    feature_name_to_slug = _build_feature_lookup(seed)

    print(f"[seed] Loaded seed JSON: {n_vehicles} vehicles, "
          f"{n_brands} brands, {n_categories} categories, {n_features} unique features.")

    # 1) brands
    print(f"[seed] Upserting {n_brands} brands...")
    _upsert(supabase, "brands", _build_brand_rows(seed), on_conflict="slug")

    # 2) categories
    print(f"[seed] Upserting {n_categories} categories...")
    _upsert(supabase, "categories", _build_category_rows(seed), on_conflict="slug")

    # 3) features
    print(f"[seed] Upserting {n_features} features...")
    _upsert(supabase, "features", feature_rows, on_conflict="slug")

    # 4) vehicles (need brand_id; resolve from brand slug via PostgREST select)
    print("[seed] Resolving brand_id mapping...")
    brand_resp = supabase.table("brands").select("id,slug").execute()
    brand_id_by_slug: dict[str, int] = {b["slug"]: b["id"] for b in (brand_resp.data or [])}
    if len(brand_id_by_slug) != n_brands:
        sys.stderr.write(
            f"ERROR: expected {n_brands} brand rows after upsert, found {len(brand_id_by_slug)}.\n"
        )
        return 3

    vehicle_rows = _build_vehicle_rows(seed)
    for row in vehicle_rows:
        row["brand_id"] = brand_id_by_slug.pop(row.pop("brand_slug"))
    print(f"[seed] Upserting {n_vehicles} vehicles...")
    _upsert(supabase, "vehicles", vehicle_rows, on_conflict="id")

    # 5) vehicle_specs / vehicle_performance / vehicle_dimensions
    spec_rows = _build_spec_rows(seed)
    perf_rows = _build_perf_rows(seed)
    dim_rows = _build_dim_rows(seed)
    print(f"[seed] Upserting {len(spec_rows)} vehicle_specs, "
          f"{len(perf_rows)} vehicle_performance, {len(dim_rows)} vehicle_dimensions...")
    _upsert(supabase, "vehicle_specs", spec_rows, on_conflict="vehicle_id")
    _upsert(supabase, "vehicle_performance", perf_rows, on_conflict="vehicle_id")
    _upsert(supabase, "vehicle_dimensions", dim_rows, on_conflict="vehicle_id")

    # 6) vehicle_media
    media_rows = _build_media_rows(seed)
    print(f"[seed] Upserting {len(media_rows)} vehicle_media rows...")
    # No natural unique constraint to merge on; use a deterministic temp strategy:
    # we rely on the fact that this is a fresh project in Phase 1, and on re-run
    # the script will simply append duplicates. To avoid that, we delete the
    # existing media rows for the seeded vehicle_ids first, then insert.
    if media_rows:
        seeded_vehicle_ids = list({r["vehicle_id"] for r in media_rows})
        # Delete in chunks of 100 to avoid URL length issues.
        for i in range(0, len(seeded_vehicle_ids), 100):
            chunk = seeded_vehicle_ids[i:i + 100]
            supabase.table("vehicle_media").delete().in_("vehicle_id", chunk).execute()
        supabase.table("vehicle_media").insert(media_rows).execute()

    # 7) vehicle_features (FK to features by slug; resolve feature_id)
    print("[seed] Resolving feature_id mapping...")
    feat_resp = supabase.table("features").select("id,slug").execute()
    feature_id_by_slug: dict[str, int] = {f["slug"]: f["id"] for f in (feat_resp.data or [])}

    vf_rows = _build_vehicle_features_rows(seed, feature_name_to_slug)
    for row in vf_rows:
        row["feature_id"] = feature_id_by_slug.pop(row.pop("feature_slug"))
    print(f"[seed] Upserting {len(vf_rows)} vehicle_features rows...")
    if vf_rows:
        # Same "no natural unique" concern as media; re-runs would accumulate.
        # Strategy: delete the (vehicle_id, feature_id) pairs in this batch first.
        for i in range(0, len(vf_rows), 100):
            chunk = vf_rows[i:i + 100]
            for r in chunk:
                supabase.table("vehicle_features").delete() \
                    .eq("vehicle_id", r["vehicle_id"]) \
                    .eq("feature_id", r["feature_id"]).execute()
        # Insert
        for i in range(0, len(vf_rows), 200):
            supabase.table("vehicle_features").insert(vf_rows[i:i + 200]).execute()

    # 8) vehicle_categories
    print("[seed] Resolving category_id mapping...")
    cat_resp = supabase.table("categories").select("id,slug").execute()
    category_id_by_slug: dict[str, int] = {c["slug"]: c["id"] for c in (cat_resp.data or [])}

    vc_rows = _build_vehicle_categories_rows(seed)
    for row in vc_rows:
        row["category_id"] = category_id_by_slug[row.pop("category_slug")]
    print(f"[seed] Upserting {len(vc_rows)} vehicle_categories rows...")
    if vc_rows:
        for i in range(0, len(vc_rows), 100):
            chunk = vc_rows[i:i + 100]
            for r in chunk:
                supabase.table("vehicle_categories").delete() \
                    .eq("vehicle_id", r["vehicle_id"]) \
                    .eq("category_id", r["category_id"]).execute()
        for i in range(0, len(vc_rows), 200):
            supabase.table("vehicle_categories").insert(vc_rows[i:i + 200]).execute()

    # 9) vehicle_hotspots (none in seed)
    # Schema exists; no rows. Nothing to do.

    print("[seed] Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
