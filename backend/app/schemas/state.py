import operator
from pydantic import BaseModel,Field
from typing import List,Annotated
from schemas.jd import JDParserOutput
from schemas.profile import Profile

class ScoutState(BaseModel):
    """Shared state passed through the entire RoleScout graph."""
    job_desc: str
    profile: Profile
    parsed_jd: JDParserOutput | None = None
    human_feedback: str | None = None
    # operator.add reducer: parallel agents append without overwriting
    results: Annotated[list[dict], operator.add] = Field(default_factory=list)
    final_report: str | None = None