import { getCurrentUserId } from "@/lib/auth";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/game/ranking";
import { getLevelName } from "@/lib/game/levels";
import { formatCurrency, cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Zap } from "lucide-react";

const MEDAL = [
  { label: "1°", numColor: "text-yellow-500", ring: "ring-yellow-400", bg: "bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20", border: "border-yellow-300 dark:border-yellow-700", avatarBg: "bg-yellow-100 dark:bg-yellow-900/40", avatarText: "text-yellow-700 dark:text-yellow-300", iconColor: "text-yellow-500", size: "h-20 w-20" },
  { label: "2°", numColor: "text-slate-400",   ring: "ring-slate-300",  bg: "bg-gradient-to-b from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/20",   border: "border-slate-200 dark:border-slate-700",   avatarBg: "bg-slate-100 dark:bg-slate-800",          avatarText: "text-slate-600 dark:text-slate-300",   iconColor: "text-slate-400", size: "h-16 w-16" },
  { label: "3°", numColor: "text-orange-400",  ring: "ring-orange-300", bg: "bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10", border: "border-orange-200 dark:border-orange-800",  avatarBg: "bg-orange-100 dark:bg-orange-900/30",     avatarText: "text-orange-600 dark:text-orange-300", iconColor: "text-orange-400", size: "h-16 w-16" },
];

