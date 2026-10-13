"""Raja's Mokku Journey — FastAPI backend (API only).

Serves the 16-stage devotional journey content as JSON.

Configuration comes from environment variables (see README):
  CORS_ORIGINS — comma-separated list of allowed browser origins.
                 Defaults to local dev origins only.
"""

import logging
import os
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import health, stages
from app.services.logging_config import configure_logging

configure_logging()
logger = logging.getLogger("raja_journey")

app = FastAPI(
    title="Raja's Mokku Journey Backend",
    version="1.0.0",
    description="API for the Tirumala Tirupati Venkateswara Swamy — Raja's Mokku Journey web app.",
)

def _cors_origins() -> list:
    """Allowed browser origins, from CORS_ORIGINS (comma-separated).

    Defaults to local development origins only. In production nginx serves
    the frontend and proxies /api from the same origin, so browsers make
    no cross-origin requests and this list is effectively unused — but it
    must never be "*" with credentials allowed.
    """
    raw = os.environ.get("CORS_ORIGINS", "http://localhost:8080,http://localhost:3000")
    return [o.strip() for o in raw.split(",") if o.strip()]


# API-only service. Origins are explicit — never a wildcard — so the
# browser's same-origin policy actually protects the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(stages.router, prefix="/api")

# Prometheus metrics at /metrics. Optional dependency: skipped cleanly
# with a warning when the instrumentation package is not installed.
try:
    from prometheus_fastapi_instrumentator import Instrumentator
except ImportError:
    logger.warning("prometheus_fastapi_instrumentator not installed; /metrics disabled")
else:
    Instrumentator().instrument(app).expose(app)


@app.middleware("http")
async def request_logging(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start = time.perf_counter()
    logger.info(
        "request started",
        extra={"request_id": request_id, "method": request.method, "path": request.url.path},
    )
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "request finished",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "elapsed_ms": elapsed_ms,
        },
    )
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled error", extra={"path": request.url.path})
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": "An unexpected error occurred."},
    )

