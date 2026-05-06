---
description: Run the full verification triad (typecheck, lint, build) and report results
allowed-tools: Bash
---

# Verify

Run the verification checks that must pass before any commit or phase completion.

## Steps

1. Run `npm run typecheck` — capture result.
2. Run `npm run lint` — capture result.
3. Run `npm run build` — capture result.
4. Report a compact summary:
   ```
   ✅ typecheck | ✅ lint | ✅ build
   ```
   or with a ❌ for any failure, followed by the first ~20 lines of error output for each failure.
5. If all pass, update `.claude/CONTEXT.md` **Last verified build status** with the timestamp and ✅s.
6. If any fail, **do not** update CONTEXT.md — ask the user if you should fix or defer.

Do not commit as part of this command — `/verify` is read-only for the repo (beyond updating CONTEXT.md).
