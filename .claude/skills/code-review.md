# Skill: /code-review

**Usage**: `/code-review`

## What This Skill Does

Performs a three-way parallel code review using independent subagents — security, performance, and style. Each subagent operates in an isolated context so they cannot bias each other. Returns a combined report with blocking issues and non-blocking suggestions.

## Instructions

When invoked:

1. **Get the diff**
   - Run `git diff main...HEAD` to capture all changes since branching from main.
   - If the diff is empty, stop and say "No changes found compared to main."

2. **Also read the CLAUDE.md files**
   - Read `CLAUDE.md` (root), `backend/CLAUDE.md`, and `frontend/CLAUDE.md`.
   - These define the project's coding standards — the style subagent will use them.

3. **Spawn three parallel subagents** using the Task tool. Pass the full diff and relevant CLAUDE.md content to each. The subagents run concurrently — do NOT wait for one before starting the others.

   **Subagent 1 — Security Review**
   Prompt:
   > You are a security-focused code reviewer. Review the following git diff for security issues only. Look for:
   > - SQL injection or query injection risks
   > - Missing input validation or sanitisation
   > - Hardcoded secrets, tokens, or credentials
   > - Data leakage in API responses (e.g. returning internal fields)
   > - Missing authentication or authorisation checks
   > - Improper error handling that exposes internals
   >
   > For each issue found, classify it as BLOCKING (must fix before merge) or SUGGESTION (nice to have).
   > Be specific: quote the exact lines from the diff that are problematic.
   > If no issues found, say "No security issues found."
   >
   > [DIFF]: {diff}

   **Subagent 2 — Performance Review**
   Prompt:
   > You are a performance-focused code reviewer. Review the following git diff for performance issues only. Look for:
   > - N+1 database queries (fetching in a loop instead of joining/bulk loading)
   > - Missing database indexes on frequently queried columns
   > - Missing pagination on list endpoints
   > - Blocking calls in async route handlers
   > - Unnecessary re-renders or state updates in React components
   > - Large data fetched when only a subset is needed
   >
   > For each issue found, classify it as BLOCKING or SUGGESTION.
   > Be specific: quote the exact lines from the diff that are problematic.
   > If no issues found, say "No performance issues found."
   >
   > [DIFF]: {diff}

   **Subagent 3 — Style and Standards Review**
   Prompt:
   > You are a code style reviewer enforcing project-specific standards. Review the following git diff against the coding standards defined in the CLAUDE.md files provided.
   >
   > For Python/backend changes, check against backend/CLAUDE.md:
   > - Type hints on all functions
   > - Correct HTTP status codes (201 for create, 204 for delete, 409 for duplicates, etc.)
   > - Thin routers (no business logic)
   > - Separate Request/Response schemas
   > - No SELECT *
   >
   > For TypeScript/React changes, check against frontend/CLAUDE.md:
   > - No `any` types
   > - No inline styles (Tailwind only)
   > - Logic in hooks not components
   > - All types defined in src/types/index.ts
   >
   > For each issue found, classify it as BLOCKING or SUGGESTION.
   > Quote the exact lines from the diff that violate the standard.
   > If no issues found, say "No style violations found."
   >
   > [DIFF]: {diff}
   > [BACKEND CLAUDE.md]: {backend_claude_md}
   > [FRONTEND CLAUDE.md]: {frontend_claude_md}

4. **Collect all three reports** and combine them into a single response:

   ```
   ## Code Review — {branch name}

   ### Security
   {security subagent output}

   ### Performance
   {performance subagent output}

   ### Style & Standards
   {style subagent output}

   ---

   ### Summary
   **Blocking issues**: {count}
   **Suggestions**: {count}

   {If blocking issues exist}: Fix the blocking issues before merging. Run /pr-ready after fixes.
   {If no blocking issues}: Looks good to merge. Run /pr-ready when ready.
   ```
