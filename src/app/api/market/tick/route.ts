import { NextResponse } from "next/server";
import { advanceMarket, getLatestPrice } from "@/lib/market/engine";
import { db } from "@/lib/db";

export async function POST() {
  try {
    await advanceMarket();
    const assets = await db.asset.findMany({ select: { id: true } });
    const prices: Record<string, number> = {};
    await Promise.all(assets.map(async (a) => {
      prices[a.id] = await getLatestPrice(a.id);
    }));
    return NextResponse.json({ ok: true, prices });
  } catch (err) {
    console.error("[market/tick] failed:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ ok: false, error: "tick_failed" }, { status: 500 });
  }
}
