import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { getLanguageModel } from "@/lib/ai/providers";
import { computePortfolioValue } from "@/lib/market/engine";

const MissionOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["rookie", "smart_saver", "explorer", "builder", "master"]),
  xpReward: z.number().int().min(10).max(500),
  goalType: z.string(),
  goalParams: z.record(z.string(), z.unknown()),
});

const NO_PROVIDER = { ok: false as const, error: "no_provider_configured" as const };

export async function generatePersonalizedMission(
  userId: string
): Promise<{ ok: true; data: z.infer<typeof MissionOutputSchema> } | { ok: false; error: string }> {
  const model = await getLanguageModel(userId);
  if (!model) return NO_PROVIDER;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { displayName: true, level: true, xp: true, riskProfile: true },
  });
  if (!user) return { ok: false, error: "user_not_found" };

  const portfolio = await computePortfolioValue(userId);

  try {
    const { object } = await generateObject({
      model,
      schema: MissionOutputSchema,
      system:
        "Sos un diseñador de misiones educativas de inversión. Creá misiones personalizadas según el perfil del usuario. Todo en español rioplatense.",
      prompt: `Usuario nivel ${user.level}, XP ${user.xp}, perfil ${user.riskProfile ?? "sin definir"}, portfolio ARS ${portfolio.totalValue.toFixed(0)}. Creá una misión educativa personalizada adecuada a su nivel.`,
      abortSignal: AbortSignal.timeout(30000),
    });

    return { ok: true, data: object };
  } catch (err) {
    console.error("[challenges] generateObject failed:", err instanceof Error ? err.message : String(err));
    return { ok: false, error: "ai_error" };
  }
}
