from langchain_core.messages import SystemMessage, HumanMessage
from schemas.state import ScoutState
from config import config

SYNTHESIZER_INSTRUCTION = """
You are a Job Hunt Intelligence Agent.
You have received research from three specialized agents. Synthesize everything into one structured report.

--- PARSED JOB DESCRIPTION ---
Company: {company_name}
Role: {role_title}
Seniority: {seniority}

--- COMPANY RESEARCH ---
{company_brief}

--- ROLE RESEARCH ---
{role_brief}

--- FIT ANALYSIS ---
{fit_analysis}

Generate a structured report with exactly these sections:

1. COMPANY SNAPSHOT
   - What they do (2-3 sentences)
   - Culture signals
   - Red flags (if any)
   - Recent news that matters for engineers

2. ROLE REALITY CHECK
   - What this role actually involves vs what the JD says
   - Skills that truly matter
   - Typical interview format

3. YOUR FIT
   - Fit score: {fit_score}/10
   - Strong matches
   - Gaps to address
   - Talking points for your experience

4. INTERVIEW PREP
   - 5 technical questions likely to be asked
   - 3 behavioral questions based on their culture
   - 2 questions YOU should ask them

5. BOTTOM LINE
   - Should you apply? Why?
   - Top 3 things to prepare before the interview
"""


def synthesizer(state: ScoutState) -> dict:
    """Synthesizes outputs from all three research agents into a final report."""
    llm = config.llm
    # Identify each agent's output by its unique keys
    company_brief = next((r for r in state.results if "company_name" in r), {})
    role_brief = next((r for r in state.results if "actual_responsibilities" in r), {})
    fit_analysis = next((r for r in state.results if "fit_score" in r), {})

    messages = [
        SystemMessage(content=SYNTHESIZER_INSTRUCTION.format(
            company_name=state.parsed_jd.company_name,
            role_title=state.parsed_jd.role_title,
            seniority=state.parsed_jd.seniority_level,
            company_brief=company_brief,
            role_brief=role_brief,
            fit_analysis=fit_analysis,
            fit_score=fit_analysis.get("fit_score", "N/A")
        )),
        HumanMessage(content="Generate the full synthesis report now.")
    ]

    response = llm.invoke(messages)
    return {"final_report": response.content}