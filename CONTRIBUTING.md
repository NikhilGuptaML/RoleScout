# Contributing to RoleScout

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork and clone the repo
2. Follow the [Getting Started](README.md#getting-started) guide
3. Create a feature branch: `git checkout -b feat/your-feature`

## Code Style

### Backend (Python)
- Use type hints on all function signatures
- Pydantic models for all structured data
- Docstrings on all agent functions
- Imports use the `app.` prefix (required for Docker compatibility)

### Frontend (TypeScript)
- Interfaces for all props and API types
- Functional components with hooks
- CSS via Tailwind utility classes

## Adding a New Agent

1. Create the agent in `backend/app/agents/your_agent.py`
2. Define its output schema in `backend/app/schemas/research.py`
3. Register it as a node in `backend/app/graph/orchestration.py`
4. Wire its edges (connect it to `spawn` and `synthesize`)
5. Update the `SYNTHESIZER_INSTRUCTION` to incorporate the new agent's output

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add salary comparison agent
fix: handle empty search results in company researcher
docs: update API reference with new endpoint
refactor: extract ReAct loop into shared utility
```

## Pull Requests

- Keep PRs focused on a single change
- Include a description of what and why
- Test locally with `docker compose up --build` before submitting
