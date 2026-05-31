from pydantic import BaseModel, Field
from app.schemas.profile import Profile


class AnalyzeRequest(BaseModel):
    job_desc: str = Field(..., min_length=50, max_length=50_000, description="Raw job description text")
    profile: Profile


class ResumeRequest(BaseModel):
    thread_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-f0-9\-]+$")
    feedback: str | None = Field(default=None, max_length=5_000)