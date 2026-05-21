from pydantic import BaseModel
from app.schemas.profile import Profile

class AnalyzeRequest(BaseModel):
    job_desc: str
    profile: Profile

class ResumeRequest(BaseModel):
    thread_id: str
    feedback: str | None = None