# Raja's Mokku Journey — Backend

FastAPI API-only backend for the **Tirumala Tirupati Venkateswara Swamy —
Raja's Mokku Journey** devotional web app. It serves the 16-stage bilingual
(English + Telugu) journey content as JSON. Journey content lives in
`backend/data/*.json`, separate from application code.

## Endpoints

| Method | Path                | Description                                  |
| ------ | ------------------- | -------------------------------------------- |
| GET    | `/api/health`       | Health check → `{"status":"ok",...}`         |
| GET    | `/api/stages`       | List of 16 stages (id, titles, image, order) |
| GET    | `/api/stages/{id}`  | Full stage detail (bilingual desc + alt text)|
| GET    | `/api/config`       | Route config, stage order, app settings      |

Unknown stage ids return a JSON `404`; out-of-range or non-integer ids
return a JSON `422`. All responses are JSON; request/response logging is
structured single-line JSON. No secrets are used anywhere in this service.

## Local startup

```bash
cd tirumala-rajas-mokku-journey/backend

# create a virtualenv (Python 3.12)
python3.12 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

# run the API (reload for development)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open http://localhost:8000/api/health to verify, or
http://localhost:8000/docs for the interactive API docs.

## Tests

From the repo root:

```bash
python -m pytest backend/tests -q
```

## Docker

```bash
cd tirumala-rajas-mokku-journey/backend
docker build -t raja-journey-backend:1.0.0 .
docker run --rm -p 8000:8000 raja-journey-backend:1.0.0
```

The image runs as a non-root user and includes a `HEALTHCHECK` against
`/api/health`. No secrets are baked into image layers.

## Project layout

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, request logging
│   ├── models/schemas.py    # Pydantic response models
│   ├── routes/              # health.py, stages.py
│   └── services/            # stage_service.py (JSON data loader), logging_config.py
├── data/
│   ├── stages.json          # 16 stages, English + Telugu
│   └── config.json          # route config + app settings
├── tests/test_api.py        # pytest API tests
├── requirements.txt         # pinned dependencies
└── Dockerfile               # multi-stage, non-root, health-checked
```
