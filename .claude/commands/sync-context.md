---
description: Sync .claude/CONTEXT.md with the current state of the project and the TODO.md
allowed-tools: Read, Edit, Bash, Grep, Glob
---

# Sync Context

Update `.claude/CONTEXT.md` to match reality. Do this when you've just returned to the project after a break, or when you suspect CONTEXT.md is stale.

## Steps

1. Read `TODO.md` and identify which checkboxes are ticked.
2. Read `.claude/CONTEXT.md` current state.
3. Run `git log --oneline -20` to see recent commits and infer recent work.
4. Run `npm run typecheck 2>&1 | tail -20` to capture current type-check state.
5. Run `npm run lint 2>&1 | tail -20` to capture lint state.
6. Run `npm run build 2>&1 | tail -5` to capture build state (note: only run if user confirms, this can take a minute).
7. Update `.claude/CONTEXT.md`:
   - **Current Focus**: based on the lowest unchecked TODO.md item.
   - **Last Completed**: 3–5 most recent commits summarized.
   - **Phase Progress**: tick off completed phases.
   - **Last verified build status**: with timestamp and results from steps 4–6.
   - **Known Issues**: preserve existing entries, add any new ones surfaced by typecheck/lint.
8. Report a brief summary of what changed in CONTEXT.md.

Do not invent state. If something is ambiguous, ask the user.
