"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Send, Trash2, Sparkles, TrendingUp, BookOpen, BarChart2, Lightbulb, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearChatHistory } from "./actions";

type Message = { id: string; role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  { label: "¿Qué es un ETF?", icon: BookOpen },
  { label: "¿Cómo diversifico?", icon: BarChart2 },
  { label: "Analizá mi cartera", icon: TrendingUp },
  { label: "Dame un tip de inversión", icon: Lightbulb },
];

function CoachAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-14 h-14 text-xl" };
  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shrink-0",
      sizes[size],
    )}>
      <Bot className={size === "lg" ? "h-7 w-7" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
    </div>
  );
}

export function CoachClient({
  userId,
  initialMessages,
  hasProvider,
}: {
  userId: string;
  initialMessages: Message[];
  hasProvider: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: text }),
      });
      const data = await res.json();

      if (data.ok) {
        const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: data.data };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        toast.error("El coach no pudo responder. Revisá tu configuración de IA.");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    const result = await clearChatHistory(userId);
    if (result.ok) {
      setMessages([]);
      toast("Historial limpiado");
    }
  }

  /* ─── No provider: onboarding screen ─── */
  if (!hasProvider) {
    return (
      <div className="max-w-lg mx-auto pt-8 pb-16 flex flex-col items-center text-center gap-8">
        {/* Hero illustration */}
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
            <Bot className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Tu Coach IA te espera</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            Configurá tu proveedor de IA y desbloqueá un coach personalizado que te ayuda a aprender a invertir.
          </p>
        </div>

        {/* Feature list */}
        <div className="w-full space-y-2">
          {[
            { icon: TrendingUp, label: "Analizá tu cartera en tiempo real", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
            { icon: BookOpen,  label: "Aprendé conceptos de inversión con ejemplos", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { icon: Lightbulb, label: "Recibí tips adaptados a tu nivel y perfil", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
          ].map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border p-3 text-left">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="gap-2 w-full max-w-xs">
          <Link href="/settings">
            Configurar IA ahora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground">
          Compatible con OpenAI, Anthropic y Google. Usás tu propia API key.
        </p>
      </div>
    );
  }

  /* ─── Chat interface ─── */
  const showQuickPrompts = messages.length === 0 || (messages.length > 0 && messages.length < 3);

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100dvh - 7rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <CoachAvatar size="md" />
          <div>
            <h1 className="text-base font-bold leading-tight">Coach IA</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">En línea</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
          <Trash2 className="h-4 w-4 mr-1.5" />
          Limpiar
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center py-10 gap-3">
            <CoachAvatar size="lg" />
            <div>
              <p className="font-semibold">¡Hola! Soy tu coach de inversiones</p>
              <p className="text-sm text-muted-foreground mt-0.5">Preguntame lo que quieras sobre el mundo de las inversiones.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && <CoachAvatar size="sm" />}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm",
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0">
                Vos
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <CoachAvatar size="sm" />
            <div className="bg-muted rounded-2xl rounded-tl-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Quick prompts */}
        {showQuickPrompts && (
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_PROMPTS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => { sendMessage(label); inputRef.current?.focus(); }}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors disabled:opacity-50"
              >
                <Icon className="h-3 w-3 text-muted-foreground" />
                {label}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-3 border-t mt-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu pregunta…"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              disabled={loading}
              className="w-full rounded-2xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50 pr-12"
            />
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
          Solo para fines educativos · No es asesoramiento financiero real
        </p>
      </div>
    </div>
  );
}
