# 🎮 InvestQuest — TODO.md

> Build plan for an educational fintech app that teaches investing through gamified simulations and AI guidance.

**Stack:** Next.js 14+ (App Router) · TypeScript strict · SQLite + Prisma · Tailwind + shadcn/ui · Vercel AI SDK (multi-provider)
**Language:** UI in Spanish rioplatense 🇦🇷 · code, comments, commits in English
**Principle:** Keep it as simple as possible. MVP first, nice-to-haves later.

---

## 🧭 How to use this file (Claude Code)

1. **Before anything**, read `CLAUDE.md` and `.claude/CONTEXT.md`. They are the project's constitution and live state.
2. Work **phase by phase, top to bottom**. Tick `- [ ]` → `- [x]` as you complete each item.
3. At the end of every meaningful task, run `/ship` (or manually: verify → update `CONTEXT.md` → propose commit).
4. If something is ambiguous or out of scope, **stop and ask** — don't guess silently.
5. Use the provided skills and slash commands. They encode the canonical patterns for this project.

---

## 📦 Project Overview

InvestQuest is a responsive web app (works on mobile and desktop) where users learn investing by completing missions, running simulations with fake market data, and chatting with an AI Coach. Users are pre-seeded demo accounts (`user1`, `user2`, `user3`) — **no real auth** for MVP. The AI provider (OpenAI, Anthropic, Google) and API key are chosen by the user from the UI and stored encrypted in SQLite.

---

## ✅ Phase 0 — Claude Code configuration & project setup

> All files referenced below ship with the initial repo. If any are missing, create them from the templates in this phase before moving on.

### 0.1 Claude Code configuration (already provided)

- [ ] Confirm these files exist at the repo root:
  - `CLAUDE.md` — project constitution, loaded every session
  - `.claude/CONTEXT.md` — living state, read at start, written at end of tasks
  - `.claude/rules/workflow.md` — before/during/after task rules
  - `.claude/rules/ai.md` — AI module rules
  - `.claude/rules/db.md` — Prisma/SQLite rules
  - `.claude/rules/ui.md` — components, copy, styling rules
  - `.claude/skills/investquest-feature/SKILL.md` — canonical feature pattern
  - `.claude/skills/prisma-migration/SKILL.md` — safe schema evolution
  - `.claude/skills/shadcn-component/SKILL.md` — shadcn installation & usage
  - `.claude/skills/ai-provider/SKILL.md` — Vercel AI SDK use cases
  - `.claude/skills/mission-creator/SKILL.md` — define + wire missions
  - `.claude/commands/sync-context.md` — `/sync-context`
  - `.claude/commands/next-task.md` — `/next-task`
  - `.claude/commands/verify.md` — `/verify`
  - `.claude/commands/ship.md` — `/ship`
  - `.claude/commands/reset-db.md` — `/reset-db`
  - `.claude/agents/code-reviewer.md` — review subagent
  - `.claude/settings.json` — project settings (permissions, hooks)
- [ ] Create `.gitignore` including: `node_modules/`, `.next/`, `.env`, `.env.local`, `prisma/dev.db*`, `CLAUDE.local.md`, `.claude/settings.local.json`

### 0.2 Initialize Next.js project

- [ ] Scaffold the app (run at repo root):
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
- [ ] Initialize shadcn/ui:
  ```bash
  npx shadcn@latest init
  ```
  Choose: neutral base color · CSS variables · RSC yes.
- [ ] Install base shadcn components:
  ```bash
  npx shadcn@latest add button card input label dialog tabs sonner progress badge avatar dropdown-menu sheet skeleton form select radio-group separator alert alert-dialog
  ```

### 0.3 Install dependencies

- [ ] Core libraries:
  ```bash
  npm i prisma @prisma/client zod react-hook-form @hookform/resolvers zustand lucide-react date-fns react-markdown gray-matter next-themes recharts
  ```
- [ ] AI SDKs:
  ```bash
  npm i ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
  ```
- [ ] Dev dependencies:
  ```bash
  npm i -D tsx @types/node
  ```

### 0.4 Configure Prisma

- [ ] Initialize:
  ```bash
  npx prisma init --datasource-provider sqlite
  ```
