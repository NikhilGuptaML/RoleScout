from typing import List
from pydantic import BaseModel,Field
class CompanyResearcher(BaseModel):
    """Output of the Company Research agent."""
    company_name: str
    what_they_do: str
    recent_news: List[str]
    tech_stack: List[str]
    culture_signals: List[str]
    red_flags: List[str]
    funding_projects: List[str]
    product_launches: List[str]
    glassdoor_culture_review: List[str]
    leadership_changes: List[str]
    layoffs: List[str]


class RoleResearcher(BaseModel):
    """Output of the Role Research agent."""
    actual_responsibilities: List[str]
    must_have_skills: List[str]
    nice_to_have_skills: List[str]
    typical_interview_format: List[str]
    salary_range: str


class FitAnalyzer(BaseModel):
    """Output of the Fit Analyzer agent."""
    strong_matches: List[str]
    gaps: List[str]
    talking_points: List[str]
    fit_score: int = Field(ge=1, le=10)