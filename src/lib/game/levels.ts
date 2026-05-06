const XP_THRESHOLDS = [0, 100, 300, 700, 1500] as const;
const LEVEL_NAMES = [
  "Rookie Investor",
  "Smart Saver",
  "Market Explorer",
  "Wealth Builder",
  "Master Investor",
] as const;

export function getLevelFromXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
}

export function getXpForNextLevel(level: number): number | null {
  return XP_THRESHOLDS[level] ?? null;
}

export { XP_THRESHOLDS, LEVEL_NAMES };
