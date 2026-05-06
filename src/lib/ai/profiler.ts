import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { getLanguageModel } from "@/lib/ai/providers";

const ProfilerOutputSchema = z.object({
  profile: z.enum(["conservador", "moderado", "agresivo"]),
  reasoning: z.string(),
});
type ProfilerOutput = z.infer<typeof ProfilerOutputSchema>;

const NO_PROVIDER = { ok: false as const, error: "no_provider_configured" as const };

export async function classifyRiskProfile(
  userId: string,
  answers: string[]
): Promise<{ ok: true; data: ProfilerOutput } | { ok: false; error: string }> {
  const model = await getLanguageModel(userId);
  if (!model) return NO_PROVIDER;

  try {
    const { object } = await generateObject({
      model,
      schema: ProfilerOutputSchema,
      system:
        "Sos un asesor financiero educativo. Clasificá el perfil de riesgo del inversor basándote en sus respuestas. Respondé en español rioplatense.",
      prompt: `El usuario respondió las siguientes preguntas sobre su perfil de inversor:\n${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nClasificá su perfil de riesgo.`,
      abortSignal: AbortSignal.timeout(30000),
    });

    await db.user.update({ where: { id: userId }, data: { riskProfile: object.profile } });
    return { ok: true, data: object };
  } catch (err) {
    console.error("[profiler] generateObject failed:", err instanceof Error ? err.message : String(err));
    return { ok: false, error: "ai_error" };
  }
}
