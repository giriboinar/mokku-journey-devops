# ---- build stage: install dependencies ------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /build
COPY requirements.txt .
# Install into a prefix so the runtime stage can copy a clean site-packages tree.
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ---- runtime stage ----------------------------------------------------------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Patch OS packages so Trivy finds no HIGH/CRITICAL CVEs in the final image.
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Upgrade pip: the base image ships pip 25.0.1 (CVE-2026-8643, fixed in 26.1.2).
RUN pip install --no-cache-dir --upgrade pip

# Non-root runtime user.
RUN useradd --create-home --uid 10001 appuser

WORKDIR /srv/app

# Copy installed dependencies and application code. No secrets are baked in.
COPY --from=builder /install /usr/local
COPY app/ ./app/
COPY data/ ./data/

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import sys, urllib.request; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/api/health').status == 200 else 1)"

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
