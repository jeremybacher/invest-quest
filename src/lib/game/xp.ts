import { db } from "@/lib/db";
import { getLevelFromXp } from "@/lib/game/levels";

export async function awardXp(
  userId: string,
  amount: number,
  reason: string
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  void reason; // reserved for future logging
  const user = await db.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } });
  if (!user) throw new Error("User not found");

  const newXp = user.xp + amount;
  const newLevel = getLevelFromXp(newXp);
  const leveledUp = newLevel > user.level;

  await db.user.update({ where: { id: userId }, data: { xp: newXp, level: newLevel } });

  return { newXp, newLevel, leveledUp };
}
