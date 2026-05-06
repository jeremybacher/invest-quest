"use server";

import { db } from "@/lib/db";
import { awardXp } from "@/lib/game/xp";

export async function completLesson(
  userId: string,
  slug: string,
  xpReward: number
): Promise<{ ok: true; alreadyDone: boolean; xpGained: number } | { ok: false; error: string }> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return { ok: false, error: "user_not_found" };

  const code = `read_lesson:${slug}`;

  // Find or create the lesson mission
  let mission = await db.mission.findUnique({ where: { code } });
  if (!mission) {
    mission = await db.mission.create({
      data: {
        code,
        title: `Lección: ${slug}`,
        description: "Completar esta lección",
        difficulty: "rookie",
        xpReward,
        goalType: "read_lesson",
        goalParams: JSON.stringify({ slug }),
      },
    });
  }

  // Idempotent — only award once
  const existing = await db.userMission.findUnique({
    where: { userId_missionId: { userId, missionId: mission.id } },
  });

  if (existing?.status === "completed") {
    return { ok: true, alreadyDone: true, xpGained: 0 };
  }

  await db.userMission.upsert({
    where: { userId_missionId: { userId, missionId: mission.id } },
    create: { userId, missionId: mission.id, status: "completed", completedAt: new Date() },
    update: { status: "completed", completedAt: new Date() },
  });

  await awardXp(userId, xpReward, `lesson:${slug}`);

  return { ok: true, alreadyDone: false, xpGained: xpReward };
}
