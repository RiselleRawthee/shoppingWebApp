# ShopLite Modernisation — AI-Accelerated Development Retrospective

> A training document for the "AI Tooling for Accelerated Development" course.
> Covers what was built, how Claude Code was used, what worked well, and how to improve.

---

## 1. Project Overview

**Goal**: Modernise the ShopLite e-commerce demo from a Python/FastAPI + SQLite stack to a production-grade Node.js codebase that mirrors what South African tech companies use at scale.

**Duration**: ~2 extended Claude Code sessions.

**Starting state**: Python 3.11 + FastAPI + SQLAlchemy + SQLite backend, React/TypeScript frontend with flat component structure.

**End state**: Fully working, tested, and documented full-stack application ready for feature development (SL-17: reviews and star ratings).

---

## 2. What Was Built

### Backend (full replacement)
| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 20 + TypeScript strict | Replaces Python 3.11 |
| Framework | Express 4 | Thin HTTP layer |
| ORM | Prisma + PostgreSQL | Replaces SQLAlchemy + SQLite |
| Validation | Zod + `@asteasolutions/zod-to-openapi` | Runtime validation + Swagger (single source of truth) |
| Logging | pino + pino-http + morgan | Structured JSON logs |
| Security | helmet, express-rate-limit (100/15 min), cors | Production security headers |
| Architecture | Repository → Service → Controller → Router | Layered design pattern |
| Tests | Jest + Supertest (unit + integration) | 11 unit + 18 integration tests |
| Docs | Swagger UI at `/api-docs` | Auto-generated from Zod schemas |
| Env | dotenv | Local `.env` loading |
| Infra | Docker + Dockerfile + GitHub Actions CI | Deploy-ready |

### Frontend (restructured, not replaced)
| Change | Before | After |
|---|---|---|
| Page components | `src/components/` | `src/ui/` |
| Reusable components | Inline in pages | `src/components/` (composite) |
| Atomic primitives | None | `src/components/ui/` (Button, Badge, Price, etc.) |
| Error handling | None | `ErrorBoundary` class component |
| 404 page | None | `NotFoundPage` with back-link |
| API base URL | Hardcoded | `VITE_API_URL` env var |
| Tests | None | 36 Vitest + RTL tests |

### Infrastructure & Tooling
- **Docker**: `docker-compose.yml` (db + db-test), `backend/Dockerfile` (multi-stage, non-root)
- **CI**: GitHub Actions — backend-ci (PostgreSQL service) + frontend-ci jobs
- **Pre-commit**: Husky + lint-staged (ESLint on staged `.ts`/`.tsx` files)
- **MCP servers**: GitHub, Jira, Confluence, PostgreSQL — all wired in `.mcp.json`
- **Custom skills**: `/jira-ticket`, `/pr-ready`, `/code-review`
- **Hooks**: TypeScript file edits auto-run ESLint

---

## 3. Bugs Fixed During the Session

These are real errors encountered and resolved — a useful learning reference.

| Error | Root Cause | Fix |
|---|---|---|
| `TS2345: string \| string[]` on `req.params` | `@types/express@^5` widened param types | Wrap with `String(req.params['key'])` |
| `TS6138: Property declared but never read` | Private class fields in stub classes flagged by `noUnusedLocals` | Use plain constructor param `constructor(_x: T)` instead of `private readonly _x` |
| Jest cannot parse TypeScript config file | `jest.config.ts` requires `ts-node` (not installed) | Rename to `jest.config.js` using CommonJS |
| `.js` import extensions break ts-jest | ts-jest CommonJS mode doesn't resolve `.js` → `.ts` | Strip `.js` from all import paths |
| `DATABASE_URL` empty in integration tests | `setup.ts` set the env var AFTER `buildApp()` already created the Prisma singleton | Add `setupFiles: ['envSetup.ts']` so env var is set before any modules load |
| Integration tests interfere with each other | Parallel Jest workers sharing the same test database | Add `--runInBand` to run tests sequentially |
| `import.meta.dirname` missing | Not available in Node 20 (only Node 21+) | Use `path.dirname(fileURLToPath(import.meta.url))` |
| `pino-pretty` not found at runtime | Listed in `devDependencies` but needed at runtime for log formatting | Move to `dependencies` |
| "Failed to load products" in browser | `client.ts` appended `/api` to base URL but backend routes at `/products` | Remove `/api` suffix from `baseURL` |
| `ReviewSection` import fails (Vite overlay) | File never created during restructure | Create `src/components/ReviewSection.tsx` stub |
| Prisma shadow DB permission denied | `shoplite` user lacked `CREATEDB` privilege | `ALTER USER shoplite CREATEDB;` in psql |

---

## 4. How Claude Code Was Used

### The workflow, step by step

```
1. Research question         → "What's industry standard for Node.js backend?"
2. Requirements discussion   → Described scope, asked for feature list
3. Verification checklist    → Asked Claude to confirm nothing was missing
4. Plan review               → Approved 14-phase plan in Plan Mode
5. Implementation            → Claude executed all phases autonomously
6. Debug loop                → Errors surfaced → Claude fixed → re-ran tests
7. Verification              → Confirmed all tests green, both servers running
```

