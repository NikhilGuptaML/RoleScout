from pydantic import BaseModel
from typing import List, Literal, Annotated

class Skills(BaseModel):
    """A single skill extracted from a job description."""
    name: str
    level: str | None = None
    mandatory: bool = True


class RequiredSkills(BaseModel):
    """Classified skill set from the JD."""
    hard_skills: List[Skills]
    soft_skills: List[Skills]


class Flag(BaseModel):
    """A hiring signal extracted from the JD."""
    flag_type: Literal["Red", "Green"]
    desc: str


class JDParserOutput(BaseModel):
    """Structured output of the JD parsing agent."""
    company_name: str
    role_title: str
    required_skills: RequiredSkills
    seniority_level: Literal[
        "Intern", "Junior", "Mid-Level",
        "Senior", "Staff", "Principal", "Leadership"
    ]
    flags: List[Flag]