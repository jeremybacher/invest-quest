import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getLatestPrice, computePortfolioValue } from "@/lib/market/engine";
import { SimulatorClient } from "./SimulatorClient";

export default async function SimulatorPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Cargando…</p>
      </div>
    );
  }

  const [assets, user, portfolio] = await Promise.all([
    db.asset.findMany({ orderBy: { type: "asc" } }),
    db.user.findUnique({ where: { id: userId }, select: { cashBalance: true } }),
    computePortfolioValue(userId),
  ]);

  const holdings = await db.holding.findMany({
    where: { userId },
    include: { asset: true },
  });

  // Enrich assets with latest price
  const assetsWithPrice = await Promise.all(
    assets.map(async (a) => ({ ...a, currentPrice: await getLatestPrice(a.id) }))
  );

  const holdingsWithValue = holdings.map((h) => {
    const assetWithPrice = assetsWithPrice.find((a) => a.id === h.assetId);
    const currentPrice = assetWithPrice?.currentPrice ?? h.avgBuyPrice;
    const value = h.quantity * currentPrice;
    const pnl = ((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
    return { ...h, asset: { ...h.asset, currentPrice }, currentPrice, value, pnl };
  });

  return (
    <SimulatorClient
      key={userId}
      userId={userId}
      assets={assetsWithPrice}
      holdings={holdingsWithValue}
      cashBalance={user?.cashBalance ?? 0}
      portfolio={portfolio}
    />
  );
}
