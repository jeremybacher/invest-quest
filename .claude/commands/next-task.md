---
description: Identify and start the next task from TODO.md based on CONTEXT.md state
allowed-tools: Read, Grep, Glob
---

# Next Task

Pick up the next actionable item and propose a plan before coding.

## Steps

1. Read `.claude/CONTEXT.md` — get the **Current Focus** and check for **Open Questions**. If there are open questions, surface them and stop.
2. Read `TODO.md` — find the first unchecked `- [ ]` in the current phase.
3. Restate the task in one sentence, in English.
4. Produce a short plan (3–7 bullets) covering:
   - Files you'll touch.
   - Whether a skill applies (and invoke it).
   - What the verification will look like (typecheck/lint/build/manual test).
5. **Stop and wait for user approval** before writing code, unless the user already said "go" in the prompt.
