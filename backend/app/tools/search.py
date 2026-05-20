from ddgs import DDGS
from ddgs.exceptions import DDGSException
from langchain_core.tools import tool

@tool
def web_search(query: str) -> list[dict]:
    """
    Search the web for general information.

    Use for: company background, tech stack, role expectations,
    interview patterns, salary benchmarks, leadership info.

    Args:
        query: Specific search query. Example: 'Databricks AI engineer tech stack 2025'

    Returns:
        List of results with title, url, and body text.
    """
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))
            return results if results else []
    except DDGSException:
        return []
    except Exception as e:
        return [{"error": str(e), "source": "web_search"}]


@tool
def search_news(query: str) -> list[dict]:
    """
    Search for recent news articles on any topic.

    Use for: company updates, funding rounds, layoffs, hiring trends,
    market movement, leadership changes, salary shifts.

    Args:
        query: Specific news query. Example: 'Databricks funding 2025'

    Returns:
        List of news results with title, url, date, and body text.
        Falls back to web search if news results are unavailable.
    """
    try:
        with DDGS() as ddgs:
            news = list(ddgs.news(query, max_results=5))
            if news:
                return news
    except (DDGSException, Exception):
        pass

    # Fallback to web search if news API returns nothing
    try:
        with DDGS() as ddgs:
            fallback = list(ddgs.text(query, max_results=5))
            return fallback if fallback else []
    except Exception as e:
        return [{"error": str(e), "source": "search_news"}]


tools = [web_search, search_news]