---

## 5. What You Did Well

### ✅ Used Plan Mode correctly
You asked for a plan before any code was written. Claude explored the codebase, designed the architecture, and presented a 14-phase plan. You reviewed and approved it. This is exactly the **Explore → Plan → Implement → Commit** cycle recommended in the Claude Code docs.

> *"Letting Claude jump straight to coding can produce code that solves the wrong problem."* — Claude Code Best Practices

### ✅ Set up persistent context infrastructure (CLAUDE.md + hooks + skills)
The project already had a working `CLAUDE.md` hierarchy (root, backend, frontend), hooks for ESLint/ruff on file edits, and custom skills (`/jira-ticket`, `/pr-ready`, `/code-review`). This meant Claude followed project conventions automatically on every session — no need to re-explain them. This is one of the highest-leverage investments you can make.

### ✅ Connected MCP servers
GitHub, Jira, Confluence, and a database MCP server were all configured. This means Claude can read Jira tickets, fetch Confluence design specs, create PRs, and query the database without context-copying. This is the correct way to reduce manual context pasting.

### ✅ Provided clear scope and kept the conversation focused
When asked about adding JMeter, you immediately said "don't include it." When asked about additional demo features (more skills, agents), you redirected: "let's focus on the codebase changes first." This kind of focused tasking prevents the **kitchen sink session** anti-pattern.

### ✅ Let Claude work autonomously on large tasks
You didn't micro-manage each file edit. You let Claude execute the full modernisation (14 phases, ~60+ files) and only stepped in when something broke or was visually wrong. This is the right operating mode for large, well-scoped tasks.

### ✅ Used verification feedback effectively
When the "Failed to load products" error appeared, you pasted the exact Vite error into the chat. When tests failed, Claude got the full test output. Providing the actual error (not a description of it) is the single most effective thing you can do to speed up debugging.

---

## 6. What Could Have Been Done Better

### ❌ The initial prompt was too broad — no acceptance criteria were defined upfront

**What happened**: The first major prompt was *"modernise this codebase to be inline with industry standards."* This gave Claude maximum creative latitude, which is fine for exploration, but led to a very long planning phase and several follow-up rounds to nail down the exact scope.

**Best practice**: For large features, have Claude *interview you first* before writing the plan:

```
I want to modernise this codebase. Interview me in detail using the
AskUserQuestion tool. Ask about the target tech stack, testing strategy,
CI requirements, and what "done" looks like. Then write a complete spec to SPEC.md.
```

This surfaces your hidden requirements (e.g., "no Docker on this machine") before implementation starts rather than during debugging.

---

### ❌ No verification criteria were given with the plan

**What happened**: Claude produced the plan and you approved it without defining what "success" looked like in code. Tests existed but weren't referenced as the acceptance gate upfront.

**Best practice**: When approving a plan, explicitly tie completion to runnable verification:

```
The plan is approved. Definition of done:
- npm test passes (all unit + integration tests green)
- npm run dev starts without errors
- http://localhost:5173 shows products loaded from the API
- http://localhost:8000/api-docs returns 200
```

This gives Claude a concrete target to verify against rather than just "finishing" the plan.

---

### ❌ Context wasn't cleared between major phases

**What happened**: All 14 phases ran in a single session (then a continued session after compaction). By Phase 10+, the context contained debugging output, failed attempts, and obsolete file contents from earlier phases. This contributed to some late-phase errors (e.g., the `ReviewSection` file being missed).

**Best practice**: Use `/clear` between major phases, or start a new session with a focused prompt:

```
/clear
We are in Phase 8 of the ShopLite modernisation. The backend is complete
and tests pass. Now implement the frontend restructure per the plan in
SPEC.md. When done, run the frontend tests.
```

Each phase gets a clean context focused on its specific goal.

---

### ❌ The database environment was discovered late

**What happened**: Docker wasn't installed on the machine. This was only discovered when Claude tried to run `docker-compose up` in Phase 3. The database setup had to be improvised (Homebrew PostgreSQL, manual user/database creation).

**Best practice**: Before large infrastructure changes, probe the environment first:

```
Before we start, check what's available:
- is docker installed? (docker --version)
- is postgresql installed locally? (psql --version)
- what's on port 5432? (lsof -ti:5432)
Tell me what you find and we'll adapt the plan accordingly.
```

This takes 30 seconds and prevents surprises mid-implementation.

---

### ❌ The custom skills could have been invoked during the workflow

**What happened**: The `/pr-ready` and `/code-review` skills exist in `.claude/skills/` but were never invoked during the session. The session ended without a commit or PR being created.

**Best practice**: After completing a feature, use your skills to close the loop:

```
/code-review          # Run security + performance + style review in parallel
/pr-ready             # Commit, push, open GitHub PR via MCP
```

These were purpose-built for this workflow — use them.

---

### ❌ No parallel subagents for the multi-file investigation phase

**What happened**: When Claude explored the backend architecture (repositories, services, controllers, routers), it read all files sequentially in the main conversation, consuming significant context.

**Best practice**: Delegate codebase exploration to subagents:

