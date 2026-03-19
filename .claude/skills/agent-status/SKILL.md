---
name: agent-status
description: "[EPHEMERAL] Query research_runs table for agent status — delete after Phase 3 admin panel"
user_invocable: true
---

# /agent-status

> **EPHEMERAL SKILL**: Delete this skill once agent monitoring is built into the admin panel (Phase 3+).

Query the `research_runs` table to show recent AI agent activity.

## Steps

1. **Query recent runs**
   Connect to the database and query:
   ```sql
   SELECT id, agent_type, status, project_id, started_at, completed_at, tokens_used, cost_usd, error_message
   FROM research_runs
   ORDER BY started_at DESC
   LIMIT 20;
   ```

2. **Format output**
   Display as a table grouped by status:
   - **Running**: agent type, started at, duration so far
   - **Completed**: agent type, duration, tokens used, cost
   - **Failed**: agent type, error message, when it failed
   - **Pending**: agent type, queued at

3. **Summary stats**
   - Total runs in last 24h
   - Success/failure rate
   - Total tokens used and estimated cost
