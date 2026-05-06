import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { CoachClient } from "./CoachClient";
export default async function CoachPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Cargando…</p>
      </div>
    );
  }

  const [messages, hasProvider] = await Promise.all([
    db.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: { id: true, role: true, content: true, createdAt: true },
    }),
    db.appSetting.findUnique({ where: { userId }, select: { id: true } }).then(Boolean),
  ]);

  return (
    <CoachClient
      key={userId}
      userId={userId}
      initialMessages={messages.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content }))}
      hasProvider={hasProvider}
    />
  );
}
