from enum import Enum
from pydantic import BaseModel , Field
from typing import List, Literal, Annotated


class Skill(BaseModel):
    """A candidate's skill with self-assessed proficiency (1–10)."""
    name: str
    proficiency: int = Field(ge=1, le=10)


class MySkill(BaseModel):
    hard_skills: List[Skill]
    soft_skills: List[Skill]


class DeploymentStatus(str, Enum):
    """Deployment tier of a project. Higher = more weight in fit scoring."""
    NOT_DEPLOYED = "not_deployed"
    INTERNAL = "internal"
    PUBLIC = "public"
    PRODUCTION = "production"


class Project(BaseModel):
    name: str
    tech_stack: List[str]
    deployment_status: DeploymentStatus


class Profile(BaseModel):
    """Candidate profile passed into the graph at invocation time."""
    name: str
    skills: MySkill
    experience_years: int
    projects: List[Project]
    preferred_roles: List[str]
    location: str