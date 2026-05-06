import { db } from "@/lib/db";
import type { Asset } from "@prisma/client";

const priceCache = new Map<string, { price: number; ts: number }>();

export function generateNextTick(asset: Pick<Asset, "basePrice" | "volatility">, lastPrice: number): number {
  const change = (Math.random() * 2 - 1) * asset.volatility * lastPrice;
  const next = lastPrice + change;
  return Math.max(asset.basePrice * 0.1, Math.min(asset.basePrice * 10, next));
}

export async function advanceMarket(): Promise<void> {
  const assets = await db.asset.findMany({ select: { id: true, basePrice: true, volatility: true } });

  await db.$transaction(async (tx) => {
    for (const asset of assets) {
      const last = await tx.priceTick.findFirst({
        where: { assetId: asset.id },
        orderBy: { timestamp: "desc" },
        select: { price: true },
      });
      const lastPrice = last?.price ?? asset.basePrice;
      const price = generateNextTick(asset, lastPrice);

      await tx.priceTick.create({ data: { assetId: asset.id, price } });
      priceCache.set(asset.id, { price, ts: Date.now() });
    }
  });
}

export async function getLatestPrice(assetId: string): Promise<number> {
  const cached = priceCache.get(assetId);
  if (cached && Date.now() - cached.ts < 1000) return cached.price;

  const tick = await db.priceTick.findFirst({
    where: { assetId },
    orderBy: { timestamp: "desc" },
    select: { price: true },
  });

  const price = tick?.price ?? 0;
  priceCache.set(assetId, { price, ts: Date.now() });
  return price;
}

export async function getPriceHistory(
  assetId: string,
  limit = 50
): Promise<{ price: number; timestamp: Date }[]> {
  const ticks = await db.priceTick.findMany({
    where: { assetId },
    orderBy: { timestamp: "desc" },
    take: limit,
    select: { price: true, timestamp: true },
  });
  return ticks.reverse();
}

export async function computePortfolioValue(
  userId: string
): Promise<{ totalValue: number; cash: number; holdingsValue: number; costBasis: number; pnlAmount: number; pnlPct: number }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { cashBalance: true, holdings: { select: { quantity: true, avgBuyPrice: true, assetId: true } } },
  });
  if (!user) return { totalValue: 0, cash: 0, holdingsValue: 0, costBasis: 0, pnlAmount: 0, pnlPct: 0 };

  let holdingsValue = 0;
  let costBasis = 0;

  for (const h of user.holdings) {
    const price = await getLatestPrice(h.assetId);
    holdingsValue += h.quantity * price;
    costBasis += h.quantity * h.avgBuyPrice;
  }

  const totalValue = user.cashBalance + holdingsValue;
  const pnlAmount = holdingsValue - costBasis;
  const pnlPct = costBasis > 0 ? (pnlAmount / costBasis) * 100 : 0;

  return { totalValue, cash: user.cashBalance, holdingsValue, costBasis, pnlAmount, pnlPct };
}
