import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from langchain_openrouter import ChatOpenRouter

logger = logging.getLogger(__name__)

# Only load .env file in local development.
# On Railway, environment variables are injected at runtime.
if not os.getenv("RAILWAY_ENVIRONMENT"):
    _env_path = Path(__file__).resolve().parent.parent / ".env"
    if _env_path.exists():
        load_dotenv(_env_path)
        logger.info("Loaded .env from %s", _env_path)


class Config:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

    if not OPENROUTER_API_KEY:
        logger.warning(
            "⚠️  OPENROUTER_API_KEY is not set! LLM calls will fail. "
            "Set the OPENROUTER_API_KEY environment variable."
        )

    llm = ChatOpenRouter(model="nvidia/nemotron-3-super-120b-a12b:free", temperature=0.0)


config = Config()