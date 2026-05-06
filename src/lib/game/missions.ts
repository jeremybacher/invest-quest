import { db } from "@/lib/db";
import { awardXp } from "@/lib/game/xp";

type MissionContext = {
  tradeCount?: number;
  assetTypeCount?: number;
  holdingDays?: number;
  portfolioPnlPct?: number;
  riskProfileSet?: boolean;
  lessonSlug?: string;
  cashSavedPct?: number;
};

export async function checkMissionProgress(
  userId: string,
  missionCode: string,
  context: MissionContext
): Promise<void> {
  const mission = await db.mission.findUnique({ where: { code: missionCode } });
  if (!mission) return;

  const userMission = await db.userMission.findUnique({
    where: { userId_missionId: { userId, missionId: mission.id } },
  });
  if (userMission?.status === "completed") return;

  let completed = false;

  switch (mission.goalType) {
    case "first_trade":
      completed = (context.tradeCount ?? 0) >= 1;
      break;
    case "read_first_lesson":
      completed = !!context.lessonSlug;
      break;
    case "save_10pct":
      completed = (context.cashSavedPct ?? 0) >= 10;
      break;
    case "hold_3_days":
      completed = (context.holdingDays ?? 0) >= 3;
      break;
    case "diversify":
      completed = (context.assetTypeCount ?? 0) >= 3;
      break;
    case "complete_risk_profile":
      completed = !!context.riskProfileSet;
      break;
    case "portfolio_return":
      completed = (context.portfolioPnlPct ?? 0) >= 5;
      break;
    case "hold_etf_week":
      completed = (context.holdingDays ?? 0) >= 7;
      break;
    case "rebalance_after_drop":
      completed = (context.portfolioPnlPct ?? 0) <= -5 && (context.assetTypeCount ?? 0) >= 2;
      break;
    case "portfolio_10pct_return":
      completed = (context.portfolioPnlPct ?? 0) >= 10;
      break;
    default:
      break;
  }

  if (completed) {
    await completeMission(userId, mission.id);
  } else {
    await db.userMission.upsert({
      where: { userId_missionId: { userId, missionId: mission.id } },
      create: { userId, missionId: mission.id, status: "active", progress: JSON.stringify(context) },
      update: { progress: JSON.stringify(context) },
    });
  }
}

export async function completeMission(userId: string, missionId: string): Promise<void> {
  const mission = await db.mission.findUnique({ where: { id: missionId } });
  if (!mission) return;

  await db.userMission.upsert({
    where: { userId_missionId: { userId, missionId } },
    create: { userId, missionId, status: "completed", completedAt: new Date() },
    update: { status: "completed", completedAt: new Date() },
  });

  await awardXp(userId, mission.xpReward, `mission:${mission.code}`);
}
