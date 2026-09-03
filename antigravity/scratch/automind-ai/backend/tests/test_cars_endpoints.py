"""
Phase 2 — endpoint tests for the catalog-backed cars API.

This file is pytest-compatible. It does NOT run if pytest is not installed;
a standalone runner with the same cases is provided at
backend/tests/run_standalone.py.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.api.v1.api import api_router
from app.core.config import settings
from app.db import session as db_session
from app.services import car_service as svc_module
from main import app  # noqa: F401  -- ensures full route table is built

from tests.fake_supabase import FakeSupabaseClient


@pytest.fixture(autouse=True)
def _patch_supabase_client(monkeypatch):
    fake = FakeSupabaseClient()
    # Patch the module-level cache and the factory.
    monkeypatch.setattr(db_session, "_supabase_client", fake)
    monkeypatch.setattr(db_session, "get_supabase_client", lambda: fake)
    monkeypatch.setattr(svc_module, "get_supabase_client", lambda: fake)
    yield
    monkeypatch.setattr(db_session, "_supabase_client", None)


@pytest.fixture
def client():
    return TestClient(app)


# -------------------------------------------------------------------
# GET /api/v1/cars
# -------------------------------------------------------------------
def test_list_cars_returns_paginated_envelope(client):
    resp = client.get("/api/v1/cars?limit=10")
    assert resp.status_code == 200
    body = resp.json()
    assert "items" in body and "total" in body
    assert "page" in body and "limit" in body
    assert "totalPages" in body
    assert body["limit"] == 10
    assert body["page"] == 1
    assert body["total"] == 5
    assert len(body["items"]) == 5


def test_list_cars_assembles_make_from_brand(client):
    resp = client.get("/api/v1/cars?limit=10")
    items = resp.json()["items"]
    makes = sorted({i["make"] for i in items})
    assert makes == ["BMW", "Ferrari", "Lucid", "Porsche"]


def test_list_cars_filters_by_make(client):
    resp = client.get("/api/v1/cars?make=Porsche&limit=10")
    items = resp.json()["items"]
    assert all(i["make"] == "Porsche" for i in items)
    assert len(items) == 2


def test_list_cars_filters_by_body_type(client):
    resp = client.get("/api/v1/cars?body_type=Sedan&limit=10")
    items = resp.json()["items"]
    assert all(i["bodyType"] == "Sedan" for i in items)
    assert len(items) == 3  # Taycan, Lucid, M3


def test_list_cars_filters_by_min_price_and_max_price(client):
    resp = client.get("/api/v1/cars?min_price=200000&max_price=260000&limit=10")
    items = resp.json()["items"]
    for i in items:
        assert 200000 <= i["price"] <= 260000
    ids = {i["id"] for i in items}
    assert "porsche-taycan-turbo-s-2025" in ids
    assert "lucid-air-sapphire-2024" in ids


def test_list_cars_filters_by_min_horsepower(client):
    resp = client.get("/api/v1/cars?min_horsepower=900&limit=10")
    items = resp.json()["items"]
    for i in items:
        assert i["specs"]["horsepower"] >= 900
    ids = {i["id"] for i in items}
    assert "porsche-taycan-turbo-s-2025" in ids
    assert "lucid-air-sapphire-2024" in ids
    assert "porsche-911-gt3-rs-2024" not in ids


def test_list_cars_featured(client):
    resp = client.get("/api/v1/cars/featured")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 4
    for i in items:
        assert i["isFeatured"] is True


def test_list_cars_pagination_clamps_limit(client):
    resp = client.get("/api/v1/cars?limit=500")
    # Pydantic Query validation rejects limit > 100.
    assert resp.status_code == 422


# -------------------------------------------------------------------
# GET /api/v1/cars/{id}
# -------------------------------------------------------------------
def test_get_car_by_id_known(client):
    resp = client.get("/api/v1/cars/porsche-911-gt3-rs-2024")
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == "porsche-911-gt3-rs-2024"
    assert body["make"] == "Porsche"
    assert body["trim"] == "Weissach Package"
    assert body["specs"]["horsepower"] == 518
    assert body["specs"]["torque"] == 342
    assert body["specs"]["zeroToSixty"] == 3.0
    assert body["specs"]["rangeOrMpg"] == "18 mpg"  # ICE
    assert body["media"]["thumbnailUrl"] == "https://x/primary.jpg"
    assert "https://x/gallery1.jpg" in body["media"]["galleryUrls"]
    assert body["media"]["model3dUrl"] == "https://x/model.glb"
    assert len(body["media"]["hotspots"]) == 1
    assert body["media"]["hotspots"][0]["label"] == "Rear Wing"
    assert body["highlights"] == ["Track Focused", "Naturally Aspirated"]
    # Extended fields
    ext = body["extended"]
    assert ext["safetyRating"] == 5.0
    assert ext["seating"] == 2
    assert ext["engine"] == "4.0L NA Boxer-6"
    assert ext["featureNames"] == ["Active Aerodynamics", "PCCB Brakes"]
    assert "sports" in ext["categorySlugs"]
    assert ext["dimensions"]["length_mm"] == 4572


def test_get_car_by_id_ev_synthesizes_range(client):
    resp = client.get("/api/v1/cars/porsche-taycan-turbo-s-2025")
    body = resp.json()
    assert body["specs"]["rangeOrMpg"] == "360 mi range"
    assert body["extended"]["featureNames"] == ["800V Charging"]
    assert set(body["extended"]["categorySlugs"]) == {"sedan", "electric"}


def test_get_car_by_id_unknown_returns_404(client):
    resp = client.get("/api/v1/cars/does-not-exist")
    assert resp.status_code == 404


# -------------------------------------------------------------------
# GET /api/v1/cars/compare
# -------------------------------------------------------------------
def test_compare_two_cars(client):
    resp = client.get("/api/v1/cars/compare?ids=porsche-911-gt3-rs-2024,lucid-air-sapphire-2024")
    assert resp.status_code == 200
    body = resp.json()
    assert "cars" in body and "comparisonMatrix" in body
    assert len(body["cars"]) == 2
    matrix = body["comparisonMatrix"]
    attrs = {row["attribute"] for row in matrix}
    assert {"Price", "Horsepower", "Torque", "0-60 mph", "Top Speed", "Range / MPG"} <= attrs
    # Horsepower winner is Lucid (1234 > 518).
    hp_row = next(r for r in matrix if r["attribute"] == "Horsepower")
    assert hp_row["winnerVehicleId"] == "lucid-air-sapphire-2024"
    # Price winner is Porsche (cheaper).
    price_row = next(r for r in matrix if r["attribute"] == "Price")
    assert price_row["winnerVehicleId"] == "porsche-911-gt3-rs-2024"


def test_compare_rejects_single_id(client):
    resp = client.get("/api/v1/cars/compare?ids=porsche-911-gt3-rs-2024")
    assert resp.status_code == 400


def test_compare_dedupes_ids(client):
    resp = client.get(
        "/api/v1/cars/compare?ids=porsche-911-gt3-rs-2024,porsche-911-gt3-rs-2024,lucid-air-sapphire-2024"
    )
    assert resp.status_code == 200
    body = resp.json()
    ids = [c["id"] for c in body["cars"]]
    assert len(ids) == len(set(ids))  # deduped
    assert len(ids) == 2


def test_compare_missing_id_silently_skipped(client):
    resp = client.get(
        "/api/v1/cars/compare?ids=porsche-911-gt3-rs-2024,does-not-exist,lucid-air-sapphire-2024"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["cars"]) == 2
    ids = {c["id"] for c in body["cars"]}
    assert "does-not-exist" not in ids


# -------------------------------------------------------------------
# Empty / missing-client behavior
# -------------------------------------------------------------------
def test_list_cars_empty_when_no_client(client, monkeypatch):
    monkeypatch.setattr(svc_module, "get_supabase_client", lambda: None)
    resp = client.get("/api/v1/cars?limit=5")
    assert resp.status_code == 200
    body = resp.json()
    assert body == {
        "items": [],
        "total": 0,
        "page": 1,
        "limit": 5,
        "totalPages": 0,
    }


# -------------------------------------------------------------------
# Regression tests for the Supabase order/range/limit bug
#
# Background: in postgrest-py 2.x, ``client.table(x).select(...)`` returns
# a ``SyncSelectRequestBuilder`` which has ``order``/``range``/``limit``.
# Any call to a filter method (``eq``, ``gte``, ``in_``, ``text_search``)
# returns a ``SyncFilterRequestBuilder`` which has NONE of those. Calling
# ``.order()`` on a filter builder raises:
#   AttributeError: 'SyncQueryRequestBuilder' object has no attribute 'order'
# -------------------------------------------------------------------
def test_postgrest_select_builder_has_order_range_limit():
    from postgrest._sync.request_builder import (
        SyncFilterRequestBuilder,
        SyncSelectRequestBuilder,
    )
    assert hasattr(SyncSelectRequestBuilder, "order")
    assert hasattr(SyncSelectRequestBuilder, "range")
    assert hasattr(SyncSelectRequestBuilder, "limit")
    assert not hasattr(SyncFilterRequestBuilder, "order")


def test_list_cars_sort_by_price_desc_runs_without_500(client):
    resp = client.get("/api/v1/cars?sort_by=price_desc&limit=10")
    assert resp.status_code == 200, resp.text
    items = resp.json()["items"]
    prices = [i["price"] for i in items]
    assert prices == sorted(prices, reverse=True)


def test_list_cars_search_runs_without_500(client):
    resp = client.get("/api/v1/cars?search=porsche&limit=10")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "items" in body
    assert "total" in body


def test_list_cars_search_with_filter_and_sort_runs_without_500(client):
    resp = client.get(
        "/api/v1/cars?search=Porsche&body_type=Sedan&sort_by=price_desc&limit=10"
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "items" in body
    assert "total" in body
    for item in body["items"]:
        assert item["bodyType"] == "Sedan"
        assert item["make"] == "Porsche"
