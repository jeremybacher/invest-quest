import { generateText } from "ai";
import { db } from "@/lib/db";
import { getLanguageModel } from "@/lib/ai/providers";

const NO_PROVIDER = { ok: false as const, error: "no_provider_configured" as const };

export async function generateMissionFeedback(
  userId: string,
  missionId: string,
  result: "completed" | "failed"
): Promise<{ ok: true; data: string } | { ok: false; error: string }> {
  const model = await getLanguageModel(userId);
  if (!model) return NO_PROVIDER;

  const mission = await db.mission.findUnique({ where: { id: missionId } });
  if (!mission) return { ok: false, error: "mission_not_found" };

  const user = await db.user.findUnique({ where: { id: userId }, select: { displayName: true, level: true } });

  try {
    const { text } = await generateText({
      model,
      system:
        "Sos un coach educativo de inversiones. Escribí un párrafo corto de feedback en español rioplatense, motivador y educativo.",
      prompt: `${user?.displayName ?? "El usuario"} (nivel ${user?.level ?? 1}) ${result === "completed" ? "completó" : "no pudo completar"} la misión "${mission.title}" (${mission.difficulty}). Descripción: ${mission.description}. Escribí un feedback breve.`,
      abortSignal: AbortSignal.timeout(30000),
    });

    return { ok: true, data: text };
  } catch (err) {
    console.error("[feedback] generateText failed:", err instanceof Error ? err.message : String(err));
    return { ok: false, error: "ai_error" };
  }
}
