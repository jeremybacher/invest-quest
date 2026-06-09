"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserStore, syncCookie } from "@/stores/currentUser";

export function UserProvider({
  defaultUserId,
  validUserIds,
}: {
  defaultUserId: string;
  validUserIds: string[];
}) {
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
    if (!hydrated || !defaultUserId) return;

    // Use the persisted user only if it still exists in the DB; otherwise fall back to
    // the default. This self-heals after a DB reseed where ids change (stale localStorage).
    const activeId = userId && validUserIds.includes(userId) ? userId : defaultUserId;

    // Always make sure the cookie matches the active user. The cookie can be missing even
    // when the store has a userId (cleared cookies, expiry, first render after a reseed),
    // which would otherwise leave server components stuck on the "no user" branch.
    const hasMatchingCookie = document.cookie
      .split("; ")
      .includes(`iq-user-id=${activeId}`);

    if (userId !== activeId) {
      setUserId(activeId); // persists state + syncs cookie
    } else if (!hasMatchingCookie) {
      syncCookie(activeId);
    }

    if (!hasMatchingCookie) {
      // Cookie is now set — refresh so server components re-render with the correct userId
      router.refresh();
    }
  }, [hydrated, userId, setUserId, defaultUserId, validUserIds, router]);

  return null;
}
