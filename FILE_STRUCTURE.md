```
rolescout/
│
├── backend/
│ ├── app/
│ │ ├── **init**.py
│ │ ├── main.py # FastAPI app, routes
│ │ ├── config.py # env vars, settings
│ │ │
│ │ ├── schemas/ # Pydantic models (move from notebook)
│ │ │ ├── **init**.py
│ │ │ ├── jd.py # JDParserOutput, Skills, Flag
│ │ │ ├── profile.py # Profile, Skill, Project
│ │ │ ├── research.py # CompanyResearcher, RoleResearcher, FitAnalyzer
│ │ │ └── state.py # ScoutState
│ │ │
│ │ ├── agents/ # Node functions (move from notebook)
│ │ │ ├── **init**.py
│ │ │ ├── parser.py # parse_jd, should_continue
│ │ │ ├── company.py # company_researcher
│ │ │ ├── role.py # role_researcher
│ │ │ ├── fit.py # fit_analyzer
│ │ │ └── synthesizer.py # synthesizer
│ │ │
│ │ ├── tools/
│ │ │ ├── **init**.py
│ │ │ └── search.py # web_search, search_news
│ │ │
│ │ └── graph/
│ │ ├── **init**.py
│ │ └── orchestration.py # graph builder, compile
│ │
│ ├── tests/
│ │ ├── test_parser.py
│ │ ├── test_agents.py
│ │ └── test_graph.py
│ │
│ ├── notebooks/
│ │ └── rolescout.ipynb # your cleaned notebook lives here
│ │
│ ├── .env.example # template — never commit .env
│ ├── requirements.txt
│ └── Dockerfile
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ └── App.jsx
│ ├── package.json
│ └── Dockerfile
│
├── .github/
│ └── workflows/
│ └── ci.yml # runs tests on every push
│
├── .gitignore
├── docker-compose.yml # spins up backend + frontend together
└── README.md
```
