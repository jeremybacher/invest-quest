import Link from "next/link";
import {
  TrendingUp, TrendingDown, MessageCircle, Target, Zap,
  ChevronRight, BookOpen, Trophy, Wallet, Settings,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { computePortfolioValue } from "@/lib/market/engine";
import { getLevelName, XP_THRESHOLDS } from "@/lib/game/levels";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
  expert: "Experto",
  legendary: "Legendario",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium:    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard:      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  expert:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  legendary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

export default async function HomePage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h1 className="text-2xl font-bold">¡Bienvenido a InvestQuest!</h1>
        <p className="text-muted-foreground">Cargando tu perfil…</p>
      </div>
    );
  }

  const [user, portfolio, hasSetting] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { displayName: true, level: true, xp: true },
    }),
    computePortfolioValue(userId),
    db.appSetting.findUnique({ where: { userId }, select: { id: true } }).then(Boolean),
  ]);

  if (!user) return <div className="text-muted-foreground">Usuario no encontrado.</div>;

  const suggestedMission = await db.userMission.findFirst({
    where: { userId, status: { not: "completed" } },
    orderBy: { mission: { difficulty: "asc" } },
    include: { mission: { select: { title: true, description: true, xpReward: true, difficulty: true } } },
  });

  const nextXpThreshold = XP_THRESHOLDS[user.level] ?? null;
  // Bar shows total XP vs the next level's threshold so earned XP always counts
  const xpPct = nextXpThreshold !== null ? Math.min((user.xp / nextXpThreshold) * 100, 100) : 100;
  const xpToNext = nextXpThreshold !== null ? nextXpThreshold - user.xp : 0;

  const isGain = portfolio.pnlPct >= 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── Greeting ───────────────────────────────────────────── */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold tracking-tight">Hola, {user.displayName}!</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Aquí está tu resumen de hoy.</p>
      </div>

      {/* ── Portfolio hero ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-5 text-white shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/40">
        <p className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-4">Mi Portfolio</p>

        {/* Main value */}
        <p className="text-4xl font-black tracking-tight tabular-nums">
          {formatCurrency(portfolio.totalValue)}
        </p>

        {/* Breakdown row */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
          <div>
            <p className="text-xs text-indigo-300">Efectivo</p>
            <p className="font-semibold text-sm tabular-nums mt-0.5">{formatCurrency(portfolio.cash)}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-300">Invertido</p>
            <p className="font-semibold text-sm tabular-nums mt-0.5">{formatCurrency(portfolio.holdingsValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-300">G/P</p>
            {portfolio.costBasis > 0 ? (
              <div className="mt-0.5">
                <div className={cn("flex items-center justify-end gap-1", isGain ? "text-emerald-300" : "text-red-300")}>
                  {isGain
                    ? <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    : <TrendingDown className="h-3.5 w-3.5 shrink-0" />}
                  <p className="font-bold text-sm tabular-nums">
                    {isGain ? "+" : ""}{portfolio.pnlPct.toFixed(2)}%
                  </p>
                </div>
                <p className={cn("text-xs tabular-nums mt-0.5", isGain ? "text-emerald-300/70" : "text-red-300/70")}>
                  {isGain ? "+" : ""}{formatCurrency(portfolio.pnlAmount)}
                </p>
                <p className="text-xs text-indigo-300/50 mt-0.5">vs. precio de compra</p>
              </div>
            ) : (
              <p className="text-sm text-indigo-200/50 mt-0.5">—</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/simulator"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-sm font-medium"
          >
            <TrendingUp className="h-4 w-4" />
            Simulador
          </Link>
          <Link
            href="/coach"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-sm font-medium"
          >
            <MessageCircle className="h-4 w-4" />
            Coach IA
          </Link>
        </div>
      </div>

      {/* ── Level & XP ─────────────────────────────────────────── */}
      <Card className="border-border/60">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 shrink-0">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold leading-none">
                  Nv. {user.level} — {getLevelName(user.level)}
                </p>
                {/* total XP / next threshold — matches the bar */}
                <span className="text-xs font-medium tabular-nums text-muted-foreground shrink-0">
                  {user.xp} / {nextXpThreshold ?? "MAX"} XP
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextXpThreshold !== null
                  ? <>Próximo: <span className="font-medium text-foreground">{getLevelName(user.level + 1)}</span> · <span className="text-primary font-medium">{xpToNext} XP más</span></>
                  : "¡Llegaste al nivel máximo!"}
              </p>
            </div>
          </div>
          <Progress value={xpPct} className="h-2 rounded-full" />
        </CardContent>
      </Card>

      {/* ── Mission ────────────────────────────────────────────── */}
      {suggestedMission ? (
        <Card className="border-amber-200/60 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 shrink-0 mt-0.5">
                <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Misión pendiente</p>
                  {suggestedMission.mission.difficulty && (
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", DIFFICULTY_COLORS[suggestedMission.mission.difficulty])}>
                      {DIFFICULTY_LABELS[suggestedMission.mission.difficulty] ?? suggestedMission.mission.difficulty}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-xs gap-1 ml-auto shrink-0">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    +{suggestedMission.mission.xpReward} XP
                  </Badge>
                </div>
                <p className="font-semibold text-sm">{suggestedMission.mission.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{suggestedMission.mission.description}</p>
                <Button size="sm" asChild className="mt-3 gap-1.5 h-8">
                  <Link href="/simulator">
                    Ir al simulador
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* All missions done → next steps */
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0.5">¿Qué hacés ahora?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { href: "/simulator", icon: TrendingUp,  label: "Seguir invirtiendo",  desc: "Operá en el mercado",      color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30" },
              { href: "/learn",     icon: BookOpen,    label: "Aprender",             desc: "Completá una lección",     color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" },
              { href: "/ranking",   icon: Trophy,      label: "Ver el ranking",       desc: "Compará con otros",        color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30" },
            ].map(({ href, icon: Icon, label, desc, color, bg }) => (
              <Link key={href} href={href} className={cn("flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm", bg)}>
                <Icon className={cn("h-5 w-5 shrink-0", color)} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── AI setup nudge (only when not configured) ──────────── */}
      {!hasSetting && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-primary/30 bg-primary/3">
          <Settings className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            Activá el <span className="font-medium text-foreground">Coach IA</span> para recibir análisis personalizados.
          </p>
          <Link href="/settings" className="text-xs font-semibold text-primary hover:underline shrink-0">
            Configurar
          </Link>
        </div>
      )}

    </div>
  );
}
