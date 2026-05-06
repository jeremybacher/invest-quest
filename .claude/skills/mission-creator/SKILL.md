---
name: mission-creator
description: Use this skill when the user asks to add a new mission to the game (e.g. "add a mission for balancing portfolio", "create a streak mission", "add rookie missions"), or when implementing the logic that detects mission progress/completion. Do NOT use for UI-only mission display changes.
---

# Skill: Create or Extend a Mission

Missions are the core gamification loop. They live in three places: the `Mission` table (definition), `prisma/seed.ts` (seeding), and `src/lib/game/missions.ts` (completion logic).

## Step 1 — Define the mission

A mission has:
- `code` (unique, snake_case English): e.g. `first_trade`, `diversify_3_types`, `save_streak_3`
- `title` (Spanish): e.g. "Hacé tu primera compra"
- `description` (Spanish): one sentence explaining what to do
- `difficulty`: one of `rookie`, `smart_saver`, `explorer`, `builder`, `master`
- `xpReward`: 10 (rookie) → 500 (master), roughly geometric
- `goalType`: a string tag that maps to a checker function (`first_trade`, `diversify`, `portfolio_return`, `save_streak`, `rebalance_after_drop`)
- `goalParams`: JSON string with params specific to that goalType

## Step 2 — Add to seed

In `prisma/seed.ts`, add a `db.mission.upsert` keyed on `code`. Example:

```ts
await db.mission.upsert({
  where: { code: "diversify_3_types" },
  update: {},
  create: {
    code: "diversify_3_types",
    title: "Diversificá tu cartera",
    description: "Tené al menos 3 tipos de activos distintos en simultáneo.",
    difficulty: "explorer",
    xpReward: 100,
    goalType: "diversify",
    goalParams: JSON.stringify({ minTypes: 3 }),
  },
});
```

## Step 3 — Implement the checker

In `src/lib/game/missions.ts`, add a branch to the `checkMissionProgress` switch on `goalType`:

```ts
case "diversify": {
  const params = JSON.parse(mission.goalParams) as { minTypes: number };
  const holdings = await db.holding.findMany({
    where: { userId, quantity: { gt: 0 } },
    include: { asset: true },
  });
  const distinctTypes = new Set(holdings.map((h) => h.asset.type));
  return distinctTypes.size >= params.minTypes;
}
```

## Step 4 — Wire the event trigger

The checker runs after the relevant event. Add a call to `checkMissionProgress(userId, missionCode, context)` in:
- After every `buy` / `sell` server action → check trade-related missions.
- After every market tick that affects the user's holdings → check return-based missions.
- On daily login → check streak missions.

Keep this cheap: only check missions whose `goalType` could plausibly have progressed from this event.

## Step 5 — Completion side effects

When a mission completes (`UserMission.status` goes `active → completed`):
1. Insert/update `UserMission` row.
2. Call `awardXp(userId, mission.xpReward, mission.code)`.
3. Check if completing this mission triggers a badge (`checkAndAwardBadges`).
4. Emit a toast on the client (via a flag in the server action return value).

## Step 6 — Update CONTEXT.md + TODO.md

Tick the checkbox for this mission. Add to "Last Completed".

## Balancing guide

| Difficulty | XP range | Example |
|---|---|---|
| Rookie | 10–30 | First trade, read a lesson |
| Smart Saver | 40–80 | Save 10% of balance |
| Explorer | 100–150 | Diversify 3 types |
| Builder | 200–300 | Beat inflation, +5% return |
| Master | 400–500 | Rebalance after 10% drop |

Aim for a curve where a user hits level 2 (Smart Saver) after ~3 missions, level 3 after ~8, level 5 after ~20.
