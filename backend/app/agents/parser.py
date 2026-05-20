from langchain_core.messages import SystemMessage, HumanMessage
from schemas.state import ScoutState
from schemas.jd import JDParserOutput
from config import config

PARSER_INSTRUCTION = """
You are an expert hiring intelligence and job description parsing system.

Your task is to accurately extract structured hiring information from the provided job description.

JOB DESCRIPTION:
{job_desc}

OPTIONAL HUMAN FEEDBACK:
{human_feedback}

Instructions:

1. Extract the company name exactly as mentioned.
2. Extract the role title exactly as mentioned.

3. Determine the seniority level based on:
   - years of experience required
   - ownership expectations
   - technical depth
   - leadership expectations
   - scope of responsibilities

   Allowed values: Intern | Junior | Mid-Level | Senior | Staff | Principal | Leadership

4. Extract required skills, classified as hard_skills or soft_skills.
   - Normalise skill names (e.g. 'LangChain / LangGraph' → separate entries)
   - Avoid duplicates
   - Set mandatory=True only if explicitly required or strongly implied

5. Generate hiring flags.
   Green: clear technical expectations, realistic scope, focused tech stack, well-defined responsibilities
   Red: unrealistic expectations, contradictory requirements, excessive tech breadth, vague responsibilities

6. Do not hallucinate. Prefer precision over completeness.
   If uncertain, omit rather than guess.
"""


def parse_jd(state: ScoutState) -> dict:
    """Parses a raw job description into a structured JDParserOutput."""
    llm = config.llm
    structured_llm = llm.with_structured_output(JDParserOutput)
    system_message = PARSER_INSTRUCTION.format(
        job_desc=state.job_desc,
        human_feedback=state.human_feedback or "None provided."
    ) + "\nReturn ONLY valid JSON matching the schema."

    jd_parsed = structured_llm.invoke([
        SystemMessage(content=system_message),
        HumanMessage(content="Parse the job description and return JSON only.")
    ])

    return {"parsed_jd": jd_parsed.model_dump()}


def human_feedback(state: ScoutState) -> dict:
    """No-op node. Graph is interrupted here for human correction via graph.invoke(None)."""
    return {}


def should_continue(state: ScoutState) -> str:
    """Routes back to parsing if human feedback was provided, otherwise continues."""
    if state.human_feedback:
        return "retry"
    return "continue"