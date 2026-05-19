"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, BookOpen, MessageCircle, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/simulator", label: "Simulador", icon: TrendingUp },
  { href: "/learn", label: "Aprender", icon: BookOpen },
  { href: "/coach", label: "Coach", icon: MessageCircle },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

function useIsActive(href: string) {
  const pathname = usePathname();
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function SidebarLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const isActive = useIsActive(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-white/15 text-white"
          : "text-indigo-200/70 hover:text-white hover:bg-white/10",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      {isActive && <span className="ml-auto w-1 h-4 rounded-full bg-white/80" />}
    </Link>
  );
}

function MobileLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const isActive = useIsActive(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

export function SidebarNav() {
  return (
    <nav className="flex-1 px-3 py-5 space-y-0.5">
      {NAV_ITEMS.map(({ href, label, icon }) => (
        <SidebarLink key={href} href={href} label={label} icon={icon} />
      ))}
    </nav>
  );
}

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom,0px)]">
      {NAV_ITEMS.map(({ href, label, icon }) => (
        <MobileLink key={href} href={href} label={label} icon={icon} />
      ))}
    </nav>
  );
}