```
Use subagents to investigate the existing codebase in parallel:
- Subagent A: understand how the Python services and repositories are structured
- Subagent B: understand the frontend component structure and hooks
- Subagent C: read CLAUDE.md files and identify project conventions
Report back with a summary before we write the implementation plan.
```

Subagents explore in separate contexts and return summaries — your main conversation stays clean.

---

## 7. Best Practices From Claude Code Docs — Applied to This Project

*Source: [https://code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)*

### 1. Give Claude a way to verify its work
**In this project**: The Jest test suite + Supertest integration tests served as the verification layer. Every implementation phase ended with `npm test`. When tests failed, Claude had concrete feedback to fix against.

**Lesson**: The 29 backend tests (11 unit + 18 integration) and 36 frontend tests were the highest-leverage investment in this entire project. Every bug was caught by a test before it became a production issue.

### 2. Explore first, then plan, then code
**In this project**: Plan Mode was used for the architecture phase. The 14-phase plan was reviewed and approved before a single file was touched.

**Lesson**: The plan saved multiple rounds of "actually, also add X" mid-implementation. Writing down acceptance criteria upfront is what turns a vague modernisation request into a shippable deliverable.

### 3. Provide specific context
**In this project**: Worked well when errors were pasted verbatim. Worked less well for the initial prompt ("make it industry standard") — too vague.

**Lesson**: For small fixes, paste the exact error. For large features, reference specific files (`@backend/src/routers/products.py`), patterns, and constraints.

### 4. Write an effective CLAUDE.md
**In this project**: Three `CLAUDE.md` files existed at root, backend, and frontend. This meant Claude knew to use conventional commits with Jira keys, run ruff on Python, never use `any` types in TypeScript, etc. — without being told every session.

**Lesson**: CLAUDE.md compounds. Every convention you write once is automatically applied in every future session. Keep them concise — long files get ignored.

### 5. Use hooks for zero-exception rules
**In this project**: Hooks ran ESLint automatically on every TypeScript edit. This caught linting errors before they accumulated.

**Lesson**: If something must happen every time without exception (lint, format, type-check), put it in a hook. Don't rely on Claude remembering to run it.

### 6. Connect MCP servers
**In this project**: GitHub, Jira, Confluence, and database MCPs were pre-configured. For SL-17 (the reviews feature), Claude can now pull the Jira spec, read the Confluence design doc, query the database, and create a PR — all without leaving the conversation.

**Lesson**: MCP servers are force multipliers. Each one eliminates a context-copying step.

### 7. Clear context between unrelated tasks
**In this project**: Not done enough. Later phases ran in a context polluted by earlier debugging.

**Lesson**: Run `/clear` aggressively between phases. A fresh context with a specific prompt is almost always better than a long, polluted session.

### 8. Use subagents for investigation
**In this project**: Not used during codebase exploration.

**Lesson**: Any time Claude needs to read more than 5-10 files to understand something, use a subagent. Main context should be reserved for decision-making and implementation.

---

## 8. Recommended Workflow for Next Demo (SL-17 Reviews Feature)

Here is the exact sequence to demonstrate in your training, showing the full AI-accelerated workflow:

```bash
# Step 1: Start fresh
/clear

# Step 2: Load the Jira ticket via MCP skill
/jira-ticket SL-17

# Step 3: Pull the Confluence design spec via MCP
"Use the confluence MCP to read the ShopLite Feature Design Specs page
and summarise the API contract and UI design for the reviews feature."

# Step 4: Plan Mode — explore before implementing
# (Claude reads review.service.ts, review.repository.ts, schema.prisma,
#  ReviewSection.tsx — all the stubs — and the existing tests)

# Step 5: Implement
"Implement SL-17 per the plan. After each layer (repo → service → controller),
run npm test and fix any failures before continuing."

# Step 6: Verify
npm test        # All 29 tests should pass (+ new review tests)

# Step 7: Code review via subagents
/code-review

# Step 8: Ship
/pr-ready
```

This demonstrates: Jira MCP → Confluence MCP → Plan Mode → Auto-testing verification loop → Parallel subagent review → GitHub PR — all in one session.

---

## 9. Summary Scorecard

| Dimension | Rating | Notes |
|---|---|---|
| Plan-before-code discipline | ⭐⭐⭐⭐☆ | Used Plan Mode; could have written a spec first |
| Verification coverage | ⭐⭐⭐⭐⭐ | Excellent — 65 tests as acceptance gate |
| Context management | ⭐⭐⭐☆☆ | Phases ran in single long session |
| Prompt specificity | ⭐⭐⭐☆☆ | Large prompts were vague; small fixes were precise |
| Environment probing | ⭐⭐☆☆☆ | Docker discovery was late |
| Tool usage (MCP, skills, hooks) | ⭐⭐⭐⭐☆ | Infrastructure was excellent; skills underused |
| Subagent usage | ⭐⭐☆☆☆ | Not used for investigation phases |
| Autonomous operation | ⭐⭐⭐⭐⭐ | Let Claude execute large tasks without interruption |

---

*Document generated: February 2026*
*Project: ShopLite — AI Tooling for Accelerated Development course*
