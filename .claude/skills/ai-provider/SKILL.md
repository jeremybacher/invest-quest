---
name: ai-provider
description: Use this skill when the user asks to add a new AI-backed feature (a new coach prompt type, a new profiler question set, a new feedback generator, a new AI-powered mission), or to integrate a new AI provider. Also use when debugging why an AI feature isn't working. Do NOT use for non-AI code.
---

# Skill: Add or Extend an AI Feature

All AI in InvestQuest flows through the Vercel AI SDK via `src/lib/ai/providers.ts`.

## Step 1 — Read the rules

Open `.claude/rules/ai.md`. These rules are non-negotiable. In particular:
- Only `src/lib/ai/providers.ts` imports `@ai-sdk/*` SDKs.
- Features call `getLanguageModel(userId)` and handle `null` gracefully.
- System prompts in Spanish, short and imperative.
- Structured output via `generateObject` + Zod, never manual `JSON.parse`.

## Step 2 — Decide: chat or structured?

- **Chat / free-form response** → use `generateText` from `ai`. Store messages in `ChatMessage` table.
- **Structured data** (profile classification, mission params, feedback summary) → use `generateObject` with a Zod output schema.

## Step 3 — Build the use case

Create a file in `src/lib/ai/<useCase>.ts`:

```ts
import { generateObject } from "ai";
import { z } from "zod";
import { getLanguageModel } from "./providers";

const OutputSchema = z.object({
  profile: z.enum(["conservative", "moderate", "aggressive"]),
  reasoning: z.string().max(500),
});

export async function classifyRiskProfile(userId: string, answers: string[]) {
  const model = await getLanguageModel(userId);
  if (!model) {
    return { ok: false as const, error: "no_provider_configured" };
  }

  try {
    const { object } = await generateObject({
      model,
      schema: OutputSchema,
      system:
        "Sos un asesor financiero educativo. Respondé en español rioplatense. " +
        "Clasificá al usuario según sus respuestas en conservador, moderado o agresivo. " +
        "Esto es solo educativo, no asesoramiento financiero real.",
      prompt: `Respuestas del usuario:\n${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}`,
      abortSignal: AbortSignal.timeout(30_000),
    });
    return { ok: true as const, data: object };
  } catch (err) {
    console.error("[ai/classifyRiskProfile]", err instanceof Error ? err.message : err);
    return { ok: false as const, error: "generation_failed" };
  }
}
```

## Step 4 — Expose via server action or API route

- Server action by default, in the feature's `actions.ts`.
- API route (under `src/app/api/ai/<useCase>/route.ts`) only if needed for polling or client-streaming (we don't stream in MVP, so usually a server action is fine).

## Step 5 — Handle `null` / error in the UI

The client **must** render a graceful empty state when the result is `{ ok: false, error: "no_provider_configured" }`:

> "Configurá tu proveedor de IA en Ajustes para usar esta función."

With a link to `/settings`.

## Step 6 — Update CONTEXT.md

Add the new AI use case to "Last Completed". If it's a new pattern (e.g., first time using `generateObject`), add a decision note.

## Adding a new provider (e.g., Mistral, Cohere)

1. Install SDK: `npm i @ai-sdk/<provider>`.
2. Extend the `AIProvider` union type in `src/lib/ai/types.ts`.
3. Add the factory case in `providers.ts`.
4. Add the default model list in the same file.
5. Update the Settings UI radio group to include the new provider.
6. Test end-to-end with a real key before committing.

## Gotchas

- API keys must never appear in logs. When logging errors, log `err.message` only — don't spread `err` or stringify the whole options object (which includes the key).
- The 30s timeout is a hard ceiling. If a model consistently needs more, switch to a smaller/faster default model rather than raising the timeout.
- `generateObject` with some providers requires specific model families. If the chosen model doesn't support structured output, fall back to `generateText` + manual Zod parse with a clear error path.
