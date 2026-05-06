import { Zap } from "lucide-react";
import { db } from "@/lib/db";
import { UserSwitcher } from "@/components/features/UserSwitcher";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { UserProvider } from "@/components/features/UserProvider";
import { SidebarNav, MobileNav } from "@/components/features/NavLink";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const users = await db.user.findMany({
    select: { id: true, username: true, displayName: true, level: true },
    orderBy: { username: "asc" },
  });

  const defaultUser = users[0];

  return (
    <div className="flex min-h-screen">
      <UserProvider defaultUserId={defaultUser?.id ?? ""} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-gradient-to-b from-indigo-900 to-indigo-950">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-white/10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15">
            <Zap className="h-4 w-4 text-yellow-300" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">InvestQuest</span>
        </div>

        <SidebarNav />

        {/* Footer label */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-indigo-300/60">Modo demo · sin dinero real</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-600">
              <Zap className="h-3.5 w-3.5 text-yellow-300" />
            </div>
            <span className="font-bold text-base">InvestQuest</span>
          </div>
          <div className="flex-1" />
          <UserSwitcher users={users} />
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 pb-20 lg:pb-6 lg:px-6">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
