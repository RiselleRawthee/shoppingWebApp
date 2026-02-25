# ShopLite — System Architecture Overview

## What ShopLite Is

ShopLite is a lightweight e-commerce demo application built for the "AI Tooling for Accelerated Development" course. It simulates a realistic production-style codebase that a developer can receive as a Jira ticket and extend.

**Core functionality:**
- Browse a catalogue of 10 tech products (with category filtering)
- View individual product detail pages with stock information
- Add/remove products from a session-based shopping cart
- (Stub) Product reviews and star ratings — Jira ticket SL-17

---

## Monorepo Layout

```
shoplite/
├── backend/           Node.js + Express + TypeScript + Prisma REST API
├── frontend/          React + TypeScript + Vite SPA
├── docs/              Architecture and design documentation (this folder)
├── docker-compose.yml PostgreSQL for dev (port 5432) and test (port 5433)
├── .mcp.json          MCP server configuration (GitHub, Jira, Confluence, Postgres)
├── package.json       Root: Husky + lint-staged pre-commit hooks
└── CLAUDE.md          Top-level project conventions for AI tooling
```

Each subdirectory has its own `CLAUDE.md` with layer-specific conventions. Read those before working in `backend/` or `frontend/`.

---

## System Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│              http://localhost:5173                  │
└───────────────────────┬─────────────────────────────┘
                        │ axios (VITE_API_URL)
                        ▼
┌─────────────────────────────────────────────────────┐
│              React SPA (Vite dev server)             │
│  src/ui/ → src/components/ → src/hooks/ → src/api/  │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP/JSON
                        ▼
┌─────────────────────────────────────────────────────┐
│             Express REST API                        │
│         http://localhost:8000                       │
│  Router → Controller → Service → Repository         │
│  Swagger UI at /api-docs                            │
└───────────────────────┬─────────────────────────────┘
                        │ Prisma ORM
                        ▼
┌─────────────────────────────────────────────────────┐
│          PostgreSQL (Homebrew / Docker)              │
│  shoplite (dev, port 5432)                          │
│  shoplite_test (integration tests, port 5433)       │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Backend runtime | Node.js | 20 | JavaScript runtime |
| Backend framework | Express | 4.x | HTTP routing and middleware |
| Backend language | TypeScript | 5.7 | Type-safe server code |
| ORM | Prisma | 6.x | Database access layer |
| Validation | Zod | 3.x | Request validation + OpenAPI schema source |
| API docs | swagger-ui-express + zod-to-openapi | 5.x / 7.x | Auto-generated Swagger UI |
| Logging | pino + pino-http | 9.x | Structured HTTP logging |
| Security | helmet, cors, express-rate-limit | latest | HTTP security headers, CORS, rate limiting |
| Frontend framework | React | 18.x | UI component library |
| Frontend language | TypeScript | 5.6 | Type-safe frontend code |
| Frontend bundler | Vite | 6.x | Dev server and production build |
| Frontend styling | Tailwind CSS | 3.x | Utility-first CSS |
| Frontend routing | React Router | 7.x | Client-side routing |
| HTTP client | axios | 1.x | API calls from frontend |
| Database | PostgreSQL | 16 | Relational data store |
| Backend tests | Jest + Supertest + jest-mock-extended | 29.x | Unit and integration tests |
| Frontend tests | Vitest + React Testing Library | 2.x | Component and hook tests |

---

## Key URLs (Development)

| URL | Description |
|-----|-------------|
| `http://localhost:5173/` | Product listing page |
| `http://localhost:5173/products/:id` | Product detail page |
| `http://localhost:5173/cart` | Shopping cart |
| `http://localhost:8000/api-docs` | Swagger UI — live API documentation |
| `http://localhost:8000/health` | Health check endpoint |

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Product listing | Complete | GET /products with optional category filter |
| Product detail | Complete | GET /products/:id |
| Category filtering | Complete | Frontend + query param |
| Shopping cart | Complete | Session-based, no auth required |
| Product reviews | Stub | SL-17 — service throws 501, schema and routes exist |
| Star ratings | Stub | SL-17 — included in review schema |
| User authentication | Not planned | Out of scope for demo |
| Checkout / payments | Not planned | "Proceed to Checkout" button is a placeholder |

---

## Security Model

- No user authentication — all cart operations use a client-generated session ID
- Rate limiting: 100 requests per 15 minutes per IP (express-rate-limit)
- CORS restricted to `http://localhost:5173`
- HTTP security headers via helmet
- All inputs validated at API boundary using Zod schemas before reaching business logic
- Internal errors never exposed in API responses — user-facing messages use AppError only
- Secrets via environment variables only — never hardcoded

---

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (Homebrew on macOS: `brew services start postgresql@16`)

### Running the App
```bash
# Backend
cd backend
npm install
npm run db:migrate    # apply Prisma migrations
npm run db:seed       # seed 10 products (first time only)
npm run dev           # API at http://localhost:8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev           # App at http://localhost:5173
```

### Database Credentials
- User/password: `shoplite` / `shoplite`
- Dev DB: `postgresql://shoplite:shoplite@localhost:5432/shoplite`
- Test DB: `postgresql://shoplite:shoplite@localhost:5432/shoplite_test`

### Running Tests
```bash
cd backend
npm run test:unit         # fast, no DB required
npm run test:integration  # requires PostgreSQL running with shoplite_test DB
npm test                  # both (sequential)

cd frontend
npm test -- --run         # Vitest (jsdom, no DB)
```

---

## MCP Integrations

Four MCP servers are configured in `.mcp.json` for AI-assisted development:

| Server | Tool | Purpose |
|--------|------|---------|
| `github` | @modelcontextprotocol/server-github | PR creation, branch management |
| `jira` | mcp-atlassian | Ticket lookup, transitions, sprint management |
| `confluence` | mcp-atlassian | Design doc lookup and creation |
| `postgres` | @modelcontextprotocol/server-postgres | Direct DB queries during development |

Jira project key: `SL` — always reference ticket keys in commit messages.
