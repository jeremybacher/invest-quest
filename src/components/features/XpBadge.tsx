"use client";

import { Progress } from "@/components/ui/progress";
import { getLevelName, XP_THRESHOLDS } from "@/lib/game/levels";

type Props = { level: number; xp: number };

export function XpBadge({ level, xp }: Props) {
  const nextThreshold = XP_THRESHOLDS[level] ?? null;
  const prevThreshold = XP_THRESHOLDS[level - 1] ?? 0;
  const pct =
    nextThreshold !== null
      ? ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100
      : 100;

  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{getLevelName(level)}</span>
        <span className="text-muted-foreground">{xp} XP</span>
      </div>
      <Progress value={Math.min(pct, 100)} className="h-1.5" />
    </div>
  );
}
