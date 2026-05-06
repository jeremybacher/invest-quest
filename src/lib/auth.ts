// DEMO ONLY — no real authentication. userId is stored in a cookie set by client JS.
// Never use this pattern in production.

import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("iq-user-id")?.value;
  if (!userId) return null;

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  return user?.id ?? null;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No authenticated user");
  return userId;
}
