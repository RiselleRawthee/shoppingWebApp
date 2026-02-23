# ShopLite

Demo codebase for the "AI Tooling for Accelerated Development" course.

A simple e-commerce app used to demonstrate Claude Code features: CLAUDE.md hierarchy, hooks, MCP integrations, custom skills, subagents, and plan mode.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Node.js 20, Express 4, TypeScript, Prisma ORM, PostgreSQL |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Tests | Jest + Supertest (backend), Vitest + RTL (frontend) |
| Docs | Swagger UI at `/api-docs` (OpenAPI 3.0, generated from Zod schemas) |

---

## Prerequisites

- Node.js 20+
- Docker + Docker Compose (for PostgreSQL)

---

## Quick Start

### 1. Start the database
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
npm run db:migrate    # apply Prisma migrations
npm run db:seed       # seed 10 products
npm run dev           # API at http://localhost:8000
```

Swagger docs available at http://localhost:8000/api-docs

### 3. Frontend
```bash
cd frontend
npm install
npm run dev           # App at http://localhost:5173
```

---

## Running Tests

### Backend
```bash
cd backend
npm run test:unit          # unit tests (mocked DB, fast)
npm run test:integration   # integration tests (requires docker-compose up -d)
npm test                   # all tests
```

### Frontend
```bash
cd frontend
npm test
```

---

## Project Structure

```
shoplite/
├── CLAUDE.md                      # Git, PR, security, MCP conventions
├── docker-compose.yml             # PostgreSQL (dev + test containers)
├── .github/workflows/ci.yml       # CI: lint + test + build on every PR
├── .mcp.json                      # MCP server config
├── .claude/
│   ├── settings.json              # Hooks (eslint)
│   └── skills/
│       ├── jira-ticket.md         # /jira-ticket skill
│       ├── pr-ready.md            # /pr-ready skill
│       └── code-review.md         # /code-review skill
├── backend/
│   ├── CLAUDE.md                  # Node.js/Express conventions
│   ├── Dockerfile                 # Multi-stage production build
│   ├── prisma/
│   │   ├── schema.prisma          # Product, CartItem, Review models
│   │   └── seed.ts                # Seeds 10 products
│   ├── src/
│   │   ├── config/env.ts          # Typed env vars
│   │   ├── lib/prisma.ts          # PrismaClient singleton
│   │   ├── errors/AppError.ts     # Custom error class
│   │   ├── middleware/            # validate, errorHandler, requestLogger
│   │   ├── repositories/          # Pure Prisma queries
│   │   ├── services/              # Business logic
│   │   ├── controllers/           # HTTP handlers
│   │   ├── routers/               # Route definitions
│   │   ├── schemas/               # Zod + OpenAPI schemas
│   │   ├── docs/swagger.ts        # OpenAPI document assembly
│   │   ├── app.ts                 # Express app factory
│   │   └── index.ts               # Server entry point
│   └── tests/
│       ├── unit/                  # Service tests (mocked repos)
│       └── integration/           # HTTP tests (Supertest + real DB)
└── frontend/
    ├── CLAUDE.md                  # TypeScript/React conventions
    └── src/
        ├── ui/                    # Page-level components
        │   ├── ProductList.tsx
        │   ├── ProductDetail.tsx
        │   ├── Cart.tsx
        │   └── NotFoundPage.tsx
        ├── components/            # Reusable components
        │   ├── ui/                # Atomic: Button, Badge, Price, etc.
        │   ├── ProductCard.tsx
        │   ├── CartItemRow.tsx
        │   ├── CategoryFilter.tsx
        │   ├── ReviewSection.tsx  # STUB — SL-17
        │   └── ErrorBoundary.tsx
        ├── hooks/
        │   ├── useProducts.ts
        │   ├── useCart.ts
        │   └── useReviews.ts      # STUB — SL-17
        ├── api/client.ts
        └── types/index.ts
```

---

## Demo: Jira Ticket SL-17

The feature to build live during the demo:

> **As a customer, I want to leave a star rating and review on a product so that other shoppers can make informed decisions.**

Acceptance criteria (mapped 1:1 to `tests/integration/reviews.test.ts`):
1. POST a review with rating 1–5 and optional comment → 201
2. GET all reviews for a product → includes average rating and total count
3. Duplicate reviewer name per product → 409
4. Rating outside 1–5 → 422
5. Review on non-existent product → 404
6. GET reviews on product with no reviews → empty list, 0.0 average
7. Comment is optional

---

## MCP Setup (Presenter)

Set the following environment variables before running Claude Code:

```bash
export GITHUB_TOKEN="ghp_..."
export JIRA_URL="https://yourorg.atlassian.net"
export JIRA_EMAIL="you@yourorg.com"
export JIRA_API_TOKEN="..."
export CONFLUENCE_URL="https://yourorg.atlassian.net/wiki"
export POSTGRES_CONNECTION_STRING="postgresql://shoplite:shoplite@localhost:5432/shoplite"
```

---

## Resetting to Demo Start State

```bash
git checkout demo-start
docker-compose down -v && docker-compose up -d
cd backend && npm run db:migrate && npm run db:seed
npm test   # confirm unit + integration tests pass (reviews return 501)
```
