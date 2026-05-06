---
name: prisma-migration
description: Use this skill whenever the user asks to add, modify, or remove a Prisma model, field, or relation, or when a feature requires a schema change. Also use when the seed script needs to be updated to match a schema change. Do NOT use for non-schema Prisma work (plain queries, client setup).
---

# Skill: Prisma Schema Migration

The canonical way to evolve the database in InvestQuest.

## Step 1 — Read current state

1. Open `prisma/schema.prisma` and understand the current shape.
2. Check `prisma/migrations/` to see what migrations already exist.
3. Read `.claude/rules/db.md` — follow those conventions strictly.

## Step 2 — Edit the schema

1. Add/modify the model. Conventions:
   - `PascalCase` singular model names.
   - `camelCase` columns.
   - Every table has `id String @id @default(cuid())` unless there's a reason not to.
   - `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` where meaningful.
   - Relations use `onDelete: Cascade` for owned data (e.g., `Holding` belongs to `User`).
   - Add `@unique` on natural keys used by seed upserts (`username`, `ticker`, `code`).

## Step 3 — Create the migration

```bash
npx prisma migrate dev --name <snake_case_description>
```

Migration name rules:
- Starts with a verb: `add_`, `remove_`, `rename_`, `alter_`.
- Describes the change: `add_mission_xp_reward`, not `update_schema`.

## Step 4 — Update the seed

1. Open `prisma/seed.ts`.
2. If the new model needs seed data, add `upsert` calls keyed on the unique column.
3. If an existing model got a new required field, update its seed data.
4. **Re-verify idempotency:** running `npm run db:seed` twice must not duplicate rows or error.

## Step 5 — Update types/queries

1. Run `npx prisma generate` (migrate usually does this, but confirm).
2. Search the codebase for broken references: `rg "db\.<model>" src/`.
3. Fix type errors until `npm run typecheck` passes.

## Step 6 — Verify

```bash
npm run db:reset       # wipe + migrate + seed — tests migration + seed from scratch
npm run typecheck
npm run build
```

## Step 7 — Update CONTEXT.md

Add a one-liner to "Recent Decisions" if the schema change is architecturally meaningful (new entity, changed relation shape). Tick the related TODO.md checkbox.

## Gotchas

- **Never** use `prisma db push` in this project — it bypasses migration history.
- If you renamed a column, Prisma may drop+recreate data. Warn the user before doing so.
- SQLite has limited ALTER TABLE support; renaming columns may require a multi-step migration.
