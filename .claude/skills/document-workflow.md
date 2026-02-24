# Skill: /document-workflow

**Usage**: `/document-workflow`

## What This Skill Does

Creates or updates a Confluence page documenting an AI-accelerated development use case or workflow in the AT space ("AI training"). The skill uses the **conversation history from the actual work session** as its primary source of truth — extracting which Claude Code features were used, what was automated, where the user had to iterate, and what the outcomes were. Each page is a training artifact for the "AI Tooling for Accelerated Development" workshop.

Pages are organised under **AI training → AI assisted development → Accelerated AI development → AI usecases**.

## Hardcoded Defaults

- **Confluence space key**: `AT`
- **"Accelerated AI development" page id**: `1715863599`
- **GitHub repo**: `RiselleRawthee/shoppingWebApp`
- **Jira base URL**: `https://bbdcloud.atlassian.net`
- **Claude Code best practices URL**: `https://docs.anthropic.com/en/docs/claude-code/best-practices`

---

## Instructions

When invoked:

### Step 1 — Collect essentials from the user

Ask the user (in a single message) for:

1. **Use case name** — becomes the Confluence page title (e.g. "Automating the Jira–Git–PR Lifecycle with Claude Code")
2. **Conversation history** — the user pastes the chat transcript from the session where the work was done, OR confirms **"this session"** if invoking the skill in the same conversation where the work happened
3. **Any corrections or additions** — optional freeform notes to add on top of what the conversation captures (e.g. extra context, lessons learned not visible in the transcript)

> The conversation history is the **primary source of truth**. Do NOT invent or infer what was done — extract it directly from what actually happened in the transcript.

---

### Step 2 — Analyse the conversation history

From the conversation provided (or the current session context), extract:

- **Skills invoked**: which `/skill-name` commands were run and what each one did in this specific session
- **Claude Code features used**: plan mode, subagents, hooks firing (e.g. ESLint auto-run), MCP tool calls made (Jira, GitHub, Confluence, Postgres)
- **What was automated**: tasks Claude handled end-to-end without further user input
- **Iterations and friction**: places the user had to correct, re-prompt, or adjust — these are honest improvement areas
- **Jira tickets**: any ticket keys mentioned, created, or transitioned during the session
- **Files created or modified**: from tool call outputs or user messages
- **PRs**: any pull requests created or merged

Run in parallel — read supplementary codebase context:
- All `.claude/skills/*.md` → skill name + one-line purpose from "What This Skill Does"
- `.claude/settings.json` → note hooks (e.g. auto-lint on file edit) and permissions
- Root `CLAUDE.md`, `backend/CLAUDE.md`, `frontend/CLAUDE.md` → architecture and conventions
- `git branch --show-current` and `git log --oneline -10`

---

### Step 3 — Fetch Jira and GitHub context

Run **in parallel**:

**Jira**: For each ticket key identified in Step 2, call `jira_get_issue` with `fields=summary,status,issuetype`. Build:
```
{ key, summary, status, url: "https://bbdcloud.atlassian.net/browse/{key}" }
```

**GitHub**: Use `list_pull_requests` on `RiselleRawthee/shoppingWebApp` with `state=all`. Match PRs by ticket key in the title/body or by current branch name. Record:
```
{ number, title, url: "https://github.com/RiselleRawthee/shoppingWebApp/pull/{number}", state }
```

---

### Step 4 — Fetch Claude Code best practices

Use `WebFetch` on `https://docs.anthropic.com/en/docs/claude-code/best-practices`.

Extract guidance on: CLAUDE.md files, custom skills, MCP integrations, hooks, subagents, plan mode, memory.

Use this to write the "what went well / areas for improvement" sub-section in Step 5 by comparing what was actually observed in the conversation against the recommended practices. Be specific — name the files or patterns that align well and name concrete improvements that would help.

---

### Step 5 — Build the page in markdown

Construct the full page body using **exactly** this structure:

```markdown
# {use case name}

## Use case description
{2–3 sentences: what the use case is about and how the AI feature or skill accelerates the development process. Focus on the outcome, not the implementation detail.}

## AI tooling description

### Files created to enable this use case
{List all files that are central to this use case — including files created or modified in this session AND pre-existing files that are integral to the workflow being documented (e.g. a skill that completes a multi-step pipeline). For each:
 - bold filename (no path links needed)
 - one sentence on what it does
 - one sentence on how it fits into this use case (if created in this session, note that; if pre-existing but part of the workflow, describe its role)

If the use case spans a multi-skill pipeline (e.g. `/create-ticket` → `/git-commit` → `/merge-pr`), include ALL skills in the pipeline even if some were not created in this session. Do not list every file touched — only those central to the use case.}

### What went well
{2–3 sentences maximum. Name one or two specific things that worked well, grounded in what actually happened in the conversation and the Claude Code best practices. Be concrete — reference a feature or behaviour by name.}

### Areas for improvement
{2–3 sentences maximum. Name one or two concrete, actionable improvements based on friction observed in the conversation or gaps vs. best practices. Avoid generic advice.}

### Impact vs. plain prompting
{2–3 sentences maximum. Explain what this tooling produced that a plain unassisted prompt could not reliably reproduce. Focus on consistency, automation, or multi-system integration.}

## Brief use case/workflow explanation

**When to use it:** {one sentence describing when a developer should invoke this skill or use this feature}

**Steps:**
1. {step 1}
2. {step 2}
3. {step 3}
... (keep to 5–7 steps)

**Example:** {A concrete, realistic example of a developer using this feature in their day-to-day work — different from the session that produced this page, to show broader applicability.}

## Tickets and code changes

### Jira tickets
| Ticket | Summary | Status |
|--------|---------|--------|
{one row per ticket: | [KEY](url) | summary | status |}

### Pull requests
{list each matched PR: - [PR #N — title](url) (state)}
```

If the user provided additional notes/corrections in Step 1, weave them into the relevant sections. Keep every section concise — this page is one of many use cases and must be easy to scan.

---

### Step 6 — Find or create the "AI usecases" parent page

Use `confluence_search` with:
```
type=page AND space=AT AND title="AI usecases" AND ancestor=1715863599
```

- **Found**: note its `id`
- **Not found**: create it using `confluence_create_page`:
  - `title`: `AI usecases`
  - `space_key`: `AT`
  - `parent_id`: `1715863599`
  - `body`: `This section documents real AI-accelerated development use cases and workflows from the ShopLite workshop, demonstrating how Claude Code tooling was applied across the SDLC.`

Record the "AI usecases" page id.

---

### Step 7 — Check whether the use case page already exists

Use `confluence_search`:
```
type=page AND space=AT AND title="{use case name}" AND ancestor="{AI usecases page id}"
```

- **Found**: note the `id` — will update
- **Not found**: will create

---

### Step 8 — Create or update the page

**If creating**: use `confluence_create_page` with:
- `title`: use case name
- `space_key`: `AT`
- `parent_id`: the "AI usecases" page id from Step 6
- `body`: full markdown content from Step 5

**If updating**: use `confluence_update_page` with:
- `page_id`: existing page id from Step 7
- `title`: use case name
- `body`: updated markdown content from Step 5

---

### Step 9 — Confirm

Output:
```
✅ {Created / Updated}: "{use case name}"
🔗 Page URL: {direct Confluence URL}
📁 Location: AI training > AI assisted development > Accelerated AI development > AI usecases

Jira tickets linked:
- KEY — summary (status) → url

Pull requests linked:
- PR #N — title (state) → url

Skills documented:
- /{skill-name} (one per skill referenced in the page)
```
