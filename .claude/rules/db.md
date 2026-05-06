# Database Rules

Applies to `prisma/`, `src/lib/db.ts`, and any file that imports Prisma.

## Client

- Exactly **one** `PrismaClient` instance in the app, exported from `src/lib/db.ts` as `db`.
- Use the hot-reload-safe singleton pattern (stash on `globalThis` in dev).
- Never instantiate `new PrismaClient()` outside `db.ts`.

## Migrations

- Schema changes always go through `npx prisma migrate dev --name <descriptive_snake_case>`.
- **Never** `prisma db push` in this project — it skips migration history.
- Migration names describe the change: `add_user_mission_table`, `add_risk_profile_to_user`, etc.
- After creating a migration, run `npm run db:seed` to verify the seed still works against the new schema.

## Schema conventions

- Table/model names: `PascalCase` singular (`User`, `Mission`, `UserMission`).
- Column names: `camelCase` in Prisma, which Prisma maps to `camelCase` in SQLite by default.
- Every table has `id String @id @default(cuid())` unless there's a strong reason otherwise.
- Timestamps: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` where applicable.
- Foreign keys: use relations with `onDelete: Cascade` for tightly owned data (e.g., `Holding` cascades from `User`).

## Queries

- Prefer `findUnique` over `findFirst` when querying by a unique key.
- Use `select` to whitelist fields for any query returning data to the client. Never `findMany()` raw — always pick columns.
- For aggregates (portfolio value, leaderboard), compute in the DB via `groupBy` / raw SQL when it's 10x faster than N+1.
- Use transactions (`db.$transaction`) for any flow that mutates 2+ tables (e.g., buy = insert Transaction + upsert Holding + decrement cash).

## Seed

- `prisma/seed.ts` must be **idempotent**: running it twice produces the same state, not duplicated rows.
- Use `upsert` keyed on natural unique columns (`username`, `ticker`, `code`).
- Run via `npm run db:seed` (wire in `package.json` using `tsx`).
