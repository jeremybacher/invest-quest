# AI Module Rules

Applies to code under `src/lib/ai/` and anything calling AI.

## Provider abstraction

- **Never import `@ai-sdk/openai`, `@ai-sdk/anthropic`, or `@ai-sdk/google` from features.** Only `src/lib/ai/providers.ts` may import them.
- Features import `getLanguageModel(userId)` from `src/lib/ai/providers.ts` and call `generateText` / `generateObject` from `ai`.
- If the user has no `AppSetting` or an invalid key, `getLanguageModel` returns `null`. Callers must handle `null` gracefully (return a friendly empty-state message in Spanish).

## Prompting

- System prompts are **in Spanish** (that's the user-facing language) but kept short and imperative.
- Always include a line like: "Respondé en español rioplatense, con tono cercano. Evitá consejos financieros reales — esto es educativo."
- Include user context programmatically (level, portfolio snapshot, recent missions) — never let the model infer it.

## Structured output

- For anything non-chat (profiler, feedback, challenges), use `generateObject` with a Zod schema.
- Schema lives next to the call site, named `<Use>OutputSchema`.
- Never `JSON.parse` model output manually.

## Error handling

- Wrap every AI call in try/catch.
- On error, log the provider name and error message (**never** the API key) and return a friendly Spanish fallback message.
- Timeout: 30s. If it exceeds, abort and return the fallback.

## API key handling

- API keys live in `AppSetting.apiKeyEncrypted`, encrypted with AES-GCM via `src/lib/ai/crypto.ts`.
- Decryption happens only inside `src/lib/ai/providers.ts`, never crosses that boundary.
- Never log, return, or include an API key (encrypted or plain) in any response, error, or telemetry.

## Model selection

Default models per provider (update here if new ones become standard):
- OpenAI: `gpt-4o-mini` (cheap default), `gpt-4o` (premium)
- Anthropic: `claude-haiku-4-5` (cheap default), `claude-sonnet-4-6` (premium)
- Google: `gemini-2.5-flash` (cheap default), `gemini-2.5-pro` (premium)

Let the user pick from a dropdown in Settings. Persist choice in `AppSetting.model`.
