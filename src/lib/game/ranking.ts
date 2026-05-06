import { db } from "@/lib/db";
import { getLatestPrice } from "@/lib/market/engine";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  level: number;
  xp: number;
  portfolioValue: number;
  returnPct: number;
};

export async function getLeaderboard(limit = 10): Promise<{
  byXp: LeaderboardEntry[];
  byReturn: LeaderboardEntry[];
}> {
  const users = await db.user.findMany({
    take: limit * 2,
    orderBy: { xp: "desc" },
    select: {
      id: true,
      username: true,
      displayName: true,
      level: true,
      xp: true,
      cashBalance: true,
      holdings: { select: { quantity: true, avgBuyPrice: true, assetId: true } },
    },
  });

  const entries: LeaderboardEntry[] = await Promise.all(
    users.map(async (user, i) => {
      let holdingsValue = 0;
      let costBasis = 0;
      for (const h of user.holdings) {
        const price = await getLatestPrice(h.assetId);
        holdingsValue += h.quantity * price;
        costBasis += h.quantity * h.avgBuyPrice;
      }
      const portfolioValue = user.cashBalance + holdingsValue;
      const returnPct = costBasis > 0 ? ((holdingsValue - costBasis) / costBasis) * 100 : 0;
      return { rank: i + 1, userId: user.id, username: user.username, displayName: user.displayName, level: user.level, xp: user.xp, portfolioValue, returnPct };
    })
  );

  const byXp = [...entries].sort((a, b) => b.xp - a.xp).slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 }));
  const byReturn = [...entries].sort((a, b) => b.returnPct - a.returnPct).slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 }));

  return { byXp, byReturn };
}
