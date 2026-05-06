"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getLatestPrice } from "@/lib/market/engine";
import { awardXp } from "@/lib/game/xp";
import { checkMissionProgress } from "@/lib/game/missions";
import { checkAndAwardBadges } from "@/lib/game/badges";

const TradeSchema = z.object({
  userId: z.string().min(1),
  assetId: z.string().min(1),
  type: z.enum(["buy", "sell"]),
  quantity: z.number().positive(),
});

type TradeResult = { ok: true; newBalance: number; badges: string[] } | { ok: false; error: string };

export async function executeTrade(input: z.infer<typeof TradeSchema>): Promise<TradeResult> {
  const parsed = TradeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const { userId, assetId, type, quantity } = parsed.data;

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, cashBalance: true } });
  if (!user) return { ok: false, error: "user_not_found" };

  const price = await getLatestPrice(assetId);
  if (price <= 0) return { ok: false, error: "asset_not_found" };

  const totalCost = price * quantity;

  if (type === "buy") {
    if (user.cashBalance < totalCost) return { ok: false, error: "insufficient_funds" };
  } else {
    const holding = await db.holding.findUnique({ where: { userId_assetId: { userId, assetId } } });
    if (!holding || holding.quantity < quantity) return { ok: false, error: "insufficient_holdings" };
  }

  let newBalance = 0;

  await db.$transaction(async (tx) => {
    await tx.transaction.create({ data: { userId, assetId, type, quantity, price } });

    if (type === "buy") {
      const existing = await tx.holding.findUnique({ where: { userId_assetId: { userId, assetId } } });
      if (existing) {
        const newQty = existing.quantity + quantity;
        const newAvg = (existing.avgBuyPrice * existing.quantity + price * quantity) / newQty;
        await tx.holding.update({
          where: { userId_assetId: { userId, assetId } },
          data: { quantity: newQty, avgBuyPrice: newAvg },
        });
      } else {
        await tx.holding.create({ data: { userId, assetId, quantity, avgBuyPrice: price } });
      }
      await tx.user.update({ where: { id: userId }, data: { cashBalance: { decrement: totalCost } } });
    } else {
      const holding = await tx.holding.findUnique({ where: { userId_assetId: { userId, assetId } } });
      const newQty = (holding?.quantity ?? 0) - quantity;
      if (newQty <= 0) {
        await tx.holding.delete({ where: { userId_assetId: { userId, assetId } } });
      } else {
        await tx.holding.update({ where: { userId_assetId: { userId, assetId } }, data: { quantity: newQty } });
      }
      await tx.user.update({ where: { id: userId }, data: { cashBalance: { increment: totalCost } } });
    }

    const updatedUser = await tx.user.findUnique({ where: { id: userId }, select: { cashBalance: true } });
    newBalance = updatedUser?.cashBalance ?? 0;
  });

  // Check first trade milestone
  const tradeCount = await db.transaction.count({ where: { userId } });
  const isFirstTrade = tradeCount === 1;

  const badges: string[] = [];
  if (isFirstTrade) {
    await awardXp(userId, 50, "first_trade");
    const awarded = await checkAndAwardBadges(userId, { type: "first_trade" });
    badges.push(...awarded);
    await checkMissionProgress(userId, "first_trade", { tradeCount });
  }

  // Check diversification
  const holdings = await db.holding.findMany({
    where: { userId },
    include: { asset: { select: { type: true } } },
  });
  const assetTypes = new Set(holdings.map((h) => h.asset.type));
  if (assetTypes.size >= 3) {
    const awarded = await checkAndAwardBadges(userId, { type: "diversified", assetTypeCount: assetTypes.size });
    badges.push(...awarded);
    await checkMissionProgress(userId, "diversify_3_types", { assetTypeCount: assetTypes.size });
  }

  return { ok: true, newBalance, badges };
}
