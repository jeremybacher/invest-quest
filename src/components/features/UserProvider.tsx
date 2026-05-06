"use client";

import { useEffect, useState } from "react";
import { useCurrentUserStore } from "@/stores/currentUser";

export function UserProvider({ defaultUserId }: { defaultUserId: string }) {
  const { userId, setUserId } = useCurrentUserStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Mark hydrated immediately if persist already finished (sync localStorage)
    if (useCurrentUserStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useCurrentUserStore.persist.onFinishHydration(() => setHydrated(true));
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (hydrated && !userId && defaultUserId) {
      setUserId(defaultUserId);
    }
  }, [hydrated, userId, setUserId, defaultUserId]);

  return null;
}
