# InvestQuest

Educational fintech simulator that teaches investing through gamified missions, fake market data, and AI coaching. Built with Next.js 16 App Router, SQLite + Prisma 5, shadcn/ui, and Vercel AI SDK.

**Demo-only — no real authentication, no real money.**

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set APP_SECRET to a 32-byte base64 string
# Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Run database migrations
node_modules/.bin/prisma migrate deploy

# 4. Seed demo data
npm run db:seed

# 5. Start dev server
npm run dev
# Open http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint check |
| `npm run db:seed` | Seed demo data (idempotent) |
| `npm run db:reset` | Wipe DB, migrate, and reseed |

## Configure AI (from UI)

1. Open the app → **Ajustes** (Settings)
2. Choose your AI provider: OpenAI, Anthropic, or Google
3. Select a model and enter your API key
4. Click **Probar conexión** to verify
5. The Coach IA and risk profile features will now work

API keys are stored encrypted (AES-GCM) in SQLite using `APP_SECRET`. **This is MVP-grade encryption, not production-ready.**

## Demo Users

Three pre-seeded demo accounts: `user1` (Ana), `user2` (Bruno), `user3` (Carla). Switch between them using the top-right dropdown.

## Known Limitations

- No real authentication — user switching is purely client-side demo
- No real market data — prices are random-walk simulations
- AES-GCM key storage is not production-grade
- No streaming AI responses
- AI provider requires a valid API key from OpenAI, Anthropic, or Google
