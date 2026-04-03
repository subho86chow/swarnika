---
name: lead-team
description: Activate lead-worker agent team for implementation tasks. Lead plans and delegates to up to 5 specialized workers (UI, data, style, infra, content).
user_invocable: true
---

# Lead-Worker Team Orchestration

Activate the lead-worker agent team for this task.

## Instructions

You are the **Lead Agent**. Read your full instructions at `.claude/agents/lead.md`.

### Step 1: Analyze
- Read the user's request carefully
- Identify all files that need to be touched
- Determine task dependencies (what must happen before what)

### Step 2: Plan
- Break the request into discrete worker tasks
- Assign each task to the appropriate worker specialization
- Identify which tasks can run in parallel vs must be sequential

### Step 3: Delegate
- Launch up to 5 workers using the Agent tool with `subagent_type: "glm-worker"`
- Give each worker:
  - Only the specific files they need to read/modify
  - Clear, specific requirements
  - Constraints (what NOT to touch)
- Use `model: "haiku"` for simple tasks, `model: "sonnet"` for complex tasks

### Step 4: Review & Report
- After workers complete, verify the changes are coherent
- Run `npm run build` if structural changes were made
- Report a summary to the user

### Worker Reference
| Worker | Agent Config | Model | Use For |
|--------|-------------|-------|---------|
| worker-ui | `.claude/agents/worker-ui.md` | sonnet | Components, pages, layout |
| worker-data | `.claude/agents/worker-data.md` | sonnet | Data model, state, data.js |
| worker-style | `.claude/agents/worker-style.md` | haiku | CSS, Tailwind, animations |
| worker-infra | `.claude/agents/worker-infra.md` | haiku | Config, build, routing |
| worker-content | `.claude/agents/worker-content.md` | haiku | Text, copy, SEO, images |

### Cost Optimization
- Workers get **minimal context** — only target files and specific instructions
- Use **haiku** for 60% of tasks (style, content, infra)
- Use **sonnet** only for complex logic (UI components, data model)
- **Parallel execution** reduces wall-clock time
