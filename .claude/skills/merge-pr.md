# Skill: /merge-pr

**Usage**: `/merge-pr`

## What This Skill Does

Merges an open GitHub pull request, then transitions all linked Jira child tickets to "Done" and — if all subtasks of a parent are now done — transitions the parent ticket to "Done" as well.

## Hardcoded Defaults

- **Project**: `AADW`
- **GitHub repo**: `RiselleRawthee/shoppingWebApp`
- **Jira base URL**: `https://bbdcloud.atlassian.net`

## Instructions

When invoked:

### Step 1 — Identify the PR to merge

Ask the user: "Which PR number should I merge? (or paste the PR URL)"

Alternatively, if the current branch has an open PR, use the **GitHub MCP** `list_pull_requests` on `RiselleRawthee/shoppingWebApp` filtered to `state: open` and match against the current branch name from `git branch --show-current`.

Present the PR title, number, and branch to the user for confirmation before proceeding.

### Step 2 — Extract linked Jira tickets from the PR

Use the **GitHub MCP** `get_pull_request` to fetch the PR body.

Scan the PR body and commit messages for Jira ticket keys matching the pattern `AADW-\d+` (e.g. `[AADW-17]`, `AADW-18`).

List all found ticket keys to the user and confirm: "I'll close these tickets on merge: AADW-X, AADW-Y. Proceed?"

### Step 3 — Merge the PR

Use the **GitHub MCP** `merge_pull_request` on `RiselleRawthee/shoppingWebApp` with the confirmed PR number.

If the merge fails (e.g. conflicts, failing checks), stop and report the reason to the user. Do not transition any tickets.

### Step 4 — Transition child tickets to "Done"

For each confirmed Jira ticket key extracted in Step 2:
1. Use `jira_get_issue` with `fields=status,parent,issuetype` to get the current status and parent info.
2. Skip any ticket already in "Done".
3. Use `jira_get_transitions` to find the "Done" transition ID.
4. Use `jira_transition_issue` to apply it.

### Step 5 — Transition parent tickets to "Done" if all children are done

For each child ticket closed in Step 4 that has a parent:
1. Fetch the parent ticket using `jira_get_issue` with `fields=subtasks,status`.
2. For each subtask listed, use `jira_get_issue` to check its current status.
3. If **all subtasks are now "Done"**, transition the parent to "Done" using `jira_get_transitions` + `jira_transition_issue`.
4. If **some subtasks are still in progress**, leave the parent in "In Progress" and note it in the output.

### Step 6 — Confirm

Output:
- PR merged: `#{number} — {title}` → `https://github.com/RiselleRawthee/shoppingWebApp/pull/{number}`
- Child tickets closed: list each `AADW-X — {summary}` → `https://bbdcloud.atlassian.net/browse/AADW-X`
- Parent tickets closed: list each, or "Remaining subtasks still in progress — parent left as In Progress"
