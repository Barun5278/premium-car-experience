"""
Standalone test runner for Phase 2 cars API tests.

This file is the executable equivalent of backend/tests/test_cars_endpoints.py.
It does not require pytest or pytest-asyncio — it can be run with:

    cd backend
    python -m tests.run_standalone

Each test prints PASS / FAIL with a short message. The script exits 0 on
success and 1 on any failure.
"""
from __future__ import annotations

import sys
import traceback
from typing import Callable, List, Tuple

from fastapi.testclient import TestClient

from app.db import session as db_session
from app.services import car_service as svc_module
from main import app

from tests.fake_supabase import FakeSupabaseClient


# -------------------------------------------------------------------
# Tiny test harness
# -------------------------------------------------------------------
class TestResult:
    def __init__(self, name: str):
        self.name = name
        self.passed = False
        self.error: str = ""

    def __repr__(self):
        status = "PASS" if self.passed else "FAIL"
        return f"[{status}] {self.name}"


def run(name: str, fn: Callable[[], None]) -> TestResult:
    r = TestResult(name)
    try:
        fn()
        r.passed = True
    except AssertionError as e:
        r.error = f"assertion failed: {e}"
    except Exception as e:  # noqa: BLE001
        r.error = f"{type(e).__name__}: {e}"
        traceback.print_exc()
    return r


# -------------------------------------------------------------------
# Fixtures
# -------------------------------------------------------------------
def make_client() -> TestClient:
    fake = FakeSupabaseClient()
    # Patch the cache and the factory at every import path used by the service.
    db_session._supabase_client = fake
    db_session.get_supabase_client = lambda: fake  # type: ignore[assignment]
    svc_module.get_supabase_client = lambda: fake  # type: ignore[assignment]
    return TestClient(app)


def make_empty_client() -> TestClient:
    db_session._supabase_client = None
    db_session.get_supabase_client = lambda: None  # type: ignore[assignment]
    svc_module.get_supabase_client = lambda: None  # type: ignore[assignment]
    return TestClient(app)


# -------------------------------------------------------------------
# Tests
# -------------------------------------------------------------------
def test_list_cars_returns_paginated_envelope(c: TestClient):
    resp = c.get("/api/v1/cars?limit=10")
    assert resp.status_code == 200
    body = resp.json()
    assert "items" in body and "total" in body
    assert "page" in body and "limit" in body
    assert "totalPages" in body
    assert body["limit"] == 10
    assert body["page"] == 1
    assert body["total"] == 5
    assert len(body["items"]) == 5


def test_list_cars_assembles_make_from_brand(c: TestClient):
    resp = c.get("/api/v1/cars?limit=10")
    items = resp.json()["items"]
    makes = sorted({i["make"] for i in items})
    assert makes == ["BMW", "Ferrari", "Lucid", "Porsche"]


def test_list_cars_filters_by_make(c: TestClient):
    resp = c.get("/api/v1/cars?make=Porsche&limit=10")
    items = resp.json()["items"]
    assert all(i["make"] == "Porsche" for i in items)
    assert len(items) == 2


def test_list_cars_filters_by_body_type(c: TestClient):
    resp = c.get("/api/v1/cars?body_type=Sedan&limit=10")
    items = resp.json()["items"]
    assert all(i["bodyType"] == "Sedan" for i in items)
    assert len(items) == 3


def test_list_cars_filters_by_min_max_price(c: TestClient):
    resp = c.get("/api/v1/cars?min_price=200000&max_price=260000&limit=10")
    items = resp.json()["items"]
    for i in items:
        assert 200000 <= i["price"] <= 260000
    ids = {i["id"] for i in items}
    assert "porsche-taycan-turbo-s-2025" in ids
    assert "lucid-air-sapphire-2024" in ids


def test_list_cars_filters_by_min_horsepower(c: TestClient):
    resp = c.get("/api/v1/cars?min_horsepower=900&limit=10")
    items = resp.json()["items"]
    for i in items:
        assert i["specs"]["horsepower"] >= 900
    ids = {i["id"] for i in items}
    assert "porsche-taycan-turbo-s-2025" in ids
    assert "lucid-air-sapphire-2024" in ids
    assert "porsche-911-gt3-rs-2024" not in ids


def test_list_cars_featured(c: TestClient):
    resp = c.get("/api/v1/cars/featured")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 4
    for i in items:
        assert i["isFeatured"] is True


def test_list_cars_pagination_clamps_limit(c: TestClient):
    resp = c.get("/api/v1/cars?limit=500")
    # Pydantic Query validation rejects limit > 100.
    assert resp.status_code == 422


def test_get_car_by_id_known(c: TestClient):
    resp = c.get("/api/v1/cars/porsche-911-gt3-rs-2024")
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == "porsche-911-gt3-rs-2024"
    assert body["make"] == "Porsche"
    assert body["trim"] == "Weissach Package"
    assert body["specs"]["horsepower"] == 518
    assert body["specs"]["torque"] == 342
    assert body["specs"]["zeroToSixty"] == 3.0
    assert body["specs"]["rangeOrMpg"] == "18 mpg"
    assert body["media"]["thumbnailUrl"] == "https://x/primary.jpg"
    assert "https://x/gallery1.jpg" in body["media"]["galleryUrls"]
    assert body["media"]["model3dUrl"] == "https://x/model.glb"
    assert len(body["media"]["hotspots"]) == 1
    assert body["media"]["hotspots"][0]["label"] == "Rear Wing"
    assert body["highlights"] == ["Track Focused", "Naturally Aspirated"]
    ext = body["extended"]
    assert ext["safetyRating"] == 5.0
    assert ext["seating"] == 2
    assert ext["engine"] == "4.0L NA Boxer-6"
    assert ext["featureNames"] == ["Active Aerodynamics", "PCCB Brakes"]
    assert "sports" in ext["categorySlugs"]
    assert ext["dimensions"]["length_mm"] == 4572


