# Skill: /pr-ready

**Usage**: `/pr-ready`

## What This Skill Does

Takes the current working branch from implementation-complete to a merged-ready pull request — commit, push, and GitHub PR creation in one shot.

## Instructions

When invoked:

1. **Check git status**
   - Run `git status` to identify all changed and untracked files.
   - If there are no changes, stop and say "Nothing to commit. Working tree is clean."

2. **Run the tests**
   - Run `pytest tests/ -v` from `backend/`.
   - If any non-xfail tests fail, stop and report the failures. Do not commit broken code.

3. **Determine the Jira ticket key**
   - Check the current branch name (e.g. `feature/SL-17` → `SL-17`).
   - If the branch name does not contain a ticket key, ask the user for it.

4. **Generate a conventional commit message**
   - Format: `{type}({scope}): {description} [{TICKET-KEY}]`
   - Derive the type from the changes: `feat` for new features, `fix` for bug fixes, `chore` for tooling.
   - Scope: the area of the codebase changed (e.g. `reviews`, `cart`, `frontend`).
   - Keep the description under 72 characters.
   - Example: `feat(reviews): add star rating and review endpoints [SL-17]`

5. **Stage and commit**
   - Stage only relevant source files (not `.db`, `.env`, `node_modules`, `__pycache__`, `dist`).
   - Create the commit with the generated message.

6. **Push to remote**
   - Push the current branch to origin: `git push -u origin {branch-name}`

7. **Create the GitHub PR**
   - Use the **GitHub MCP** to create a pull request.
   - Base branch: `main`
   - Title: same as the commit message (without the ticket key in brackets — put it in the body)
   - Body template:
     ```
     ## Summary
     {2-3 bullet points describing what was implemented}

     ## Jira Ticket
     {JIRA_URL}/browse/{TICKET-KEY}

     ## How to Test
     1. `cd backend && pytest tests/ -v` — all tests should pass
     2. `uvicorn app.main:app --reload` + `cd frontend && npm run dev`
     3. Navigate to a product detail page — reviews section should appear
     4. Submit a review with a star rating

     ## Checklist
     - [ ] All tests pass
     - [ ] No linting errors
     - [ ] CLAUDE.md conventions followed
     - [ ] No hardcoded secrets
     ```

8. **Return the PR URL** so the user can open it in a browser.
