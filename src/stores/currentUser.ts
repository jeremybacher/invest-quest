"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CurrentUserStore = {
  userId: string;
  setUserId: (id: string) => void;
};

function syncCookie(userId: string) {
  if (typeof document !== "undefined") {
    document.cookie = `iq-user-id=${userId}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

export const useCurrentUserStore = create<CurrentUserStore>()(
  persist(
    (set) => ({
      userId: "",
      setUserId: (id) => {
        syncCookie(id);
        set({ userId: id });
      },
    }),
    { name: "iq-current-user" }
  )
);
