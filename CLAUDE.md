# ShopLite — Project Context

## What This Is
ShopLite is a simple e-commerce demo app used for the "AI Tooling for Accelerated Development" course.
Backend: Python/FastAPI. Frontend: React/TypeScript. SQLite for the database. Runs entirely locally.

## Repository Layout
- `backend/`   → Python FastAPI REST API (see `backend/CLAUDE.md`)
- `frontend/`  → React + TypeScript + Vite SPA (see `frontend/CLAUDE.md`)
- `scripts/`   → One-off data scripts

Read the directory-level CLAUDE.md before working in any directory. The conventions differ by language.

## Git Conventions
- Branch naming: `feature/SL-{ticket}`, `fix/SL-{ticket}`, `chore/description`
- Commit format: conventional commits — `feat(scope): description`, `fix(scope): description`
- Always reference the Jira ticket key in commit messages:
  `feat(reviews): add star rating endpoint [SL-17]`
- Never commit `.env` files, secrets, database files (`*.db`), or `__pycache__`

## PR Standards
- Title must mirror the commit message format
- Body must include: summary, Jira ticket link, "How to test" steps, and a checklist
- All tests must pass before raising a PR — run `pytest tests/ -v` from `backend/`
- PR must not introduce linting errors

## Security Rules
- Never hardcode API keys, tokens, or credentials — use environment variables
- Never expose internal error details in API responses
- Always validate and sanitise user inputs at the API boundary
- Never log sensitive user data

## MCP Integrations
- Jira project key: `SL`
- Notion workspace: "ShopLite Design Docs"
- SQLite database path: `backend/shoplite.db`

## Running the App
```bash
# Backend
cd backend
pip install -r requirements-dev.txt
python ../../scripts/seed_db.py   # first time only
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```
App is available at http://localhost:5173. API at http://localhost:8000.
