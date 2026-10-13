"""Stage data service.

Stage content lives in backend/data/*.json, separate from application code,
so journey content can be updated without code changes. Data files are
loaded once and cached in memory.
"""

import json
import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger("raja_journey.services")

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
STAGES_PATH = DATA_DIR / "stages.json"
CONFIG_PATH = DATA_DIR / "config.json"


def _read_json(path: Path) -> dict:
    try:
        with path.open(encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        logger.error("data file missing", extra={"path": str(path)})
        raise
    except json.JSONDecodeError as exc:
        logger.error("data file invalid json", extra={"path": str(path), "error": str(exc)})
        raise


@lru_cache(maxsize=1)
def _load_stages_payload() -> dict:
    payload = _read_json(STAGES_PATH)
    stages = payload.get("stages", [])
    logger.info("stages loaded", extra={"count": len(stages)})
    return payload


@lru_cache(maxsize=1)
def _load_config_payload() -> dict:
    return _read_json(CONFIG_PATH)


def get_stages() -> list[dict]:
    """Return all stages ordered by their display order."""
    stages = list(_load_stages_payload().get("stages", []))
    return sorted(stages, key=lambda s: s.get("order", s.get("id", 0)))


def get_stage(stage_id: int) -> dict | None:
    """Return a single stage by id, or None when unknown."""
    for stage in get_stages():
        if stage.get("id") == stage_id:
            return stage
    logger.warning("stage not found", extra={"stage_id": stage_id})
    return None


def get_config() -> dict:
    """Return the journey configuration payload."""
    return _load_config_payload()
