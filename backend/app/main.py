import os
import uuid
import logging
from urllib.parse import urlparse

from fastapi import FastAPI, Security, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from fastapi.responses import JSONResponse

from app.graph.orchestration import graph
from app.schema import AnalyzeRequest, ResumeRequest
import uvicorn

logger = logging.getLogger(__name__)

app = FastAPI(title="RoleScout API", version="1.0.0")

# ── Environment ─────────────────────────────────────────────
IS_PRODUCTION = os.getenv("RAILWAY_ENVIRONMENT") is not None or os.getenv("ENVIRONMENT", "").lower() == "production"

# ── CORS ────────────────────────────────────────────────────
# Set CORS_ORIGINS in .env, e.g. "https://frontend-xxx.up.railway.app"
# Multiple origins can be comma-separated.
_origins = os.getenv("CORS_ORIGINS", "*")


def _normalize_cors_origins(raw_origins: str) -> list[str]:
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    if "*" in origins:
        return ["*"]

    normalized: list[str] = []
    for origin in origins:
        if origin not in normalized:
            normalized.append(origin)

        parsed = urlparse(origin)
        if parsed.scheme in {"http", "https"} and parsed.hostname in {"localhost", "127.0.0.1"}:
            default_port = 80 if parsed.scheme == "http" else 443
            if parsed.port is None:
                variant = f"{parsed.scheme}://{parsed.hostname}:{default_port}"
                if variant not in normalized:
                    normalized.append(variant)
            elif parsed.port == default_port:
                variant = f"{parsed.scheme}://{parsed.hostname}"
                if variant not in normalized:
                    normalized.append(variant)

    # Only add localhost origins in non-production environments
    if not IS_PRODUCTION:
        for local_origin in (
            "http://localhost",
            "http://localhost:80",
            "http://localhost:5173",
            "http://127.0.0.1",
            "http://127.0.0.1:80",
            "http://127.0.0.1:5173",
        ):
            if local_origin not in normalized:
                normalized.append(local_origin)

    return normalized


allow_origins = _normalize_cors_origins(_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials="*" not in allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API-key auth ────────────────────────────────────────────
API_KEY = os.getenv("API_KEY")
api_key_header = APIKeyHeader(name="X-API-Key")

if not API_KEY:
    logger.warning(
        "⚠️  API_KEY is not set! All authenticated endpoints will reject requests. "
        "Set the API_KEY environment variable."
    )


def verify_api_key(key: str = Security(api_key_header)):
    if not API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Server misconfiguration: API_KEY not set"
        )
    if key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


# ── Global exception handler ───────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


# ── Endpoints ───────────────────────────────────────────────
@app.post("/analyze")
async def analyze(request: AnalyzeRequest, _=Security(verify_api_key)):
    try:
        thread_id = str(uuid.uuid4())
        thread = {"configurable": {"thread_id": thread_id}}

        result = graph.invoke({
            "job_desc": request.job_desc,
            "parsed_jd": None,
            "human_feedback": None,
            "final_report": None,
            "profile": request.profile
        }, thread)

        return {
            "thread_id": thread_id,
            "parsed_jd": result.get("parsed_jd")
        }
    except Exception as e:
        logger.exception("Error in /analyze")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {type(e).__name__}")


@app.post("/analyze/resume")
async def resume(request: ResumeRequest, _=Security(verify_api_key)):
    try:
        thread = {"configurable": {"thread_id": request.thread_id}}

        graph.update_state(
            thread,
            {"human_feedback": request.feedback},
            as_node="Human Feedback"
        )

        final_result = graph.invoke(None, thread)
        return {"final_report": final_result.get("final_report")}
    except Exception as e:
        logger.exception("Error in /analyze/resume for thread %s", request.thread_id)
        raise HTTPException(status_code=500, detail=f"Resume failed: {type(e).__name__}")


@app.get("/health")
async def health():
    """Health check endpoint for Railway / load balancers."""
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)