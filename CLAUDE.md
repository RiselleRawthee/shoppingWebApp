# ShopLite — Project Context

## What This Is
ShopLite is a simple e-commerce demo app used for the "AI Tooling for Accelerated Development" course.
Backend: Node.js + Express + TypeScript + Prisma. Frontend: React/TypeScript. PostgreSQL for the database. Runs entirely locally via Docker.

## Repository Layout
- `backend/`   → Node.js + Express REST API (see `backend/CLAUDE.md`)
- `frontend/`  → React + TypeScript + Vite SPA (see `frontend/CLAUDE.md`)

Read the directory-level CLAUDE.md before working in any directory. The conventions differ by layer.

## Git Conventions
- Branch naming: `feature/SL-{ticket}`, `fix/SL-{ticket}`, `chore/description`
- Commit format: conventional commits — `feat(scope): description`, `fix(scope): description`
- Always reference the Jira ticket key in commit messages:
  `feat(reviews): add star rating endpoint [SL-17]`
- Never commit `.env` files, secrets, or `node_modules/`

## PR Standards
- Title must mirror the commit message format
- Body must include: summary, Jira ticket link, "How to test" steps, and a checklist
- All tests must pass before raising a PR — run `npm test` from `backend/`
- PR must not introduce linting errors — CI will enforce this

## Security Rules
- Never hardcode API keys, tokens, or credentials — use environment variables
- Never expose internal error details in API responses (use `AppError` for all user-facing errors)
- Always validate and sanitise user inputs at the API boundary (use Zod schemas)
- Never log sensitive user data

## MCP Integrations
- Jira project key: `SL`
- Confluence workspace: "ShopLite Design Docs"
- PostgreSQL connection: `postgresql://shoplite:shoplite@localhost:5432/shoplite`

## Running the App
```bash
# Start the database (first time and after reset)
docker-compose up -d

# Backend
cd backend
npm install
npm run db:migrate   # apply Prisma migrations
npm run db:seed      # seed 10 products (first time only)
npm run dev          # API at http://localhost:8000, Swagger at /api-docs

# Frontend (separate terminal)
cd frontend
npm install
npm run dev          # App at http://localhost:5173
```
