// DEMO ONLY — no real authentication. userId is stored in a cookie set by client JS.
// Never use this pattern in production.

import { cookies } from "next/headers";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("iq-user-id")?.value ?? null;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No authenticated user");
  return userId;
}
