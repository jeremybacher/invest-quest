---
description: Reset the SQLite database — wipe, migrate, and reseed demo data
allowed-tools: Bash
---

# Reset DB

Bring the local SQLite database back to a known good state with fresh seed data.

## Steps

1. Confirm with the user: "Esto va a borrar toda la data local. ¿Seguís?" Wait for a clear yes.
2. Run:
   ```bash
   rm -f prisma/dev.db prisma/dev.db-journal
   npx prisma migrate deploy
   npm run db:seed
   ```
3. Verify the seed ran cleanly — check that user1/user2/user3 exist, assets are seeded, and missions are seeded.
4. Report done.

Never run this in production or against a non-dev database. The command assumes `prisma/dev.db` — if that path differs, stop and ask.
