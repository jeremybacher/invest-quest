"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { executeTrade } from "./actions";
import { TrendingUp, TrendingDown, Wallet, BarChart2, Layers, Bitcoin, Landmark } from "lucide-react";

type Asset = { id: string; ticker: string; name: string; type: string; currentPrice: number; basePrice: number; volatility: number };
type Holding = { id: string; assetId: string; quantity: number; avgBuyPrice: number; currentPrice: number; value: number; pnl: number; asset: Asset };
type Portfolio = { totalValue: number; cash: number; holdingsValue: number; pnlPct: number };

type Props = {
  userId: string;
  assets: Asset[];
  holdings: Holding[];
  cashBalance: number;
  portfolio: Portfolio;
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  stock:  { label: "Acción", color: "text-blue-700 dark:text-blue-300",   bg: "bg-blue-100 dark:bg-blue-900/30",    icon: BarChart2 },
  etf:    { label: "ETF",    color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: Layers },
  bond:   { label: "Bono",   color: "text-amber-700 dark:text-amber-300",  bg: "bg-amber-100 dark:bg-amber-900/30",  icon: Landmark },
  crypto: { label: "Cripto", color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-100 dark:bg-violet-900/30", icon: Bitcoin },
};

function AssetIcon({ type, size = "md" }: { type: string; size?: "sm" | "md" }) {
  const cfg = TYPE_CONFIG[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <div className={cn("flex items-center justify-center rounded-lg shrink-0", cfg.bg, size === "md" ? "w-10 h-10" : "w-8 h-8")}>
      <Icon className={cn(cfg.color, size === "md" ? "h-5 w-5" : "h-4 w-4")} />
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type];
  if (!cfg) return null;
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  );
}

