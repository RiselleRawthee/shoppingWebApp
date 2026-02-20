# Skill: /jira-ticket

**Usage**: `/jira-ticket [TICKET-KEY]`
**Example**: `/jira-ticket SL-17`

## What This Skill Does

Fetches a Jira ticket from the SL project and prepares you with everything you need before writing a single line of code. This is a **context-loading skill only** — it does not implement anything.

## Instructions

When invoked with a ticket key (e.g. `SL-17`):

1. Use the **Jira MCP** to fetch the full ticket details for the provided key.

2. Extract and present the following in a clear, structured format:
   - **Summary**: one-line ticket title
   - **Status**: current status (e.g. In Progress, To Do)
   - **Priority**: ticket priority
   - **Description**: full ticket description
   - **Acceptance Criteria**: list each AC as a numbered item. If ACs are embedded in the description, extract them explicitly.
   - **Technical Notes**: any implementation hints or constraints in the ticket
   - **Linked tickets**: any related or blocking tickets

3. After presenting the ticket, provide a short **"What needs to be built"** summary in plain language — what endpoints, components, or changes are needed.

4. Flag any **ambiguities** — things that are unclear from the ticket that you would normally ask about before starting. List these as questions.

5. Do **not** start implementing. Do **not** open any files. Do **not** write any code. This skill is read-only context loading.

6. End with: "Ready to explore the codebase? Switch to Plan Mode (Shift+Tab) and ask me to explore the codebase for this ticket."
