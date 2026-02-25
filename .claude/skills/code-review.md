# Skill: /code-review

**Usage**: `/code-review` or `/code-review {PR-number}`

## What This Skill Does

Spawns the specialized `security-scanner` and `pr-reviewer` subagents in parallel.
- With a PR number → agents fetch the diff from GitHub and post inline PR comments directly.
- Without a PR number → agents analyze `git diff main...HEAD` and return findings as text.

## Instructions

### Step 1 — Determine mode

- If a PR number was given (e.g. `/code-review 42`): **PR mode** — skip to Step 3.
- Otherwise: run `git diff main...HEAD`.
  If the diff is empty, stop: "No changes found compared to main."

### Step 2 — (Local diff mode only) Capture the diff

Store the full output of `git diff main...HEAD` for use in Step 3.

### Step 3 — Spawn two subagents in parallel

Launch both using the Task tool in a single message — do NOT wait for one before the other.

**Subagent 1 — Security**
`subagent_type: security-scanner`

PR mode prompt:
> Scan PR #{number} on {owner}/{repo} for security issues and post inline comments on the PR.

Local diff mode prompt:
> Review the following diff for security issues. Return findings as text — there is no PR yet, do not make any GitHub or Confluence calls.
>
> [DIFF]: {diff}

**Subagent 2 — Code Quality**
`subagent_type: pr-reviewer`

PR mode prompt:
> Review PR #{number} on {owner}/{repo} for code quality and standards. Post findings as inline comments on the PR.

Local diff mode prompt:
> Review the following diff for code quality and standards. Return findings as text — there is no PR yet, do not make any GitHub or Confluence calls.
>
> [DIFF]: {diff}

### Step 4 — Combine and report

```
## Code Review — {branch name or PR #{number}}

### Security
{security-scanner output}

### Code Quality
{pr-reviewer output}

---

### Summary
**Blocking issues**: {combined count from both agents}
**Suggestions**: {combined count from both agents}

{blocking > 0}: Fix the blocking issues before merging. Run /pr-ready after fixes.
{blocking = 0}: No blocking issues. Run /pr-ready when ready.
```
