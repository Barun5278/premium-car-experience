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
# Regression tests for the Supabase order/range/limit bug
#
# Background: in postgrest-py 2.x, ``client.table(x).select(...)`` returns
# a ``SyncSelectRequestBuilder`` which has ``order``/``range``/``limit``.
# Any call to a filter method (``eq``, ``gte``, ``in_``, ``text_search``)
# returns a ``SyncFilterRequestBuilder`` which has NONE of those. Calling
# ``.order()`` on a filter builder raises:
#   AttributeError: 'SyncQueryRequestBuilder' object has no attribute 'order'
#
# The fix in car_service.get_cars is to apply order/range/limit BEFORE
# any filter, so the chain stays on the select builder while those calls
# happen. These tests assert the SDK behaviour directly so that future
# upgrades of postgrest-py / supabase-py cannot silently regress the fix.
# -------------------------------------------------------------------
def test_postgrest_select_builder_has_order_range_limit():
    """The select builder supports the trio; the filter builder must not."""
    from postgrest._sync.request_builder import (
        SyncFilterRequestBuilder,
        SyncSelectRequestBuilder,
    )
    assert hasattr(SyncSelectRequestBuilder, "order"), (
        "postgrest-py upgrade: SyncSelectRequestBuilder no longer has .order(); "
        "the CarService fix may need to change."
    )
    assert hasattr(SyncSelectRequestBuilder, "range"), (
        "postgrest-py upgrade: SyncSelectRequestBuilder no longer has .range(); "
        "the CarService fix may need to change."
    )
    assert hasattr(SyncSelectRequestBuilder, "limit"), (
        "postgrest-py upgrade: SyncSelectRequestBuilder no longer has .limit(); "
        "the CarService fix may need to change."
    )
    assert not hasattr(SyncFilterRequestBuilder, "order"), (
        "postgrest-py upgrade: SyncFilterRequestBuilder now has .order(); "
        "review whether the CarService order-before-filter guard is still needed."
    )


def test_list_cars_sort_by_price_desc_runs_without_500(c: TestClient):
    """
    Regression: ?sort_by=price_desc previously triggered
    ``AttributeError: 'SyncQueryRequestBuilder' object has no attribute 'order'``
    on every list call. The fix moves .order() before any filter, so this
    must now return 200 and an ordered (descending by price) list.
    """
    resp = c.get("/api/v1/cars?sort_by=price_desc&limit=10")
    assert resp.status_code == 200, resp.text
    items = resp.json()["items"]
    prices = [i["price"] for i in items]
    assert prices == sorted(prices, reverse=True), f"prices not desc: {prices}"


def test_list_cars_search_runs_without_500(c: TestClient):
    """
    Regression: ?search=... previously chained .text_search() then .order(),
    which raised AttributeError because .text_search() downgrades the
    builder. The fix calls .order()/.range() before .text_search().
    """
    resp = c.get("/api/v1/cars?search=porsche&limit=10")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    # Whether or not the fake has populated search_text for the test fixture,
    # the call must complete without a 500. The body is at least well-formed.
    assert "items" in body
    assert "total" in body


def test_list_cars_search_with_filter_and_sort_runs_without_500(c: TestClient):
    """
    Regression: the original failing call combined text_search + filters +
    order. We re-create that exact combination to make sure the
    order-before-filter guard covers all three.
    """
    resp = c.get("/api/v1/cars?search=Porsche&body_type=Sedan&sort_by=price_desc&limit=10")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "items" in body
    assert "total" in body
    for item in body["items"]:
        assert item["bodyType"] == "Sedan"
        assert item["make"] == "Porsche"


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
    # Regression tests for the Supabase order/range/limit bug.
    ("test_postgrest_select_builder_has_order_range_limit", test_postgrest_select_builder_has_order_range_limit),
    ("test_list_cars_sort_by_price_desc_runs_without_500", test_list_cars_sort_by_price_desc_runs_without_500),
    ("test_list_cars_search_runs_without_500", test_list_cars_search_runs_without_500),
    ("test_list_cars_search_with_filter_and_sort_runs_without_500", test_list_cars_search_with_filter_and_sort_runs_without_500),
]


def main() -> int:
    c = make_client()
    results: List[TestResult] = []
    for name, fn in TEST_FUNCTIONS:
        # Tests that take no arguments (e.g. pure-Python SDK assertions) or
        # that build their own client (e.g. test_list_cars_empty_when_no_client)
        # are invoked without the shared TestClient.
        if name == "test_list_cars_empty_when_no_client":
            results.append(run(name, fn))
        elif name == "test_postgrest_select_builder_has_order_range_limit":
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
