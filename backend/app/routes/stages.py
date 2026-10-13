"""Journey stage and configuration routes."""

import logging

from fastapi import APIRouter, HTTPException, Path

from app.models.schemas import ErrorResponse, JourneyConfig, StageDetail, StageSummary
from app.services import stage_service

logger = logging.getLogger("raja_journey.routes")
router = APIRouter(tags=["journey"])


@router.get("/stages", response_model=list[StageSummary])
async def list_stages() -> list[StageSummary]:
    stages = stage_service.get_stages()
    logger.info("stages listed", extra={"count": len(stages)})
    return stages


@router.get(
    "/stages/{stage_id}",
    response_model=StageDetail,
    responses={404: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
)
async def stage_detail(
    stage_id: int = Path(..., ge=1, le=16, description="Stage id, must be 1-16"),
) -> StageDetail:
    stage = stage_service.get_stage(stage_id)
    if stage is None:
        raise HTTPException(
            status_code=404,
            detail={"error": "stage_not_found", "message": f"No stage found with id {stage_id}"},
        )
    return stage


@router.get("/config", response_model=JourneyConfig)
async def get_config() -> JourneyConfig:
    config = stage_service.get_config()
    logger.info("config served")
    return config
