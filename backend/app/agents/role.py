from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from app.schemas.state import ScoutState
from app.schemas.research import RoleResearcher
from app.config import config
from app.tools.search import tools, web_search, search_news

ROLE_RESEARCHER_INSTRUCTION = """
You are a Role Research Agent. Your job is to research what a specific role actually involves
at a company, beyond what the job description says.

Tools available:
- web_search: role responsibilities, required skills, interview formats
- search_news: role demand trends, salary changes, industry shifts

Research targets:
- Day-to-day responsibilities at this seniority level
- Skills that truly matter vs. JD filler
- Typical interview format (technical rounds, system design, behavioral)
- Salary benchmarks for this role and seniority level
- How in-demand this role is right now
- How this role differs at this company vs. industry standard

Run multiple searches with different queries. Do not stop after one search.

Role: {role_title}
Company: {company_name}
Seniority: {seniority}
"""


def role_researcher(state: ScoutState) -> dict:
    """Runs a ReAct research loop on the role, returns structured RoleResearcher output."""
    llm = config.llm
    llm_with_tools = llm.bind_tools(tools)
    messages = [
        SystemMessage(content=ROLE_RESEARCHER_INSTRUCTION.format(
            role_title=state.parsed_jd.role_title,
            company_name=state.parsed_jd.company_name,
            seniority=state.parsed_jd.seniority_level
        )),
        HumanMessage(content=f"Research this role: {state.parsed_jd.role_title}")
    ]

    for _ in range(5):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for tool_call in response.tool_calls:
            selected_tool = web_search if tool_call["name"] == "web_search" else search_news
            result = selected_tool.invoke(tool_call["args"])
            messages.append(ToolMessage(content=str(result), tool_call_id=tool_call["id"]))

    structured_result = llm.with_structured_output(RoleResearcher).invoke(
        messages + [HumanMessage(content="Structure findings. Return valid JSON only.")]
    )
    return {"results": [structured_result.model_dump()]}