- [ ] Set `DATABASE_URL="file:./dev.db"` in `.env`.
- [ ] Create `.env.example` with placeholders: `DATABASE_URL`, `APP_SECRET` (32-byte base64 for AES-GCM).

### 0.5 Create folder structure and base files

- [ ] Create under `src/`:
  ```
  src/
  ├── app/(dashboard)/           # will hold routes
  ├── app/api/                   # market tick, AI endpoints
  ├── components/ui/             # shadcn (auto-created)
  ├── components/features/       # domain components
  ├── lib/
  │   ├── db.ts                  # prisma singleton
  │   ├── ai/                    # provider + use cases
  │   ├── game/                  # xp, levels, missions, badges
  │   ├── market/                # fake market engine
  │   └── utils.ts               # shadcn default + helpers
  ├── hooks/
  ├── stores/                    # zustand
  ├── types/
  └── content/lessons/           # markdown lessons
  ```
- [ ] Create `src/lib/db.ts` with the hot-reload-safe Prisma singleton.

### 0.6 Wire up package.json scripts

Add these under `"scripts"`:
```json
{
  "db:seed": "tsx prisma/seed.ts",
  "db:reset": "rm -f prisma/dev.db prisma/dev.db-journal && npx prisma migrate deploy && npm run db:seed",
  "typecheck": "tsc --noEmit"
}
```
And register the seed command for Prisma:
```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

### 0.7 Finalize setup

- [ ] Run `/verify` — `typecheck`, `lint`, and `build` must all pass on a bare project.
- [ ] Create a short `README.md` with setup steps: `npm i`, `cp .env.example .env`, `npx prisma migrate dev`, `npm run db:seed`, `npm run dev`.
- [ ] Update `.claude/CONTEXT.md`: mark Phase 0 as ✅ and set Current Focus to Phase 1.

---

## ✅ Phase 1 — Database schema (Prisma)

> Skill: invoke `prisma-migration` for every schema change. Rules: `.claude/rules/db.md`.

Edit `prisma/schema.prisma` and add these models. Then run `npx prisma migrate dev --name init`.

- [ ] **User** — `id, username @unique, displayName, level Int @default(1), xp Int @default(0), cashBalance Float @default(10000), riskProfile String?, createdAt, updatedAt`
- [ ] **Asset** — `id, ticker @unique, name, type (stock|bond|etf|crypto as String), basePrice Float, volatility Float`
- [ ] **PriceTick** — `id, assetId, price Float, timestamp DateTime @default(now())`, indexed on `(assetId, timestamp desc)`
- [ ] **Holding** — `id, userId, assetId, quantity Float, avgBuyPrice Float, @@unique([userId, assetId])`
- [ ] **Transaction** — `id, userId, assetId, type (buy|sell), quantity Float, price Float, timestamp`
- [ ] **Mission** — `id, code @unique, title, description, difficulty (rookie|smart_saver|explorer|builder|master), xpReward Int, goalType, goalParams (JSON string)`
- [ ] **UserMission** — `id, userId, missionId, status (active|completed|failed), progress (JSON string), completedAt DateTime?, @@unique([userId, missionId])`
- [ ] **Badge** — `id, code @unique, name, description, icon`
- [ ] **UserBadge** — `id, userId, badgeId, awardedAt, @@unique([userId, badgeId])`
- [ ] **ChatMessage** — `id, userId, role (user|assistant|system), content, createdAt`
- [ ] **AppSetting** — `id, userId @unique, provider (openai|anthropic|google), apiKeyEncrypted, model`
- [ ] All user-owned tables cascade-delete on `User` deletion.
- [ ] Run migration and verify `npx prisma studio` opens cleanly.

---

## ✅ Phase 2 — Seed data

> Must be **idempotent**. Use `upsert` on natural keys (`username`, `ticker`, `code`).

- [ ] Create `prisma/seed.ts`. Wire via `tsx` in `package.json`.
- [ ] Seed **3 demo users**: `user1` (Ana), `user2` (Bruno), `user3` (Carla). Each starts with `cashBalance = 10000`, `level = 1`, `xp = 0`.
- [ ] Seed ~**12 fake assets**:
  - Stocks: `TECHA`, `ENERB`, `BANKC`, `HLTHD`
  - ETFs: `GLOBE`, `EMERG`, `BONDI`
  - Bonds: `GOV10Y`, `CORPAA`
  - Crypto: `BITQ`, `ETHQ`, `STBLQ`
  - Each with plausible `basePrice` and `volatility` (0.01–0.08).
- [ ] Seed ~**100 initial PriceTicks** per asset using random-walk backwards from now (for chart history).
- [ ] Seed ~**10 missions** covering all 5 difficulty tiers (invoke `mission-creator` skill):
  - Rookie: `first_trade`, `read_first_lesson`
  - Smart Saver: `save_10pct`, `hold_3_days`
  - Explorer: `diversify_3_types`, `complete_risk_profile`
  - Builder: `beat_5pct_return`, `hold_etf_week`
  - Master: `rebalance_after_drop`, `portfolio_10pct_return`
- [ ] Seed ~**8 badges**: First Trade, Diversified, Bull Rider, Bear Survivor, Streak 3, Streak 7, Top 3, Master.
- [ ] Run `npm run db:reset` to confirm idempotency end-to-end.

---

## ✅ Phase 3 — Fake market engine

> Pure TS, deterministic where possible. Location: `src/lib/market/`.

- [ ] `generateNextTick(asset, lastPrice)` — random walk using `volatility`. Clamp to `basePrice * 0.1` min and `basePrice * 10` max.
- [ ] `advanceMarket()` — generates one new tick per asset and persists to `PriceTick` in a single transaction.
- [ ] `getLatestPrice(assetId)` — reads most recent tick. Cache in-memory per process for 1s to avoid hammering DB during polling.
- [ ] `getPriceHistory(assetId, limit)` — returns last N ticks in ascending order, for charts.
- [ ] `computePortfolioValue(userId)` — `sum(holding.quantity * latestPrice) + user.cashBalance`. Returns `{ totalValue, cash, holdingsValue, pnlPct }`.
- [ ] API route `POST /api/market/tick` — calls `advanceMarket()`. Client polls every ~5s while a price-sensitive screen is open.

---

## ✅ Phase 4 — AI provider abstraction (Vercel AI SDK)

> Skill: invoke `ai-provider`. Rules: `.claude/rules/ai.md`.

- [ ] `src/lib/ai/types.ts` — `AIProvider = "openai" | "anthropic" | "google"` + per-provider model whitelists.
- [ ] `src/lib/ai/crypto.ts` — AES-GCM `encrypt(plain)` / `decrypt(blob)` using `APP_SECRET` env var. Clearly comment: "MVP-grade only, not production key storage".
- [ ] `src/lib/ai/providers.ts` — `getLanguageModel(userId): Promise<LanguageModel | null>`:
  - Loads `AppSetting` for the user.
  - Returns `null` if missing.
  - Decrypts key, builds provider via `createOpenAI` / `createAnthropic` / `createGoogleGenerativeAI`.
  - Returns configured model.
- [ ] `src/lib/ai/coach.ts` — `generateCoachReply(userId, userMessage)`:
  - Loads user context (level, portfolio snapshot, last 3 missions).
  - Persists user message → `ChatMessage`.
  - Calls `generateText` with system prompt in Spanish.
  - Persists assistant response → `ChatMessage`.
  - Returns `{ ok, data | error }`. Never throws.
- [ ] `src/lib/ai/profiler.ts` — `classifyRiskProfile(userId, answers)`:
  - Uses `generateObject` with Zod schema `{ profile, reasoning }`.
  - Persists `user.riskProfile`.
- [ ] `src/lib/ai/feedback.ts` — `generateMissionFeedback(userId, missionId, result)` — short Spanish paragraph.
- [ ] `src/lib/ai/challenges.ts` — `generatePersonalizedMission(userId)` — returns a new Mission tailored to user's level/portfolio.
- [ ] **Fallback behavior:** if `getLanguageModel` returns `null`, every use case returns `{ ok: false, error: "no_provider_configured" }` and the UI shows: *"Configurá tu proveedor de IA en Ajustes"* with a link to `/settings`.
- [ ] API routes under `src/app/api/ai/`:
  - `POST /api/ai/coach`
  - `POST /api/ai/profile`
  - `POST /api/ai/feedback`
  - `POST /api/ai/challenge`
- [ ] 30s abort signal on every AI call. Log errors by message only — **never** the key or full options object.

---

## ✅ Phase 5 — Game logic

> Location: `src/lib/game/`.

- [ ] `levels.ts` — XP thresholds for 5 levels:
  - Rookie Investor (0), Smart Saver (100), Market Explorer (300), Wealth Builder (700), Master Investor (1500).
  - `getLevelFromXp(xp)` and `getLevelName(level)`.
- [ ] `xp.ts` — `awardXp(userId, amount, reason)`:
  - Updates `user.xp`.
  - Recalculates `user.level`.
  - Returns `{ newXp, newLevel, leveledUp: boolean }`.
- [ ] `missions.ts`:
  - `checkMissionProgress(userId, missionCode, context)` — dispatch on `mission.goalType`.
  - `completeMission(userId, missionId)` — creates/updates `UserMission`, awards XP, checks badges.
  - Goal types implemented: `first_trade`, `read_first_lesson`, `save_10pct`, `hold_3_days`, `diversify`, `complete_risk_profile`, `portfolio_return`, `hold_etf_week`, `rebalance_after_drop`.
- [ ] `badges.ts` — `checkAndAwardBadges(userId, event)` — rule-based.
- [ ] `ranking.ts` — `getLeaderboard(limit)`:
  - Returns top N users by XP.
  - Joins portfolio value.
  - Also computes "best return %" leaderboard.

---

## ✅ Phase 6 — User context (demo only)

- [ ] `src/stores/currentUser.ts` — Zustand store persisting `currentUserId` to `localStorage` via `persist` middleware.
- [ ] `src/hooks/useCurrentUser.ts` — convenience hook.
- [ ] `src/lib/auth.ts` — `getCurrentUserId(req)` helper (reads from header/body). Clearly document: **demo only, no real auth**.
- [ ] Top-right user switcher dropdown (visible on every screen):
  - Lists user1/user2/user3 with avatars.
  - Clicking switches `currentUserId` and reloads.
- [ ] All server actions / API routes validate `userId` exists in DB before proceeding.

---

## ✅ Phase 7 — Layout & navigation

> Rules: `.claude/rules/ui.md`. Skill: `shadcn-component` when installing primitives.

- [ ] `src/app/layout.tsx` — root layout:
  - Tailwind global styles.
  - `<ThemeProvider>` from `next-themes`.
  - `<Toaster />` from `sonner`.
  - Inter font or geist.
- [ ] `src/app/(dashboard)/layout.tsx` — app shell:
  - **Desktop (lg+):** left sidebar with nav links.
  - **Mobile (<lg):** bottom tab bar fixed at the bottom.
  - Top bar: user switcher + XP/level badge + theme toggle.
- [ ] Nav items (Spanish labels, English route slugs):
  - Inicio → `/`
  - Simulador → `/simulator`
  - Aprender → `/learn`
  - Coach → `/coach`
  - Ranking → `/ranking`
  - Ajustes → `/settings`
- [ ] Dark mode toggle (`next-themes`). Both themes must look clean.

---

## ✅ Phase 8 — Screens

> For each screen, invoke the `investquest-feature` skill. All copy in Spanish rioplatense.

### 🏠 8.1 Home Dashboard (`/`)
- [ ] Current level + XP progress bar to next level.
- [ ] Today's mission card ("Misión del día") with "Empezar" button.
- [ ] Portfolio snapshot: total value, today's change %, sparkline.
- [ ] AI Tip card — one-liner generated on load, cached per day per user. Graceful fallback if no provider.
- [ ] Quick links to Simulador and Coach.

### 📈 8.2 Simulador (`/simulator`)
- [ ] Tab 1 — "Mercado": list of assets with current price + 24h change (polling `/api/market/tick` every 5s).
- [ ] Asset detail `Sheet`: price chart (recharts, lazy-loaded), buy/sell form.
- [ ] Buy/sell server action:
  - Validates cash (buy) or holdings (sell).
  - Creates `Transaction` + upserts `Holding` + updates `cashBalance` in a single `db.$transaction`.
  - Awards XP on first trade, triggers mission checks.
- [ ] Tab 2 — "Mi cartera": list of holdings with current value, P&L, allocation pie chart.

### 📚 8.3 Aprender (`/learn`)
- [ ] Grid of lesson cards grouped by topic: Básicos, Renta Variable, Renta Fija, ETFs, Cripto, Estrategia.
- [ ] Each lesson is a markdown file in `src/content/lessons/*.md` with frontmatter `{title, topic, order, xpReward}`.
- [ ] Parse frontmatter with `gray-matter`, render body with `react-markdown`.
- [ ] "Completar lección" button awards XP once (idempotent via a `UserMission` with goalType `read_lesson:<slug>`).
- [ ] Seed ~8 lessons to cover the basics.

### 💬 8.4 Coach IA (`/coach`)
- [ ] Chat UI (shadcn bubbles), loads last 50 messages from DB.
- [ ] Input at bottom, submit via `POST /api/ai/coach`.
- [ ] Empty state when no provider: friendly Spanish CTA with link to `/settings`.
- [ ] Quick-prompt chips: "¿Qué es un ETF?", "¿Cómo diversifico?", "Analizá mi cartera".
- [ ] "Limpiar historial" button.

### 🏆 8.5 Ranking (`/ranking`)
- [ ] Tabs: "Por XP" / "Por rendimiento %".
- [ ] Table: rank, avatar, username, level, XP, portfolio value.
- [ ] Highlight current user's row.

### ⚙️ 8.6 Ajustes (`/settings`)
- [ ] Section **Proveedor de IA**:
  - Radio: OpenAI / Anthropic / Google.
  - Model dropdown (depends on provider).
  - API key input (type=password, show/hide toggle).
  - "Probar conexión" button → pings `POST /api/ai/coach` with a no-op prompt.
  - Save → encrypts and persists to `AppSetting`.
- [ ] Section **Perfil de riesgo**:
  - "Hacer test" → 5-question questionnaire → AI classifies → saves `user.riskProfile`.
  - Shows current profile if set.
- [ ] Section **Zona peligrosa**:
  - "Reiniciar mi progreso" → wipes XP, holdings, transactions, user missions, chat messages for current user. Double-confirm dialog.

---

## ✅ Phase 9 — Polish & QA

- [ ] `<Skeleton />` loading states on all data-fetching screens.
- [ ] Error boundaries (`error.tsx`) with friendly Spanish messages.
- [ ] Empty states everywhere: no holdings, no missions, no chat, no ranking, no lessons.
- [ ] Toasts for: mission completed, level up, badge awarded, trade executed, provider saved, errors.
- [ ] Keyboard accessible, visible focus rings, alt text on all icons.
- [ ] Mobile QA at 375px: bottom nav doesn't overlap content, dialogs fit viewport.
- [ ] Dark mode QA: every screen readable in both themes.
- [ ] `npm run db:reset` idempotency confirmed.
- [ ] Invoke `code-reviewer` subagent on the full codebase, fix blockers.
- [ ] Final `/verify` all green.
- [ ] README fully updated with setup, scripts, how to configure AI from UI, known limitations.

---

## 🚫 Out of Scope (v2+)

Real authentication (NextAuth/OAuth), real market data APIs (Yahoo Finance, etc.), real money / payments, native mobile apps (React Native), multiplayer realtime, push notifications, streaming AI responses, production-grade secret storage (KMS/vault), i18n (English UI), social features beyond the leaderboard.

---

## 📝 Conventions quick reference

- **Language:** UI Spanish rioplatense (vos), code & comments English.
- **Commits:** Conventional Commits in English (`feat(ai): ...`, `fix(market): ...`).
- **TS:** strict mode, no `any` without a justifying comment.
- **Validation:** Zod for every API input + AI JSON output.
- **Server actions** preferred over API routes. API routes only for market tick and AI endpoints.
- **No secrets in code.** `APP_SECRET` in `.env`. User API keys in SQLite, AES-GCM encrypted.
- **Before shipping a phase:** run `/verify`. Before closing a task: run `/ship`.