function PodiumCard({ entry, currentUserId }: { entry: LeaderboardEntry; currentUserId: string | null }) {
  const m = MEDAL[entry.rank - 1]!;
  const isMe = entry.userId === currentUserId;
  // podium height: #1 tallest, #2 medium, #3 shorter
  const podiumOrder = entry.rank === 1 ? "order-2" : entry.rank === 2 ? "order-1" : "order-3";

  return (
    <div className={cn("flex flex-col items-center gap-2 flex-1 min-w-0", podiumOrder)}>
      <div className={cn("w-full rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all", m.bg, m.border, isMe && "ring-2 ring-primary ring-offset-2")}>
        <span className={cn("text-xs font-bold tracking-wide", m.numColor)}>{m.label}</span>
        <Avatar className={cn("ring-2 ring-offset-1", m.ring, m.size)}>
          <AvatarFallback className={cn("font-black text-2xl", m.avatarBg, m.avatarText)}>
            {entry.displayName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-sm truncate max-w-[100px]">{entry.displayName}</p>
          <p className="text-xs text-muted-foreground">{getLevelName(entry.level)}</p>
          {isMe && <Badge variant="secondary" className="text-xs mt-1">Vos</Badge>}
        </div>
        <div className="w-full border-t pt-2 mt-1 space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Zap className={cn("h-3.5 w-3.5", m.iconColor)} />
            <span className={cn("font-black text-base tabular-nums", m.numColor)}>{entry.xp}</span>
            <span className="text-xs text-muted-foreground">XP</span>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">{formatCurrency(entry.portfolioValue)}</p>
        </div>
      </div>
    </div>
  );
}

function PodiumReturnCard({ entry, currentUserId }: { entry: LeaderboardEntry; currentUserId: string | null }) {
  const m = MEDAL[entry.rank - 1]!;
  const isMe = entry.userId === currentUserId;
  const positive = entry.returnPct >= 0;
  const podiumOrder = entry.rank === 1 ? "order-2" : entry.rank === 2 ? "order-1" : "order-3";

  return (
    <div className={cn("flex flex-col items-center gap-2 flex-1 min-w-0", podiumOrder)}>
      <div className={cn("w-full rounded-2xl border p-4 flex flex-col items-center gap-2 text-center", m.bg, m.border, isMe && "ring-2 ring-primary ring-offset-2")}>
        <span className={cn("text-xs font-bold tracking-wide", m.numColor)}>{m.label}</span>
        <Avatar className={cn("ring-2 ring-offset-1", m.ring, m.size)}>
          <AvatarFallback className={cn("font-black text-2xl", m.avatarBg, m.avatarText)}>
            {entry.displayName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-sm truncate max-w-[100px]">{entry.displayName}</p>
          <p className="text-xs text-muted-foreground">{getLevelName(entry.level)}</p>
          {isMe && <Badge variant="secondary" className="text-xs mt-1">Vos</Badge>}
        </div>
        <div className="w-full border-t pt-2 mt-1 space-y-1">
          <div className={cn("flex items-center justify-center gap-1 font-black text-base tabular-nums", positive ? "text-emerald-600" : "text-red-500")}>
            {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(entry.returnPct).toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">{entry.xp} XP</p>
        </div>
      </div>
    </div>
  );
}

function XpRow({ entry, currentUserId }: { entry: LeaderboardEntry; currentUserId: string | null }) {
  const isMe = entry.userId === currentUserId;
  return (
    <div className={cn(
      "flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors",
      isMe ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-accent/30",
    )}>
      <span className="w-6 text-center text-sm font-bold text-muted-foreground tabular-nums">{entry.rank}</span>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs font-bold">{entry.displayName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{entry.displayName}</span>
          {isMe && <Badge variant="secondary" className="text-xs px-1.5 py-0">Vos</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{getLevelName(entry.level)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-sm tabular-nums">{entry.xp} XP</p>
        <p className="text-xs text-muted-foreground tabular-nums">{formatCurrency(entry.portfolioValue)}</p>
      </div>
    </div>
  );
}

function ReturnRow({ entry, currentUserId }: { entry: LeaderboardEntry; currentUserId: string | null }) {
  const isMe = entry.userId === currentUserId;
  const positive = entry.returnPct >= 0;
  return (
    <div className={cn(
      "flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors",
      isMe ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-accent/30",
    )}>
      <span className="w-6 text-center text-sm font-bold text-muted-foreground tabular-nums">{entry.rank}</span>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs font-bold">{entry.displayName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{entry.displayName}</span>
          {isMe && <Badge variant="secondary" className="text-xs px-1.5 py-0">Vos</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{getLevelName(entry.level)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn("font-bold text-sm tabular-nums flex items-center justify-end gap-0.5", positive ? "text-emerald-600" : "text-red-500")}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(entry.returnPct).toFixed(2)}%
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">{entry.xp} XP · {formatCurrency(entry.portfolioValue)}</p>
      </div>
    </div>
  );
}

export default async function RankingPage() {
  const userId = await getCurrentUserId();
  const { byXp, byReturn } = await getLeaderboard(10);

  const xpPodium = byXp.slice(0, 3);
  const xpRest = byXp.slice(3);
  const returnPodium = byReturn.slice(0, 3);
  const returnRest = byReturn.slice(3);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-500/15">
          <Trophy className="h-6 w-6 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black leading-none tracking-tight">Ranking</h1>
          <p className="text-sm text-muted-foreground mt-1">Competí con otros inversores de InvestQuest</p>
        </div>
      </div>

      <Tabs defaultValue="xp">
        <TabsList className="w-full h-11">
          <TabsTrigger value="xp" className="flex-1 gap-2 text-sm">
            <Trophy className="h-4 w-4" />
            Por XP
          </TabsTrigger>
          <TabsTrigger value="return" className="flex-1 gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Por Rendimiento
          </TabsTrigger>
        </TabsList>

        {/* XP tab */}
        <TabsContent value="xp" className="mt-6 space-y-6">
          {byXp.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Trophy className="h-14 w-14 mx-auto mb-4 opacity-15" />
              <p className="font-medium">Todavía no hay datos de ranking.</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              {xpPodium.length >= 2 && (
                <div className="flex gap-3 items-end">
                  {xpPodium.map((entry) => (
                    <PodiumCard key={entry.userId} entry={entry} currentUserId={userId} />
                  ))}
                </div>
              )}

              {/* Rest of the list */}
              {xpRest.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Más jugadores</p>
                  <div className="space-y-1.5">
                    {xpRest.map((entry) => (
                      <XpRow key={entry.userId} entry={entry} currentUserId={userId} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Return tab */}
        <TabsContent value="return" className="mt-6 space-y-6">
          {byReturn.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <TrendingUp className="h-14 w-14 mx-auto mb-4 opacity-15" />
              <p className="font-medium">Todavía no hay datos de ranking.</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              {returnPodium.length >= 2 && (
                <div className="flex gap-3 items-end">
                  {returnPodium.map((entry) => (
                    <PodiumReturnCard key={entry.userId} entry={entry} currentUserId={userId} />
                  ))}
                </div>
              )}

              {/* Rest */}
              {returnRest.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Más jugadores</p>
                  <div className="space-y-1.5">
                    {returnRest.map((entry) => (
                      <ReturnRow key={entry.userId} entry={entry} currentUserId={userId} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
