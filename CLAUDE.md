# ShopLite — Project Context

## What This Is

ShopLite is an e-commerce demo app for the "AI Tooling for Accelerated Development" course.
It demonstrates a Monday-morning developer workflow: pick up Jira ticket → explore → implement → test → PR.

**Stack:** Node.js 20 + Express + TypeScript + Prisma (backend) | React 18 + TypeScript + Vite + Tailwind (frontend) | PostgreSQL

Read the directory-level CLAUDE.md before working in any subdirectory — conventions differ by layer.

---

## Repository Layout

```
shoplite/
├── backend/           Node.js + Express REST API (see backend/CLAUDE.md)
├── frontend/          React + TypeScript SPA (see frontend/CLAUDE.md)
├── docs/              Architecture documentation — read before exploring unfamiliar code
│   ├── ARCHITECTURE.md   system overview, tech stack, feature status
│   ├── BACKEND.md        request flow, all endpoints, middleware chain
│   ├── FRONTEND.md       component hierarchy, data flow, state, routing
│   ├── DATABASE.md       schema, ERD, design decisions
│   └── PATTERNS.md       code patterns with examples for all layers
├── .claude/skills/    Custom Claude Code skills (see Skills section below)
├── docker-compose.yml Full stack (db + db-test + backend + frontend) — docker compose up --build
├── .mcp.json          MCP server config (GitHub, Jira, Confluence, Postgres)
└── package.json       Root: Husky + lint-staged pre-commit hooks
```

---

## Available Skills — Use These Proactively

### `/jira-ticket [KEY]` — Start of every ticket
Before writing any code for a Jira ticket, invoke `/jira-ticket SL-XX` to load the full ticket
context: acceptance criteria, technical notes, linked specs, and open questions. Do this before
any codebase exploration so you understand exactly what to build and for what purpose.

### `/code-review` — Before every PR
After implementation is complete and all tests pass, run `/code-review`. It spawns three
independent subagents in parallel: security, performance, and style. Review the combined
report. Only proceed to `/pr-ready` if no blocking issues are found.

### `/pr-ready` — Raising a PR
After `/code-review` passes, run `/pr-ready` to commit, push, and open the GitHub PR with the
correct conventional-commit message and PR body. This skill runs `npm test` from `backend/` —
all tests must pass before the PR is created.

### Skills not for ShopLite
`/create-ticket`, `/git-commit`, `/merge-pr`, `/document-workflow` are hardcoded for the
AADW Jira project and a different GitHub repo. Do not use these for ShopLite (SL) work.

---

## Feature Implementation Workflow

Follow this sequence for every Jira ticket without skipping steps:

```
1.  /jira-ticket SL-XX        load ticket, read acceptance criteria
2.  Read docs/ARCHITECTURE.md  orient yourself — understand which layers are affected
3.  Read the relevant CLAUDE.md  backend/CLAUDE.md or frontend/CLAUDE.md (or both)
4.  Explore affected files      understand existing patterns before writing a single line
5.  Implement backend first:
      schema.prisma → repository → service → controller → router → swagger registration
6.  Write unit tests            tests/unit/{entity}.service.test.ts with mockDeep
7.  Write integration tests     tests/integration/{entity}.test.ts with supertest
8.  Implement frontend:
      types/index.ts → api/client.ts → hooks/use{Entity}.ts → components → page
9.  Write frontend tests        {Component}.test.tsx co-located beside component
10. npm test (from backend/)    all tests must pass — fix any failures before continuing
11. npm run lint (backend/ and frontend/)   zero lint errors
12. /code-review               security + performance + style gate
13. /pr-ready                  commit, push, create GitHub PR
```

---

## Git Conventions

- **Branch naming:** `feature/SL-{ticket}`, `fix/SL-{ticket}`, `chore/description`
- **Commits:** conventional commits — `feat(scope): description [SL-17]`
  - `feat(reviews): add POST endpoint for product reviews [SL-17]`
  - `fix(cart): correct total_price calculation for multi-quantity items [SL-12]`
  - `chore(deps): upgrade prisma to 6.4.0`
- Always include the Jira ticket key in commit messages for traceability
- Never commit: `.env` files, secrets, `node_modules/`, `dist/`

---

## PR Standards

- Title must mirror the commit message format: `feat(reviews): add star rating endpoint [SL-17]`
- Body must include:
  - Summary of changes
  - Jira ticket link
  - "How to test" steps (curl commands or manual steps)
  - Checklist (tests pass, lint clean, Swagger updated, no secrets)
- All backend tests must pass: `npm test` from `backend/`
- Zero lint errors in both `backend/` and `frontend/`
- No new Swagger 501 endpoints without a linked Jira ticket

---

## Security Rules

- Never hardcode API keys, tokens, credentials, or connection strings — use environment variables
- Never expose internal error details in API responses — use `AppError` for all user-facing errors
- Always validate and sanitise user inputs at the API boundary using Zod schemas
- Never log sensitive user data (names, emails, session IDs) at info level or above
- Never commit `.env` files — they contain database credentials

---

## MCP Integrations

MCP servers are configured in `.mcp.json` for AI-assisted development workflows:

| Server | Purpose |
|--------|---------|
| `jira` | Fetch/transition tickets in the **SL** project |
| `confluence` | Read/write design docs in "ShopLite Design Docs" workspace |
| `github` | Create PRs, check branch status for `ShopLite` repo |
| `postgres` | Query `postgresql://shoplite:shoplite@localhost:5432/shoplite` directly |

Jira project key: **`SL`** — always use this in ticket references and branch names.

---

## Running the App (Docker)

**Always run the application via Docker Compose.** No local PostgreSQL or manual setup required.

```bash
# From the repo root — builds images and starts all services
docker compose up --build

# Subsequent runs (images already built)
docker compose up
```

| Service | URL | Description |
|---------|-----|-------------|
| `db` | `localhost:5432` | PostgreSQL — dev data |
| `db-test` | `localhost:5433` | PostgreSQL — integration test data |
| `backend` | `http://localhost:8000` | Express API + Swagger at `/api-docs` |
| `frontend` | `http://localhost:5173` | React SPA served by nginx |

Migrations and seed data (10 products) are applied automatically on first start via the `db-init` service.

---

## Running Tests

Integration tests run locally against the Docker `db-test` container.
**`docker compose up` must be running before executing integration tests.**

```bash
# Backend (from backend/)
npm run test:unit          # fast, no DB required
npm run test:integration   # requires db-test container running on localhost:5433
npm test                   # both suites, sequentially

# Frontend (from frontend/)
npm test -- --run          # Vitest single-run
```

Ensure `DATABASE_URL_TEST` in `backend/.env` uses port `5433` (the Docker test DB):
`DATABASE_URL_TEST=postgresql://shoplite:shoplite@localhost:5433/shoplite_test`
