import os
import uuid

from fastapi import FastAPI, Security, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

from app.graph.orchestration import graph
from app.schema import AnalyzeRequest, ResumeRequest
import uvicorn

app = FastAPI()

# ── CORS ────────────────────────────────────────────────────
# Set CORS_ORIGINS in .env, e.g. "https://frontend-xxx.up.railway.app"
# Multiple origins can be comma-separated.
_origins = os.getenv("CORS_ORIGINS", "*")
allow_origins = [o.strip() for o in _origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API-key auth ────────────────────────────────────────────
API_KEY = os.getenv("API_KEY")
api_key_header = APIKeyHeader(name="X-API-Key")


def verify_api_key(key: str = Security(api_key_header)):
    if key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


# ── Endpoints ───────────────────────────────────────────────
@app.post("/analyze")
async def analyze(request: AnalyzeRequest, _=Security(verify_api_key)):
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


@app.post("/analyze/resume")
async def resume(request: ResumeRequest, _=Security(verify_api_key)):
    thread = {"configurable": {"thread_id": request.thread_id}}

    graph.update_state(
        thread,
        {"human_feedback": request.feedback},
        as_node="Human Feedback"
    )

    final_result = graph.invoke(None, thread)
    return {"final_report": final_result.get("final_report")}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)