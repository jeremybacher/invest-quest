export type AIProvider = "openai" | "anthropic" | "google";

export const PROVIDER_MODELS: Record<AIProvider, { default: string; premium: string; all: string[] }> = {
  openai: {
    default: "gpt-4o-mini",
    premium: "gpt-4o",
    all: ["gpt-4o-mini", "gpt-4o"],
  },
  anthropic: {
    default: "claude-haiku-4-5",
    premium: "claude-sonnet-4-6",
    all: ["claude-haiku-4-5", "claude-sonnet-4-6"],
  },
  google: {
    default: "gemini-2.5-flash",
    premium: "gemini-2.5-pro",
    all: ["gemini-2.5-flash", "gemini-2.5-pro"],
  },
};
