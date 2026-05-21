from pathlib import Path
from dotenv import load_dotenv
from langchain_openrouter import ChatOpenRouter
import os

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
class Config:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    llm = ChatOpenRouter(model= "nvidia/nemotron-3-super-120b-a12b:free",temperature=0.0)
    
config = Config()