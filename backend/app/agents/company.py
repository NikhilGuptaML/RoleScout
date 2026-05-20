from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from schemas.state import ScoutState
from schemas.research import CompanyResearcher
from config import config
from tools.search import tools, web_search, search_news

COMPANY_RESEARCHER_INSTRUCTION = """
You are a Company Research Agent. Your job is to thoroughly research a company for a job applicant.

Tools available:
- web_search: general info, tech stack, products, leadership, about pages
- search_news: recent news, funding rounds, layoffs, leadership changes (last 6 months)

Research targets:
- What the company does (core product/service, 2-3 sentences)
- Recent news relevant to engineers (last 6 months)
- Tech stack they use publicly
- Culture signals (work environment, values, employee sentiment)
- Red flags (layoffs, controversies, bad reviews)
- Funding history and active projects
- Recent product launches
- Glassdoor culture reviews summary
- Leadership changes
- Any layoffs or hiring freezes

Run multiple searches with different queries. Do not stop after one search.
Aim for at least 3 searches: one general, one news, one culture/glassdoor.

Company to research: {company_name}
"""


def company_researcher(state: ScoutState) -> dict:
    llm = config.llm
    """Runs a ReAct research loop on the company, returns structured CompanyResearcher output."""
    llm_with_tools = llm.bind_tools(tools)
    messages = [
        SystemMessage(content=COMPANY_RESEARCHER_INSTRUCTION.format(
            company_name=state.parsed_jd.company_name
        )),
        HumanMessage(content=f"Research this company: {state.parsed_jd.company_name}")
    ]

    # ReAct loop: tool call → observe → repeat until done or cap reached
    for _ in range(5):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for tool_call in response.tool_calls:
            selected_tool = web_search if tool_call["name"] == "web_search" else search_news
            result = selected_tool.invoke(tool_call["args"])
            messages.append(ToolMessage(content=str(result), tool_call_id=tool_call["id"]))

    # Structure the gathered information
    structured_result = llm.with_structured_output(CompanyResearcher).invoke(
        messages + [HumanMessage(content="Structure findings. Return JSON only.")]
    )
    return {"results": [structured_result.model_dump()]}