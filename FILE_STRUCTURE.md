## RoleScout — File Structure

> Auto-generated overview. See [README.md](README.md) for the full documentation.

```
RoleScout/
├── backend/
│   ├── app/
│   │   ├── agents/              # AI agent implementations
│   │   │   ├── parser.py        # JD parsing + human feedback routing
│   │   │   ├── company.py       # Company research (ReAct loop with web search)
│   │   │   ├── role.py          # Role research (ReAct loop with web search)
│   │   │   ├── fit.py           # Candidate-JD fit scoring
│   │   │   └── synthesizer.py   # Final report synthesis from all agents
│   │   ├── graph/
│   │   │   └── orchestration.py # LangGraph state machine (nodes, edges, checkpointer)
│   │   ├── schemas/
│   │   │   ├── jd.py            # JDParserOutput, Skills, Flags
│   │   │   ├── profile.py       # Profile, Project, DeploymentStatus
│   │   │   ├── research.py      # CompanyResearcher, RoleResearcher, FitAnalyzer
│   │   │   └── state.py         # ScoutState (shared graph state)
│   │   ├── tools/
│   │   │   └── search.py        # DuckDuckGo web_search + search_news tools
│   │   ├── config.py            # LLM + dotenv config
│   │   ├── main.py              # FastAPI app (CORS, auth, /analyze endpoints)
│   │   └── schema.py            # API request/response models
│   ├── .env.example             # Required environment variables
│   ├── Dockerfile               # Python 3.11 + uvicorn
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ProfilePage.tsx  # Candidate profile form
│   │   │   ├── AnalyzePage.tsx  # JD input → parse → review → analyze
│   │   │   └── ReportPage.tsx   # Final report viewer (markdown)
│   │   ├── api.ts               # Typed fetch wrapper with API key auth
│   │   ├── types.ts             # Shared TypeScript interfaces
│   │   ├── storage.ts           # localStorage persistence
│   │   ├── App.tsx              # React Router + layout
│   │   └── main.tsx             # Entry point
│   ├── nginx.conf               # Production nginx config (SPA routing)
│   ├── .env.example             # Required environment variables
│   └── Dockerfile               # Node build → nginx serve
├── docker-compose.yml           # Local multi-container setup
├── CONTRIBUTING.md              # How to contribute
├── LICENSE                      # GPL-3.0
└── README.md                    # Full project documentation
```
