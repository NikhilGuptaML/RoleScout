from langgraph.graph import StateGraph, START, END
from langgraph.types import Send
from langgraph.checkpoint.sqlite import SqliteSaver
from app.schemas.state import ScoutState
from app.agents.parser import parse_jd, human_feedback, should_continue
from app.agents.company import company_researcher
from app.agents.role import role_researcher
from app.agents.fit import fit_analyzer
from app.agents.synthesizer import synthesizer

def spawn_node(state: ScoutState) -> ScoutState:
    """Passthrough node. Routing happens in spawn_researchers."""
    return state


def spawn_researchers(state: ScoutState) -> list:
    """Fires three parallel Send calls — one per research agent."""
    return [
        Send("company_researcher", state),
        Send("role_researcher", state),
        Send("fit_analyzer", state)
    ]


# Build graph
builder = StateGraph(ScoutState)

builder.add_node("Parse Job Description", parse_jd)
builder.add_node("Human Feedback", human_feedback)
builder.add_node("spawn", spawn_node)
builder.add_node("company_researcher", company_researcher)
builder.add_node("role_researcher", role_researcher)
builder.add_node("fit_analyzer", fit_analyzer)
builder.add_node("synthesize", synthesizer)

builder.add_edge(START, "Parse Job Description")
builder.add_edge("Parse Job Description", "Human Feedback")
builder.add_conditional_edges(
    "Human Feedback",
    should_continue,
    {"retry": "Parse Job Description", "continue": "spawn"}
)
builder.add_conditional_edges(
    "spawn",
    spawn_researchers,
    ["company_researcher", "role_researcher", "fit_analyzer"]
)
builder.add_edge("company_researcher", "synthesize")
builder.add_edge("role_researcher", "synthesize")
builder.add_edge("fit_analyzer", "synthesize")
builder.add_edge("synthesize", END)

import sqlite3

_conn = sqlite3.connect("./rolescout.db", check_same_thread=False)
memory = SqliteSaver(conn=_conn)
graph = builder.compile(interrupt_before=["Human Feedback"], checkpointer=memory)

