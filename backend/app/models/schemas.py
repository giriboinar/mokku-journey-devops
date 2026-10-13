"""Pydantic response schemas for the Raja's Mokku Journey API."""

from pydantic import BaseModel, Field


class StageSummary(BaseModel):
    """Lightweight stage representation for the stage list endpoint."""

    id: int = Field(..., ge=1, le=16, description="Stage number, 1-16")
    title_en: str
    title_te: str
    image: str = Field(..., description="Relative frontend asset path, e.g. assets/images/stage-01.jpg")
    order: int = Field(..., ge=1, le=16, description="Display order of the stage")


class StageDetail(StageSummary):
    """Full stage representation including bilingual descriptions and alt text."""

    desc_en: str
    desc_te: str
    alt_en: str
    alt_te: str


class RouteConfig(BaseModel):
    from_: str = Field(..., alias="from")
    to: str
    via: str
    configurable: bool


class AppConfig(BaseModel):
    title_en: str
    title_te: str
    default_lang: str
    music_muted_by_default: bool


class JourneyConfig(BaseModel):
    route: RouteConfig
    stage_order: list[int]
    app: AppConfig


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class ErrorResponse(BaseModel):
    error: str
    message: str
