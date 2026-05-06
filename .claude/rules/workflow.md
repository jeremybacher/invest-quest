# Workflow Rules

These rules apply to every task in this project.

## Before starting any task

1. **Read `.claude/CONTEXT.md`** to see current focus, last completed work, and known issues.
2. **Read the relevant section of `TODO.md`** for the phase you're in.
3. If the user asks for something that isn't clearly in the current phase, **ask for confirmation** before starting.

## While working

1. For any change touching 3+ files or introducing a new pattern, **produce a short plan first** and confirm before coding.
2. **One concern per commit.** If you find yourself fixing two unrelated things, split them.
3. When a shadcn component is needed, install it via `npx shadcn@latest add <name>` — never hand-write a replacement.
4. When adding a dependency not listed in `TODO.md` Phase 0, **log it** in `.claude/CONTEXT.md` under "Dependencies added outside the original plan" with a one-line reason.

## After finishing a task

1. Run the verification triad: `npm run typecheck && npm run lint && npm run build`.
2. Update `.claude/CONTEXT.md`:
   - Tick the TODO.md checkbox(es) you completed.
   - Update **Last Completed** (most recent first, keep 3–5).
   - Update **Phase Progress** status marker.
   - Update **Last verified build status** with the actual results.
   - If you made an architectural decision, add it to **Recent Decisions** with a one-line reason.
   - If you hit a bug you're deferring, add it to **Known Issues**.
3. Write a Conventional Commits message in English describing the change.

## Commit message format

```
<type>(<scope>): <subject in english, lowercase, no period>

<optional body in english>
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.  
Scopes examples: `ai`, `market`, `game`, `ui`, `db`, `seed`, `coach`, `simulator`, `settings`.

Examples:
- `feat(ai): add vercel ai sdk provider factory`
- `fix(market): clamp random walk to prevent negative prices`
- `chore(db): add Mission and Badge tables`

## When stuck

1. Re-read `CLAUDE.md` and `.claude/CONTEXT.md`.
2. Check if there's a relevant skill in `.claude/skills/` — invoke it with its slash command.
3. If still stuck, stop and ask the user a concrete question. Don't guess silently.
