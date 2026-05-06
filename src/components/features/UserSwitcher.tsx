"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

type DemoUser = { id: string; username: string; displayName: string; level: number };

export function UserSwitcher({ users }: { users: DemoUser[] }) {
  const { userId, setUserId } = useCurrentUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = users.find((u) => u.id === userId) ?? users[0];

  function switchUser(id: string) {
    if (id === userId) return;
    setUserId(id);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-colors">
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">{current?.displayName[0] ?? "?"}</AvatarFallback>
          </Avatar>
        )}
        <span className={cn("text-sm font-medium hidden sm:block", isPending && "text-muted-foreground")}>
          {isPending ? "Cambiando…" : current?.displayName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Modo demo · cambiar usuario</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((u) => (
          <DropdownMenuItem
            key={u.id}
            onClick={() => switchUser(u.id)}
            className={cn("flex items-center gap-2.5 cursor-pointer", u.id === userId && "bg-accent")}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-xs">{u.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none">{u.displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Nivel {u.level}</p>
            </div>
            {u.id === userId && (
              <span className="text-xs text-primary font-medium shrink-0">Activo</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