export function SimulatorClient({ userId, assets: initialAssets, holdings: initialHoldings, cashBalance: initialCash, portfolio: initialPortfolio }: Props) {
  const [assets, setAssets] = useState(initialAssets);
  const [holdings] = useState(initialHoldings);
  const [cash, setCash] = useState(initialCash);
  const [portfolio] = useState(initialPortfolio);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  const tickMarket = useCallback(async () => {
    try {
      const res = await fetch("/api/market/tick", { method: "POST" });
      const data = await res.json() as { ok: boolean; prices?: Record<string, number> };
      if (data.ok && data.prices) {
        const prices = data.prices;
        setAssets((prev) =>
          prev.map((a) => {
            const next = prices[a.id];
            return next !== undefined ? { ...a, currentPrice: next } : a;
          })
        );
        const flashedIds = new Set(Object.keys(prices));
        setFlashIds(flashedIds);
        setTimeout(() => setFlashIds(new Set()), 700);
      }
    } catch {
      // silently ignore tick failures
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(tickMarket, 5000);
    return () => clearInterval(interval);
  }, [tickMarket]);

  async function handleTrade() {
    if (!selectedAsset) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Ingresá una cantidad válida");
      return;
    }

    setLoading(true);
    const result = await executeTrade({ userId, assetId: selectedAsset.id, type: tradeType, quantity: qty });
    setLoading(false);

    if (!result.ok) {
      const messages: Record<string, string> = {
        insufficient_funds: "No tenés suficiente efectivo",
        insufficient_holdings: "No tenés suficiente cantidad de este activo",
        invalid_input: "Datos inválidos",
      };
      toast.error(messages[result.error] ?? "Error al ejecutar la operación");
      return;
    }

    toast.success(`${tradeType === "buy" ? "Compra" : "Venta"} ejecutada correctamente`);
    if (result.badges.length > 0) {
      toast("🏆 ¡Badge desbloqueado!", { description: result.badges.join(", ") });
    }
    setCash(result.newBalance);
    setSelectedAsset(null);
    setQuantity("1");
  }

  const liveSelectedAsset = selectedAsset ? (assets.find((a) => a.id === selectedAsset.id) ?? selectedAsset) : null;
  const selectedHolding = liveSelectedAsset ? holdings.find((h) => h.assetId === liveSelectedAsset.id) : null;
  const totalCost = liveSelectedAsset ? parseFloat(quantity || "0") * liveSelectedAsset.currentPrice : 0;
  const maxBuy = liveSelectedAsset ? Math.floor((cash / liveSelectedAsset.currentPrice) * 10000) / 10000 : 0;
  const maxSell = selectedHolding?.quantity ?? 0;
  const isGain = portfolio.pnlPct >= 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulador</h1>
          <p className="text-sm text-muted-foreground">Mercado actualizado cada 5 segundos</p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-xl px-4 py-2.5 shadow-sm">
          <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground leading-none">Efectivo</p>
            <p className="font-bold text-sm leading-tight">{formatCurrency(cash)}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="market">
        <TabsList className="w-full">
          <TabsTrigger value="market" className="flex-1">Mercado</TabsTrigger>
          <TabsTrigger value="portfolio" className="flex-1">Mi Cartera</TabsTrigger>
        </TabsList>

        {/* Market tab */}
        <TabsContent value="market" className="space-y-2 mt-4">
          {assets.map((asset) => {
            const change = ((asset.currentPrice - asset.basePrice) / asset.basePrice) * 100;
            const gainColor = change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400";
            const flashing = flashIds.has(asset.id);
            return (
              <Card
                key={asset.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all hover:border-primary/20 group",
                  flashing && (change >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20"),
                )}
                onClick={() => {
                  setSelectedAsset(asset);
                  setTradeType("buy");
                  setQuantity("1");
                }}
              >
                <CardContent className="py-3 flex items-center gap-3">
                  <AssetIcon type={asset.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{asset.ticker}</span>
                      <TypeBadge type={asset.type} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("font-bold text-sm transition-colors", flashing && (change >= 0 ? "text-emerald-600" : "text-red-500"))}>
                      {formatCurrency(asset.currentPrice)}
                    </p>
                    <p className={cn("text-xs font-medium flex items-center justify-end gap-0.5", gainColor)}>
                      {change >= 0
                        ? <TrendingUp className="h-3 w-3" />
                        : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(change).toFixed(2)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Portfolio tab */}
        <TabsContent value="portfolio" className="space-y-4 mt-4">
          {/* Summary card */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-4 text-white shadow-md">
            <p className="text-xs font-medium text-indigo-200 mb-3">Resumen de cartera</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-indigo-200 text-xs">Total</p>
                <p className="font-bold">{formatCurrency(portfolio.totalValue)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs">Invertido</p>
                <p className="font-bold">{formatCurrency(portfolio.holdingsValue)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs">Rendimiento</p>
                <p className={cn("font-bold", isGain ? "text-emerald-300" : "text-red-300")}>
                  {isGain ? "▲" : "▼"} {Math.abs(portfolio.pnlPct).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Todavía no invertiste</p>
              <p className="text-sm mt-1">¡Elegí tu primer activo en el mercado!</p>
            </div>
          ) : (
            holdings.map((h) => (
              <Card
                key={h.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/20"
                onClick={() => {
                  setSelectedAsset(h.asset);
                  setTradeType("sell");
                  setQuantity("1");
                }}
              >
                <CardContent className="py-3 flex items-center gap-3">
                  <AssetIcon type={h.asset.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{h.asset.ticker}</span>
                      <TypeBadge type={h.asset.type} />
                    </div>
                    <p className="text-xs text-muted-foreground">{h.quantity.toFixed(4)} unidades</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{formatCurrency(h.value)}</p>
                    <p className={cn(
                      "text-xs font-medium flex items-center justify-end gap-0.5",
                      h.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
                    )}>
                      {h.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(h.pnl).toFixed(2)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Trade sheet */}
      <Sheet open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <SheetContent className="flex flex-col gap-0 p-0">
          {/* Sheet header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              {liveSelectedAsset && <AssetIcon type={liveSelectedAsset.type} />}
              <div>
                <SheetTitle className="text-left leading-tight">{liveSelectedAsset?.ticker}</SheetTitle>
                <p className="text-sm text-muted-foreground">{liveSelectedAsset?.name}</p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Buy / Sell toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setTradeType("buy")}
                className={cn(
                  "py-2.5 rounded-lg text-sm font-semibold transition-all",
                  tradeType === "buy"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Comprar
              </button>
              <button
                onClick={() => { if (selectedHolding) setTradeType("sell"); }}
                disabled={!selectedHolding}
                className={cn(
                  "py-2.5 rounded-lg text-sm font-semibold transition-all",
                  tradeType === "sell"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                  !selectedHolding && "opacity-40 cursor-not-allowed",
                )}
              >
                Vender
              </button>
            </div>

            {/* Price info block */}
            <div className="rounded-xl bg-muted/50 border p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio actual</span>
                <span className="font-semibold tabular-nums">{formatCurrency(liveSelectedAsset?.currentPrice ?? 0)}</span>
              </div>
              {selectedHolding && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">En cartera</span>
                  <span className="font-semibold">{selectedHolding.quantity.toFixed(4)} unidades</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Efectivo disponible</span>
                <span className="font-semibold">{formatCurrency(cash)}</span>
              </div>
            </div>

            {/* Quantity input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="quantity">Cantidad</Label>
                <button
                  onClick={() => setQuantity(tradeType === "buy" ? String(maxBuy) : String(maxSell))}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Máximo
                </button>
              </div>
              <Input
                id="quantity"
                type="number"
                min="0.0001"
                step="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Total */}
            <div className={cn(
              "rounded-xl p-4 flex items-center justify-between",
              tradeType === "buy" ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40" : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40",
            )}>
              <span className="text-sm font-medium">Total</span>
              <span className={cn(
                "font-bold text-lg",
                tradeType === "buy" ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400",
              )}>
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          {/* Confirm button */}
          <div className="px-6 pb-6 pt-4 border-t">
            <Button
              className={cn(
                "w-full h-12 text-base font-semibold",
                tradeType === "buy"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white",
              )}
              onClick={handleTrade}
              disabled={loading}
            >
              {loading ? "Procesando…" : tradeType === "buy" ? "Confirmar compra" : "Confirmar venta"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
