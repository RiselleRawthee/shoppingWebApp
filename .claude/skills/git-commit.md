# Skill: /git-commit

**Usage**: `/git-commit`

## What This Skill Does

Before committing code to GitHub, checks the active Jira sprint for tasks or subtasks related to the current code changes. Asks the user to confirm any matches, transitions confirmed child tickets **and their parent tickets** to "In Progress", then commits and pushes with a conventional commit message referencing the linked ticket keys. Tickets only move to "Done" when the PR is merged — use the `/merge-pr` skill for that.

## Hardcoded Defaults

- **Project**: `AADW`
- **GitHub repo**: `RiselleRawthee/shoppingWebApp`
- **Jira base URL**: `https://bbdcloud.atlassian.net`

## Instructions

When invoked:

### Step 1 — Inspect the current code changes

Run `git diff HEAD` to capture all staged and unstaged changes.
Also run `git status` to get a list of modified, added, and deleted files.

If there are no changes, stop and say: "Nothing to commit. Working tree is clean."

Summarise the changes in plain language (e.g. "Modified cart service, added product controller, updated Prisma schema").

### Step 2 — Fetch all tickets in the current sprint

Use the **Jira MCP** `jira_search` with:
```
project = AADW AND sprint in openSprints() ORDER BY updated DESC
```
Request `fields: summary,status,issuetype,subtasks,parent`.

Collect all returned issues including any subtasks (check the `subtasks` field of each parent ticket and fetch subtask details if present using `jira_get_issue`).

### Step 3 — Match code changes to tickets

Compare the plain-language summary of code changes from Step 1 against the summaries and descriptions of all tickets and subtasks from Step 2.

Look for matches based on:
- File names or module names mentioned in the ticket (e.g. "cart", "product", "auth")
- Keywords in the ticket summary that appear in changed file paths or function names
- The current git branch name — if it contains a ticket key (e.g. `feature/AADW-2-...`), treat that as a direct match

Present your findings to the user:
```
Based on your changes, I found the following potentially related tickets in the active sprint:

✅ AADW-1 — Modernise webApp codebase (Task) [direct branch match]
🔍 AADW-3 — Update cart service (Subtask) [matched: cart service files changed]

Should I link these to your commit? (confirm all / pick specific ones / none)
```

If no matches are found, tell the user and ask them to manually specify a ticket key or continue without linking.

### Step 4 — Check branch alignment

Compare the current branch name against the confirmed ticket key(s).

- If the current branch **already contains** the ticket key (e.g. branch is `feature/AADW-16-...` and ticket is `AADW-16`), proceed to Step 5.
- If the current branch **does not contain** the ticket key, warn the user and ask:
  ```
  ⚠️  Your current branch is `{current-branch}` but the linked ticket is {AADW-X}.
  Should I create a new branch before committing?
  Suggested: feature/AADW-X-{ticket-summary-slug}
  (yes — create and switch / no — commit to current branch anyway)
  ```
  - **If yes**: run `git checkout -b feature/AADW-X-{slug}` where the slug is the ticket summary lowercased with spaces replaced by hyphens, truncated to 40 characters. Use the new branch for all subsequent steps.
  - **If no**: proceed on the current branch.

### Step 5 — Transition confirmed tickets and their parents to "In Progress"

For each confirmed ticket:
1. Use `jira_get_transitions` on the ticket key to retrieve available transitions.
2. Find the transition named "In Progress" (or closest match: "In Development", "Start Progress").
3. Use `jira_transition_issue` to apply it.
4. Skip tickets already in "In Progress" or a further-along status (e.g. "Done").

**Parent propagation:** If the confirmed ticket is a subtask, fetch its parent using `jira_get_issue` with `fields=parent,status`. If the parent is still in "To Do", transition it to "In Progress" as well using the same transition lookup.

### Step 6 — Generate a conventional commit message

Build a commit message in the format:
```
{type}({scope}): {description} [{TICKET-KEY}]
```
- **type**: `feat` (new feature), `fix` (bug fix), `chore` (tooling/config), `refactor`, `test`, `docs`
- **scope**: the primary area changed (e.g. `cart`, `auth`, `backend`, `frontend`, `skills`)
- **description**: concise summary of what changed, under 72 characters
- **ticket key(s)**: all confirmed linked keys, e.g. `[AADW-1]` or `[AADW-1, AADW-3]`

Show the generated message to the user and ask: "Commit with this message? (yes / edit)"

If the user wants to edit, accept their revised message before proceeding.

### Step 7 — Stage and commit

Stage all relevant changed files (exclude `.env`, `node_modules`, `dist`, `.db`).

Create the commit with the confirmed message.

### Step 8 — Push to remote

Push the current branch to origin:
```
git push -u origin {current-branch}
```

### Step 9 — Ask about creating a PR

Ask the user: "Would you like to create a pull request to merge `{current-branch}` into `main`?"

If yes:
1. Use the **GitHub MCP** `create_pull_request` on `RiselleRawthee/shoppingWebApp` with:
   - **base**: `main`
   - **head**: `{current-branch}`
   - **title**: the commit message from Step 6
   - **body**:
     ```
     ## Summary
     {2-3 bullet points derived from the code changes}

     ## Jira Tickets
     {list each linked ticket as: [AADW-X](https://bbdcloud.atlassian.net/browse/AADW-X) — {summary}}

     ## How to Test
     1. `cd backend && npm test` — all tests should pass
     2. `cd backend && npm run dev` + `cd frontend && npm run dev`
     3. Verify the changes described above

     ## Checklist
     - [ ] All tests pass
     - [ ] No linting errors
     - [ ] CLAUDE.md conventions followed
     - [ ] No hardcoded secrets
     ```

2. Tickets stay in **"In Progress"** when a PR is raised — do not transition them. They will only move to "Done" when the PR is merged via the `/merge-pr` skill. Remind the user: "Run `/merge-pr` after this PR is merged to close the linked tickets."

If the user says no, skip PR creation and leave tickets in "In Progress".

### Step 10 — Confirm

Output:
- Commit SHA (short) and message
- Branch pushed to
- PR URL (if created), or "No PR created"
- Jira tickets status: list each key, title, and final status (child tickets and their parents should all be "In Progress")
- Link to each updated ticket: `https://bbdcloud.atlassian.net/browse/{KEY}`
