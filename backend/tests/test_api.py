"""API tests for the Raja's Mokku Journey backend.

Run from the repo root:
    python -m pytest backend/tests -q
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import stage_service

client = TestClient(app)


def test_health_returns_200_with_expected_payload():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {
        "status": "ok",
        "service": "raja-journey-backend",
        "version": "1.0.0",
    }


def test_stages_list_has_16_stages_with_telugu_titles():
    resp = client.get("/api/stages")
    assert resp.status_code == 200
    stages = resp.json()
    assert len(stages) == 16
    ids = [s["id"] for s in stages]
    assert ids == list(range(1, 17))
    for stage in stages:
        assert stage["title_en"], f"missing English title for stage {stage['id']}"
        assert stage["title_te"], f"missing Telugu title for stage {stage['id']}"
        assert stage["image"].startswith("assets/images/stage-")
        assert stage["order"] == stage["id"]


def test_stage_detail_returns_full_bilingual_payload():
    resp = client.get("/api/stages/13")
    assert resp.status_code == 200
    stage = resp.json()
    assert stage["id"] == 13
    assert stage["title_en"]
    assert stage["title_te"]
    assert len(stage["desc_en"]) > 50
    assert len(stage["desc_te"]) > 50
    assert stage["alt_en"]
    assert stage["alt_te"]
    assert stage["image"] == "assets/images/stage-13.jpg"


def test_stage_detail_rejects_out_of_range_id_with_422():
    for bad_id in ("0", "17", "999", "abc"):
        resp = client.get(f"/api/stages/{bad_id}")
        assert resp.status_code == 422, f"expected 422 for stage id {bad_id}"
        assert resp.headers["content-type"].startswith("application/json")


def test_stage_detail_returns_404_json_when_stage_missing(monkeypatch):
    def _missing(stage_id: int):
        return None

    monkeypatch.setattr(stage_service, "get_stage", _missing)
    resp = client.get("/api/stages/5")
    assert resp.status_code == 404
    body = resp.json()
    assert body["detail"]["error"] == "stage_not_found"
    assert "5" in body["detail"]["message"]


def test_config_returns_route_and_app_settings():
    resp = client.get("/api/config")
    assert resp.status_code == 200
    config = resp.json()
    assert config["route"]["from"] == "Muddanur"
    assert config["route"]["to"] == "Tirupati"
    assert config["route"]["via"] == "Srivari Mettu"
    assert config["route"]["configurable"] is True
    assert config["stage_order"] == list(range(1, 17))
    assert config["app"]["title_en"] == "Raja's Mokku Journey"
    assert config["app"]["title_te"]
    assert config["app"]["default_lang"] == "en"
    assert config["app"]["music_muted_by_default"] is True


def test_unknown_path_returns_json_404():
    resp = client.get("/api/nope")
    assert resp.status_code == 404
    assert resp.headers["content-type"].startswith("application/json")


@pytest.mark.parametrize("stage_id", list(range(1, 17)))
def test_every_stage_detail_is_reachable(stage_id):
    resp = client.get(f"/api/stages/{stage_id}")
    assert resp.status_code == 200
