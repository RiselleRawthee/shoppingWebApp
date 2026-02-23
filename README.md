# ShopLite

Demo codebase for the "AI Tooling for Accelerated Development" course.

A simple e-commerce app used to demonstrate Claude Code features: CLAUDE.md hierarchy, hooks, MCP integrations, custom skills, subagents, and plan mode.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Tests | pytest + httpx (backend), Vitest + RTL (frontend) |

---

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements-dev.txt
cd .. && python scripts/seed_db.py   # seed the database (first time)
cd backend && uvicorn app.main:app --reload
```
API available at http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at http://localhost:5173

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

**Expected output (pre-demo state)**:
- 12 tests passing
- 8 tests `xfail` (SL-17 — product reviews, not yet implemented)

---

## Project Structure

```
shoplite/
├── CLAUDE.md                    # Org-level: git, PR, security, MCP config
├── .mcp.json                    # MCP server config
├── .claude/
│   ├── settings.json            # Hooks (ruff + eslint)
│   └── skills/
│       ├── jira-ticket.md       # /jira-ticket skill
│       ├── pr-ready.md          # /pr-ready skill
│       └── code-review.md       # /code-review skill
├── backend/
│   ├── CLAUDE.md                # Python/FastAPI conventions
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   │       ├── products.py      # GET /products, GET /products/{id}
│   │       ├── cart.py          # POST/DELETE /cart
│   │       └── reviews.py       # STUB — SL-17
│   └── tests/
│       ├── conftest.py
│       ├── test_products.py     # 6 passing tests
│       ├── test_cart.py         # 6 passing tests
│       └── test_reviews.py      # 8 xfail tests (SL-17)
├── frontend/
│   ├── CLAUDE.md                # TypeScript/React conventions
│   └── src/
│       ├── components/
│       │   ├── ProductList.tsx  # working
│       │   ├── ProductDetail.tsx # working (TODO comment for reviews)
│       │   ├── Cart.tsx         # working
│       │   └── ReviewSection.tsx # STUB — SL-17
│       ├── hooks/
│       │   ├── useProducts.ts   # working
│       │   ├── useCart.ts       # working
│       │   └── useReviews.ts    # STUB — SL-17
│       ├── types/index.ts
│       └── api/client.ts
└── scripts/
    └── seed_db.py
```

---

## Demo: Jira Ticket SL-17

The feature to build live during the demo:

> **As a customer, I want to leave a star rating and review on a product so that other shoppers can make informed decisions.**

Acceptance criteria (mapped 1:1 to `tests/test_reviews.py`):
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
export NOTION_TOKEN="secret_..."
```

The SQLite MCP reads `./backend/shoplite.db` — no auth required.

---

## Resetting to Demo Start State

```bash
git checkout demo-start     # reset all stub files
rm -f backend/shoplite.db   # remove any demo DB
python scripts/seed_db.py   # re-seed
cd backend && pytest tests/ -v   # confirm 12 pass, 8 xfail
```
