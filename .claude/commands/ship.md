---
description: Finalize a task — verify, update CONTEXT.md, tick TODO.md, and propose a commit message
allowed-tools: Read, Edit, Bash
---

# Ship

Close out a completed task cleanly.

## Steps

1. **Verify first.** Run `npm run typecheck && npm run lint && npm run build`. If any fail, stop and report.
2. **Update TODO.md** — tick the `- [ ]` → `- [x]` for the item(s) completed in this session.
3. **Update `.claude/CONTEXT.md`**:
   - Move the completed item to **Last Completed** (keep only the 3–5 most recent).
   - Update **Phase Progress** marker if the phase is done.
   - Update **Last verified build status** with timestamp and ✅.
   - Update **Current Focus** to the next unchecked TODO item.
4. **Propose a commit message** in Conventional Commits format, in English:
   ```
   <type>(<scope>): <subject>
   
   <optional body explaining why if non-obvious>
   ```
5. **Do not run `git commit`** — let the user decide when to commit. Just show the proposed message and the `git status` / `git diff --stat` output.
