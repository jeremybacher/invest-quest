# 📍 InvestQuest — Live Project Context

> **This file is read at the start of every session and written to whenever a task is completed.**
> It is the single source of truth for "where are we right now".
> Keep it concise and current. Prune stale entries aggressively.

---

## 🧭 How to use this file (instructions for Claude)

### READ — Every session start
1. Open this file before any other action.
2. Parse **Current Focus**, **Last Completed**, and **Known Issues** to understand the state.
3. If this file says a task is in progress, resume it. Do not start fresh work without confirming with the user.
4. If this file is empty or says "fresh start", re-read `TODO.md` Phase 0.

### WRITE — When to update
Update this file **whenever one of these happens**:
- ✅ You complete a TODO.md checkbox or a meaningful sub-task.
- 🔄 You start a new phase or screen.
- 🐛 You discover a bug, blocker, or known issue worth remembering.
- 🧠 You make an architectural decision not already captured in `CLAUDE.md`.
- 📦 You add a new dependency (with the reason).
- ❓ You leave the session with an open question for the user.

### WRITE — How to update
- Edit in place. Overwrite stale info. This is not an append-only log.
- Keep each section short: bullets, not paragraphs.
- If **Recent Decisions** grows past ~10 entries, move the oldest into `.claude/rules/decisions.md` and clear them here.
- Use ISO dates (`YYYY-MM-DD`) where dates matter.
- Commit updates to this file in the same commit as the code change that prompted them.

### What NOT to put here
- ❌ Full design specs → those live in `TODO.md`.
- ❌ Permanent conventions → those live in `CLAUDE.md` or `.claude/rules/`.
- ❌ Secrets or API keys, ever.
- ❌ Long narratives. If you need more than 3 lines, link to a doc in `docs/`.

---

## 🎯 Current Focus

**Phase:** 9 — Polish & QA  
**Next action:** Add error boundaries, skeleton loading states, test DB idempotency, final code review.

---

## ✅ Last Completed

- 2026-04-21: Phases 0–8 completed in one session — full app scaffolded, built, and passing all checks
- 2026-04-21: Seed data verified (`npm run db:seed` runs clean)
- 2026-04-21: Production build passing (typecheck ✅ lint ✅ build ✅)

---

## 🗺️ Phase Progress

| Phase | Status | Notes |
|-------|--------|-------|
| 0 — Setup | ✅ done | Next.js 16, shadcn, Prisma 5, all deps installed |
| 1 — Schema | ✅ done | All 11 models, migration applied |
| 2 — Seed | ✅ done | 3 users, 12 assets, 10 missions, 8 badges, ~100 ticks/asset |
| 3 — Market engine | ✅ done | Random walk, tick API, portfolio value |
| 4 — AI abstraction | ✅ done | coach, profiler, feedback, challenges |
| 5 — Game logic | ✅ done | levels, xp, missions, badges, ranking |
| 6 — User context | ✅ done | Zustand store + cookie sync for SSR |
| 7 — Layout/nav | ✅ done | Sidebar (desktop) + bottom nav (mobile) + user switcher |
| 8 — Screens | ✅ done | All 6 screens implemented |
| 9 — Polish/QA | 🔨 in progress | Error boundaries, skeletons, toasts, final QA |

Legend: ⏳ not started · 🔨 in progress · ✅ done · ⚠️ blocked

---

## 🧠 Recent Decisions

- **Prisma 5 over Prisma 7**: Prisma 7's new `prisma-client` generator requires driver adapters for all providers including SQLite, adding significant complexity. Stayed on Prisma 5 (stable, works without adapters).
- **Cookie-based userId for SSR**: Zustand store persists to localStorage AND syncs to a `iq-user-id` cookie via `document.cookie` on every userId change. Server components read the cookie via `next/headers`. This avoids the need for a separate auth middleware.
- **`node_modules/.bin` wrappers are broken**: The local `.bin/` scripts are plain files (not symlinks) and fail with "Cannot find module" errors. Workaround: invoke tools directly via `node node_modules/X/bin/Y`. This affects `tsc`, `next`, and `prisma` but NOT `tsx`.
- **No `app/page.tsx`**: Root `/` is served by `app/(dashboard)/page.tsx`. The default Next.js `page.tsx` was removed to avoid route conflict.
- **shadcn with pre-created `components.json`**: shadcn CLI is interactive — bypassed by pre-creating `components.json` and running `shadcn add --yes`.
- **`db:seed` uses `node_modules/.bin/tsx`** instead of bare `tsx` to work with Prisma's `spawn` seed runner.

---

## 🐛 Known Issues / TODO follow-ups

- `node_modules/.bin/` symlinks are broken — use direct `node node_modules/...` invocations for `next`, `prisma`, `tsc`
- Update `package.json` scripts to use direct paths instead of broken `.bin/` wrappers (follow-up)
- Phase 9 items not yet done: error boundaries (`error.tsx`), full skeleton states, dark mode QA, mobile 375px QA
- AI tip on home dashboard is a static placeholder — needs real AI call with daily cache

---

## ❓ Open Questions for the User

- _(none)_

---

## 📦 Dependencies added outside the original plan

- `clsx@2`, `tailwind-merge@3` — required by shadcn's `cn()` utility (not in Phase 0 list but implied)
- `class-variance-authority` — required by shadcn button/badge/tabs components (implied by shadcn)
- `dotenv@17` (dev) — required by `prisma.config.ts` auto-generated by Prisma 7 init (kept even after switching to Prisma 5, used for future tooling)
- `@libsql/client`, `@prisma/adapter-libsql` — installed during Prisma 7 exploration, not actively used (could be removed)
- `radix-ui@1` — installed by shadcn as a peer dependency for its new unified package
- `sonner@2` — installed by `shadcn add sonner` (implied by Phase 0 component list)

---

## 🧪 Last verified build status

- **Last run:** 2026-04-21
- **typecheck:** ✅ PASS
- **lint:** ✅ PASS (0 errors, 3 warnings)
- **build:** ✅ PASS (14 routes, all dynamic except `/_not-found`)

---

_Last updated: 2026-04-21_
