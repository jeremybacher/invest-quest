import { generateText } from "ai";
import { db } from "@/lib/db";
import { getLanguageModel } from "@/lib/ai/providers";
import { computePortfolioValue } from "@/lib/market/engine";

const NO_PROVIDER = { ok: false as const, error: "no_provider_configured" as const };

export async function generateCoachReply(
  userId: string,
  userMessage: string
): Promise<{ ok: true; data: string } | { ok: false; error: string }> {
  const model = await getLanguageModel(userId);
  if (!model) return NO_PROVIDER;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { displayName: true, level: true, xp: true, riskProfile: true },
  });
  if (!user) return { ok: false, error: "user_not_found" };

  const portfolio = await computePortfolioValue(userId);

  const recentMissions = await db.userMission.findMany({
    where: { userId },
    include: { mission: { select: { title: true, difficulty: true } } },
    orderBy: { id: "desc" },
    take: 3,
  });

  await db.chatMessage.create({ data: { userId, role: "user", content: userMessage } });

  const systemPrompt = `Sos un coach de inversiones educativo para una aplicación de aprendizaje sobre finanzas.
Usuario: ${user.displayName}, nivel ${user.level}, ${user.xp} XP.
Portfolio: total ARS ${portfolio.totalValue.toFixed(2)}, efectivo ARS ${portfolio.cash.toFixed(2)}, rendimiento ${portfolio.pnlPct.toFixed(2)}%.
Perfil de riesgo: ${user.riskProfile ?? "no definido"}.
Misiones recientes: ${recentMissions.map((m) => m.mission.title).join(", ") || "ninguna"}.
Respondé en español rioplatense, con tono cercano. Evitá consejos financieros reales — esto es educativo. Sé conciso (máx 3 párrafos).`;

  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userMessage,
      abortSignal: AbortSignal.timeout(30000),
    });

    await db.chatMessage.create({ data: { userId, role: "assistant", content: text } });
    return { ok: true, data: text };
  } catch (err) {
    console.error("[coach] generateText failed:", err instanceof Error ? err.message : String(err));
    return { ok: false, error: "ai_error" };
  }
}
