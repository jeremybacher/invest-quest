"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/ai/crypto";
const SaveProviderSchema = z.object({
  userId: z.string().min(1),
  provider: z.enum(["openai", "anthropic", "google"]),
  model: z.string().min(1),
  apiKey: z.string().min(1),
});

export async function saveProvider(
  input: z.infer<typeof SaveProviderSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = SaveProviderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const { userId, provider, model, apiKey } = parsed.data;

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return { ok: false, error: "user_not_found" };

  let apiKeyEncrypted: string;
  try {
    apiKeyEncrypted = await encrypt(apiKey);
  } catch {
    return { ok: false, error: "encryption_failed" };
  }

  await db.appSetting.upsert({
    where: { userId },
    create: { userId, provider, model, apiKeyEncrypted },
    update: { provider, model, apiKeyEncrypted },
  });

  return { ok: true };
}

export async function resetUserProgress(userId: string): Promise<{ ok: boolean }> {
  await db.$transaction([
    db.holding.deleteMany({ where: { userId } }),
    db.transaction.deleteMany({ where: { userId } }),
    db.userMission.deleteMany({ where: { userId } }),
    db.userBadge.deleteMany({ where: { userId } }),
    db.chatMessage.deleteMany({ where: { userId } }),
    db.user.update({
      where: { id: userId },
      data: { xp: 0, level: 1, cashBalance: 10000, riskProfile: null },
    }),
  ]);
  return { ok: true };
}
