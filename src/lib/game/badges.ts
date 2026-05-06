import { db } from "@/lib/db";

type BadgeEvent =
  | { type: "first_trade" }
  | { type: "diversified"; assetTypeCount: number }
  | { type: "bull_rider"; pnlPct: number }
  | { type: "streak"; days: number }
  | { type: "level_up"; level: number };

export async function checkAndAwardBadges(userId: string, event: BadgeEvent): Promise<string[]> {
  const awarded: string[] = [];

  async function award(code: string) {
    const badge = await db.badge.findUnique({ where: { code } });
    if (!badge) return;
    await db.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      create: { userId, badgeId: badge.id },
      update: {},
    });
    awarded.push(code);
  }

  switch (event.type) {
    case "first_trade":
      await award("first_trade");
      break;
    case "diversified":
      if (event.assetTypeCount >= 3) await award("diversified");
      break;
    case "bull_rider":
      if (event.pnlPct >= 10) await award("bull_rider");
      break;
    case "streak":
      if (event.days >= 3) await award("streak_3");
      if (event.days >= 7) await award("streak_7");
      break;
    case "level_up":
      if (event.level >= 5) await award("master");
      break;
  }

  return awarded;
}
