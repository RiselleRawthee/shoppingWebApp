# Skill: /create-ticket

**Usage**: `/create-ticket`

## What This Skill Does

Creates a new Jira ticket in the **AI Accelerated Development Workshop (AADW)** project, assigns it to Riselle Rawthee, asks which sprint to place it in, checks GitHub for related branches/PRs to link, optionally adds subtasks, and confirms the created ticket URL.

## Hardcoded Defaults

- **Project**: `AADW`
- **Assignee**: `riseller@bbd.co.za` (Riselle Rawthee, account ID: `6274f3f72db30800702696e9`)
- **GitHub repo**: `RiselleRawthee/shoppingWebApp`
- **Jira base URL**: `https://bbdcloud.atlassian.net`

## Instructions

When invoked:

### Step 1 — Collect ticket details from the user

Ask the user (in a single message) for:
- **Summary**: the ticket title
- **Issue type**: Task, Story, Bug, or Epic (default: Task)
- **Description**: what needs to be done (can be brief)

### Step 2 — Discover available sprints

Use the **Jira MCP** `jira_search` tool with the following JQL to find active sprints:
```
project = AADW AND sprint in openSprints() ORDER BY created DESC
```
Request `fields: customfield_10020` in the query.

Also check for upcoming sprints using:
```
project = AADW AND sprint in futureSprints() ORDER BY created DESC
```

To get the sprint **ID** (needed to assign the ticket), call `jira_get_issue` on any issue returned (e.g. `AADW-1`) with `fields=*all` and extract the sprint ID from the `customfield_10020` field — it will be a numeric ID in the raw response.

If no sprints are found, inform the user that no active or future sprints exist and proceed to create the ticket in the backlog (no sprint assigned).

### Step 3 — Check GitHub for related branches and PRs

Before creating the ticket, use the **GitHub MCP** to check for existing work in `RiselleRawthee/shoppingWebApp` that may be related:

1. Use `list_pull_requests` to fetch open and recently closed PRs. Scan titles and branch names for keywords that match the ticket summary.
2. Use `list_commits` to check recent branch activity for any branches whose names suggest relevance (e.g. a branch named `feature/modernise-...` for a ticket about modernising).

If any matches are found, present them to the user:
```
Found potentially related GitHub activity:
- PR #1: "chore(modernise): migrate backend..." (merged) — branch: riselle/modernise-codebase
- Branch: feature/xyz (open)

Should any of these be linked to the new ticket? (yes / no / list them)
```

If no related branches or PRs are found, note "No related GitHub activity found" and continue.

Store any confirmed linked PR numbers to add as a remote link after ticket creation.

### Step 4 — Ask which sprint

Present the available sprint names to the user and ask: "Which sprint should this ticket go in?" Include a "Backlog (no sprint)" option.

### Step 5 — Ask about subtasks

Ask the user: "Should this ticket have any subtasks? If yes, list them (one per line). If no, just say no."

If the user provides subtasks, collect the list. These will be created after the main ticket.

### Step 6 — Create the main ticket

Use `jira_create_issue` with:
- `project_key`: `AADW`
- `summary`: from user input
- `issue_type`: from user input
- `description`: from user input
- `assignee`: `riseller@bbd.co.za`
- `additional_fields`: `{"customfield_10020": SPRINT_ID}` — only if the user chose a sprint (use the numeric sprint ID extracted in Step 2)

### Step 7 — Create subtasks (if any)

For each subtask the user provided, use `jira_create_issue` with:
- `project_key`: `AADW`
- `summary`: the subtask title
- `issue_type`: `Subtask`
- `assignee`: `riseller@bbd.co.za`
- `additional_fields`: `{"parent": "{MAIN-TICKET-KEY}", "customfield_10020": SPRINT_ID}`

### Step 8 — Link related GitHub PRs and update status (if any confirmed in Step 3)

For each confirmed linked PR, use `jira_create_remote_issue_link` to add a remote link on the main ticket pointing to the GitHub PR URL (`https://github.com/RiselleRawthee/shoppingWebApp/pull/{PR_NUMBER}`).

If any PRs or branches were confirmed as linked, also transition the ticket to **"In Development"**:
1. Use `jira_get_transitions` on the newly created ticket key to retrieve available transitions.
2. Find the transition whose name matches "In Development" (or the closest equivalent such as "In Progress").
3. Use `jira_transition_issue` to apply it.

### Step 9 — Confirm

Output a summary:
- Main ticket: `AADW-X — {summary}` → `https://bbdcloud.atlassian.net/browse/AADW-X`
- Assigned to: Riselle Rawthee
- Sprint: the sprint name chosen (or "Backlog")
- Subtasks created: list each key and summary, or "None"
- GitHub links added: list PR numbers linked, or "None"
- Status: "In Development" (if GitHub activity was linked) or "To Do"