def test_get_car_by_id_ev_synthesizes_range(c: TestClient):
    resp = c.get("/api/v1/cars/porsche-taycan-turbo-s-2025")
    body = resp.json()
    assert body["specs"]["rangeOrMpg"] == "360 mi range"
    assert body["extended"]["featureNames"] == ["800V Charging"]
    assert set(body["extended"]["categorySlugs"]) == {"sedan", "electric"}


def test_get_car_by_id_unknown_returns_404(c: TestClient):
    resp = c.get("/api/v1/cars/does-not-exist")
    assert resp.status_code == 404


def test_compare_two_cars(c: TestClient):
    resp = c.get("/api/v1/cars/compare?ids=porsche-911-gt3-rs-2024,lucid-air-sapphire-2024")
    assert resp.status_code == 200
    body = resp.json()
    assert "cars" in body and "comparisonMatrix" in body
    assert len(body["cars"]) == 2
    matrix = body["comparisonMatrix"]
    attrs = {row["attribute"] for row in matrix}
    assert {"Price", "Horsepower", "Torque", "0-60 mph", "Top Speed", "Range / MPG"} <= attrs
    hp_row = next(r for r in matrix if r["attribute"] == "Horsepower")
    assert hp_row["winnerVehicleId"] == "lucid-air-sapphire-2024"
    price_row = next(r for r in matrix if r["attribute"] == "Price")
    assert price_row["winnerVehicleId"] == "porsche-911-gt3-rs-2024"


def test_compare_rejects_single_id(c: TestClient):
    resp = c.get("/api/v1/cars/compare?ids=porsche-911-gt3-rs-2024")
    assert resp.status_code == 400


def test_compare_dedupes_ids(c: TestClient):
    resp = c.get(
        "/api/v1/cars/compare?ids=porsche-911-gt3-rs-2024,porsche-911-gt3-rs-2024,lucid-air-sapphire-2024"
    )
    assert resp.status_code == 200
    body = resp.json()
    ids = [v["id"] for v in body["cars"]]
    assert len(ids) == len(set(ids))
    assert len(ids) == 2


def test_compare_missing_id_silently_skipped(c: TestClient):
    resp = c.get(
        "/api/v1/cars/compare?ids=porsche-911-gt3-rs-2024,does-not-exist,lucid-air-sapphire-2024"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["cars"]) == 2
    ids = {v["id"] for v in body["cars"]}
    assert "does-not-exist" not in ids


def test_list_cars_empty_when_no_client():
    c = make_empty_client()
    resp = c.get("/api/v1/cars?limit=5")
    assert resp.status_code == 200
    body = resp.json()
    assert body == {
        "items": [],
        "total": 0,
        "page": 1,
        "limit": 5,
        "totalPages": 0,
    }


def test_health_endpoint_still_works(c: TestClient):
    resp = c.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "healthy"


# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------
TEST_FUNCTIONS: List[Tuple[str, Callable]] = [
    ("test_list_cars_returns_paginated_envelope", test_list_cars_returns_paginated_envelope),
    ("test_list_cars_assembles_make_from_brand", test_list_cars_assembles_make_from_brand),
    ("test_list_cars_filters_by_make", test_list_cars_filters_by_make),
    ("test_list_cars_filters_by_body_type", test_list_cars_filters_by_body_type),
    ("test_list_cars_filters_by_min_max_price", test_list_cars_filters_by_min_max_price),
    ("test_list_cars_filters_by_min_horsepower", test_list_cars_filters_by_min_horsepower),
    ("test_list_cars_featured", test_list_cars_featured),
    ("test_list_cars_pagination_clamps_limit", test_list_cars_pagination_clamps_limit),
    ("test_get_car_by_id_known", test_get_car_by_id_known),
    ("test_get_car_by_id_ev_synthesizes_range", test_get_car_by_id_ev_synthesizes_range),
    ("test_get_car_by_id_unknown_returns_404", test_get_car_by_id_unknown_returns_404),
    ("test_compare_two_cars", test_compare_two_cars),
    ("test_compare_rejects_single_id", test_compare_rejects_single_id),
    ("test_compare_dedupes_ids", test_compare_dedupes_ids),
    ("test_compare_missing_id_silently_skipped", test_compare_missing_id_silently_skipped),
    ("test_list_cars_empty_when_no_client", test_list_cars_empty_when_no_client),
    ("test_health_endpoint_still_works", test_health_endpoint_still_works),
]


def main() -> int:
    c = make_client()
    results: List[TestResult] = []
    for name, fn in TEST_FUNCTIONS:
        # Tests that need a different client (empty case) handle their own.
        if name == "test_list_cars_empty_when_no_client":
            results.append(run(name, fn))
        else:
            results.append(run(name, lambda fn=fn: fn(c)))
    for r in results:
        print(r)
        if not r.passed and r.error:
            print(f"        {r.error}")
    passed = sum(1 for r in results if r.passed)
    total = len(results)
    print(f"\n{passed}/{total} tests passed.")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
