"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserStore } from "@/stores/currentUser";

export function UserProvider({ defaultUserId }: { defaultUserId: string }) {
  const { userId, setUserId } = useCurrentUserStore();
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (useCurrentUserStore.persist.hasHydrated()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
    } else {
      const unsub = useCurrentUserStore.persist.onFinishHydration(() => setHydrated(true));
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (hydrated && !userId && defaultUserId) {
      setUserId(defaultUserId);
      // Cookie is now set — refresh so server components re-render with the correct userId
      router.refresh();
    }
  }, [hydrated, userId, setUserId, defaultUserId, router]);

  return null;
}
