---
name: investquest-feature
description: Use this skill when the user asks to implement a new screen, feature, or end-to-end vertical slice in InvestQuest (e.g. "build the simulator screen", "add the coach chat", "implement mission completion flow"). It walks through the canonical InvestQuest pattern: schema → server action → server component → client component → wire to nav → update CONTEXT.md. Do NOT use for isolated bug fixes, single-file refactors, or styling tweaks.
---

# Skill: Build an InvestQuest Feature

Follow this end-to-end pattern for any new feature (screen, flow, or vertical slice). Do not shortcut steps.

## Step 0 — Read context

1. Open `.claude/CONTEXT.md`. Confirm which phase you're in and that this feature belongs in the current phase.
2. Open the relevant section of `TODO.md` to see the exact checkbox you're implementing.
3. If unclear, stop and ask the user.

## Step 1 — Data layer

1. Check `prisma/schema.prisma`. Does this feature need new tables, columns, or relations? If yes:
   - Edit the schema.
   - Run `npx prisma migrate dev --name <descriptive_name>`.
   - Update `prisma/seed.ts` if seed data is affected, keeping it idempotent (upsert on natural keys).
2. If no schema change, move on.

## Step 2 — Business logic in `src/lib/`

1. Create/extend the appropriate module:
   - Game logic (XP, missions, badges, levels) → `src/lib/game/`
   - Market logic (prices, ticks, P&L) → `src/lib/market/`
   - AI logic (coach, profiler, feedback) → `src/lib/ai/`
2. Keep functions pure and testable. Inputs in, outputs out. No `cookies()` or `headers()` here.
3. Add Zod schemas for all inputs and outputs.

## Step 3 — Server action or API route

1. **Default:** server action in `src/app/<route>/actions.ts` marked `"use server"`.
2. **Exception:** API route under `src/app/api/` **only** for:
   - Polled endpoints (market tick)
   - AI calls (if streaming or different auth model is needed)
3. Shape: validate input with Zod → call lib function → return `{ ok: true, data }` or `{ ok: false, error }`. Never throw to the client.

## Step 4 — Server component (page)

1. Create the route under `src/app/(dashboard)/<feature>/page.tsx` as a **server component** by default.
2. Fetch initial data directly with `db` from `@/lib/db`.
3. Pass data down as props to client components.

## Step 5 — Client components

1. Create interactive pieces under `src/components/features/<feature>/`.
2. Mark with `"use client"` only when needed (state, events, effects).
3. Forms: `react-hook-form` + `zodResolver`. Submit handler calls the server action.
4. Loading states: `<Skeleton />`. Empty states: friendly Spanish copy with CTA. Error states: `<Alert variant="destructive">`.

## Step 6 — Navigation

1. Add the route to the sidebar (desktop) and bottom tab bar (mobile) in the layout.
2. Icon from `lucide-react`. Label in Spanish.

## Step 7 — Verify

Run in order:
```bash
npm run typecheck
npm run lint
npm run build
```
All three must pass. If any fail, fix before moving on.

## Step 8 — Update CONTEXT and commit

1. Update `.claude/CONTEXT.md`:
   - Tick the TODO.md checkbox.
   - Update "Last Completed".
   - Update "Phase Progress" if the phase is done.
   - Note any decision or deferred issue.
2. Commit with Conventional Commits format in English, one concern per commit.

## Red flags — stop and ask the user if

- The feature seems to need real authentication.
- The feature requires an external API key not already in the user's `AppSetting`.
- You'd need to add a new top-level dependency not in `TODO.md` Phase 0.
- The feature crosses into "out of scope (v2+)" territory per `CLAUDE.md`.
