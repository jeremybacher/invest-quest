# InvestQuest — Project Constitution

> This file is loaded at the start of every Claude Code session. Keep it concise (<200 lines).  
> For detailed/modular instructions, see `.claude/rules/`. For live project state, see `.claude/CONTEXT.md`.

## 🎯 What this project is

InvestQuest is an educational fintech web app that teaches investing through gamified simulations and AI guidance. Users complete missions, run simulations with fake market data, and chat with an AI Coach to learn about stocks, bonds, ETFs, and crypto in a risk-free environment.

## 🛠️ Stack (non-negotiable)

- **Framework:** Next.js 14+ App Router, TypeScript strict mode
- **UI:** Tailwind + shadcn/ui + lucide-react icons
- **State:** Zustand (client), server actions (server)
- **DB:** SQLite + Prisma (MVP), designed so Postgres swap is trivial
- **AI:** Vercel AI SDK (`ai` + `@ai-sdk/{openai,anthropic,google}`), non-streaming
- **Validation:** Zod for every API input and every AI JSON output
- **Forms:** react-hook-form + zodResolver
- **Charts:** recharts (lazy-loaded)
- **Markdown:** react-markdown (for lessons)
- **Node:** >= 20, package manager: `npm`

## 📐 Architecture rules

1. **Server actions first** — only use API routes when needed for polling endpoints (e.g., market tick) or AI calls.
2. **Thin routes, fat lib.** Business logic lives in `src/lib/` (game, market, ai). Route handlers and server actions just validate input → call lib → return result.
3. **No business logic in components.** Components render. Hooks orchestrate. Lib computes.
4. **Every Prisma query goes through `src/lib/db.ts`** (singleton client). No `new PrismaClient()` anywhere else.
5. **AI provider abstraction** — all AI calls go through `src/lib/ai/providers.ts` which returns a Vercel AI SDK `LanguageModel`. Never import provider SDKs directly from features.
6. **Fail-soft AI** — if no provider is configured or a call fails, show a friendly Spanish empty state. Never crash the UI.

## 🗂️ Directory layout

```
src/
├── app/                     # Next.js routes (App Router)
│   ├── (dashboard)/         # group: home, simulator, learn, coach, ranking, settings
│   └── api/                 # route handlers (ai/*, market/tick)
├── components/
│   ├── ui/                  # shadcn primitives (don't edit manually unless needed)
│   └── features/            # domain components per screen
├── lib/
│   ├── db.ts                # Prisma singleton
│   ├── ai/                  # provider abstraction + use cases
│   ├── game/                # xp, levels, missions, badges, ranking
│   ├── market/              # fake market engine
│   └── utils.ts
├── hooks/
├── stores/                  # zustand
├── types/
└── content/lessons/         # markdown lessons with frontmatter

prisma/
├── schema.prisma
└── seed.ts
```

## 🈳 Language conventions

- **UI copy:** Spanish rioplatense (use "vos", natural tone). Example: "Iniciá tu primera inversión", not "Empieza tu primera inversión".
- **Code:** English — identifiers, types, comments, commit messages, log messages.
- **Database:** English column names.
- **Error messages shown to user:** Spanish. Error messages in logs: English.

## 🎨 Code style

- **TypeScript strict:** no `any` without a `// NOTE:` comment justifying it.
- **Named exports** preferred over default exports (except Next.js pages/layouts where default is required).
- **No barrel files** (`index.ts` re-exports) unless they improve DX meaningfully. They hurt tree-shaking and hot-reload.
- **Path alias:** `@/*` → `src/*`. Use it everywhere instead of relative imports across folders.
- **Zod schemas** live next to their consumer, named `<Thing>Schema`, with inferred type `<Thing>`.
- **Server actions** must be marked `"use server"` and exported individually. Return `{ ok: true, data }` or `{ ok: false, error }` — never throw to the client.
- **Components:** one component per file, filename matches component name in PascalCase.
- **Tailwind:** use shadcn tokens (`bg-background`, `text-foreground`, etc.). Avoid hardcoded hex colors.

## 🔐 Security / privacy

- **No real auth** — MVP uses a demo user switcher (user1/user2/user3). Document this clearly everywhere `userId` is accepted from the client.
- **User API keys** (for AI providers) are stored in SQLite encrypted with AES-GCM using `APP_SECRET` env var. This is **not production-grade**; mark it as such in comments.
- **Never commit** `.env`, `dev.db`, or `CLAUDE.local.md`. Check `.gitignore` before suggesting a commit.
- **Never log** API keys, encrypted or decrypted, ever.

## 🧪 Build / test commands

```bash
npm run dev              # start dev server on :3000
npm run build            # production build (must pass before any commit)
npm run lint             # eslint
npm run typecheck        # tsc --noEmit
npx prisma migrate dev   # apply schema changes
npx prisma studio        # inspect DB
npm run db:seed          # seed demo data (idempotent)
npm run db:reset         # wipe + migrate + seed
```

**Before marking any TODO phase complete:** run `npm run typecheck && npm run lint && npm run build`. All three must pass.

## 🔁 Workflow expectations

1. **Always read `.claude/CONTEXT.md` first** at the start of a session to understand current state.
2. **Always update `.claude/CONTEXT.md`** at the end of a meaningful task or phase (see its own instructions).
3. **Follow TODO.md** — work phase by phase, tick checkboxes as you complete items. Don't skip phases.
4. **Ask before scope creep.** If a task requires changing something outside the current TODO phase, stop and surface it.
5. **Prefer small commits** with Conventional Commits messages in English (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
6. **Plan mode for non-trivial tasks.** For anything touching 3+ files or introducing a new pattern, produce a short plan first.

## 🚫 Out of scope (v2+)

Real auth, real market data APIs, real money, native mobile apps, multiplayer realtime, push notifications, streaming AI responses, production-grade secret storage, i18n.

## 📎 Pointers

- Full build plan: `TODO.md`
- Live project state: `.claude/CONTEXT.md`
- Path-specific rules: `.claude/rules/*.md`
- Custom skills: `.claude/skills/*/SKILL.md`
- Slash commands: `.claude/commands/*.md`
- Subagents: `.claude/agents/*.md`
