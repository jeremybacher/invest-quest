import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return <div className="text-muted-foreground text-center py-12">Cargando…</div>;
  }

  const [user, setting] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { riskProfile: true } }),
    db.appSetting.findUnique({ where: { userId }, select: { provider: true, model: true } }),
  ]);

  return (
    <SettingsClient
      key={userId}
      userId={userId}
      currentProvider={setting?.provider ?? null}
      currentModel={setting?.model ?? null}
      riskProfile={user?.riskProfile ?? null}
    />
  );
}
