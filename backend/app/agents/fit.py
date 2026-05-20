from langchain_core.messages import SystemMessage, HumanMessage
from schemas.state import ScoutState
from schemas.research import FitAnalyzer
from config import config

FIT_ANALYZER_INSTRUCTION = """
You are an expert hiring intelligence and candidate fit evaluation system.

Your task is to evaluate how well the candidate profile matches the target role.

--- JOB INFORMATION ---
Company: {company_name}
Role: {role_title}
Target Seniority: {seniority}
Required Skills: {required_skills}

--- CANDIDATE PROFILE ---
Name: {candidate_name}
Experience: {experience_years} years
Preferred Roles: {preferred_roles}
Location: {location}
Hard Skills: {hard_skills}
Soft Skills: {soft_skills}
Projects: {projects}

--- EVALUATION RULES ---
1. Compare skills against requirements (technical overlap, experience, projects, seniority, role fit).
2. Project deployment weight: production > public > internal > not_deployed.
3. Penalise: missing mandatory skills, seniority mismatch, weak project evidence, low experience.
4. Do not hallucinate experience or skills not in the profile.
5. Prefer conservative scoring. A 4/10 with accurate gaps beats an inflated 7/10.
6. Output strictly following the provided schema.
"""


def fit_analyzer(state: ScoutState) -> dict:
    """Compares candidate profile against JD requirements. No search tools — reads from state only."""
    llm = config.llm
    parsed_jd = state.parsed_jd
    profile = state.profile

    instruction = FIT_ANALYZER_INSTRUCTION.format(
        company_name=parsed_jd.company_name,
        role_title=parsed_jd.role_title,
        seniority=parsed_jd.seniority_level,
        required_skills=parsed_jd.required_skills,
        candidate_name=profile.name,
        experience_years=profile.experience_years,
        preferred_roles=profile.preferred_roles,
        location=profile.location,
        hard_skills=profile.skills.hard_skills,
        soft_skills=profile.skills.soft_skills,
        projects=profile.projects
    )

    result = llm.with_structured_output(FitAnalyzer).invoke([
        SystemMessage(content=instruction),
        HumanMessage(content="Evaluate candidate fit. Return JSON only.")
    ])

    return {"results": [result.model_dump()]}