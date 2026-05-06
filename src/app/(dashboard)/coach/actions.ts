"use server";

import { db } from "@/lib/db";

export async function clearChatHistory(userId: string): Promise<{ ok: boolean }> {
  await db.chatMessage.deleteMany({ where: { userId } });
  return { ok: true };
}
