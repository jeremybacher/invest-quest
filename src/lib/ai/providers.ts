import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/ai/crypto";
import type { AIProvider } from "@/lib/ai/types";

export async function getLanguageModel(userId: string): Promise<LanguageModel | null> {
  const setting = await db.appSetting.findUnique({ where: { userId } });
  if (!setting) return null;

  let apiKey: string;
  try {
    apiKey = await decrypt(setting.apiKeyEncrypted);
  } catch {
    return null;
  }

  const provider = setting.provider as AIProvider;
  const model = setting.model;

  try {
    switch (provider) {
      case "openai":
        return createOpenAI({ apiKey })(model);
      case "anthropic":
        return createAnthropic({ apiKey })(model);
      case "google":
        return createGoogleGenerativeAI({ apiKey })(model);
      default:
        return null;
    }
  } catch {
    return null;
  }
}
