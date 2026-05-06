"use client";

import { useCurrentUserStore } from "@/stores/currentUser";

export function useCurrentUser() {
  const { userId, setUserId } = useCurrentUserStore();
  return { userId, setUserId };
}
