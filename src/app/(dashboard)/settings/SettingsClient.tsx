"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PROVIDER_MODELS } from "@/lib/ai/types";
import { saveProvider, resetUserProgress } from "./actions";

const RISK_QUESTIONS = [
  "¿Cuánto tiempo tenés para invertir? (menos de 1 año / 1-5 años / más de 5 años)",
  "¿Qué harías si tu cartera cae un 20%? (vendo todo / espero / compro más)",
  "¿Cuál es tu principal objetivo? (preservar capital / crecer moderado / máximo rendimiento)",
  "¿Tenés experiencia invirtiendo? (ninguna / algo / bastante)",
  "¿Cuánto de tus ahorros estarías dispuesto a arriesgar? (menos del 10% / 10-30% / más del 30%)",
];

type Provider = "openai" | "anthropic" | "google";

const PROVIDER_NAMES: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
};

type Props = {
  userId: string;
  currentProvider: string | null;
  currentModel: string | null;
  riskProfile: string | null;
};

export function SettingsClient({ userId, currentProvider, currentModel, riskProfile }: Props) {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider>((currentProvider as Provider) ?? "openai");
  const [model, setModel] = useState(currentModel ?? PROVIDER_MODELS.openai.default);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savingProvider, setSavingProvider] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showRiskTest, setShowRiskTest] = useState(false);
  const [riskAnswers, setRiskAnswers] = useState<string[]>(Array(5).fill(""));
  const [classifying, setClassifying] = useState(false);
  const [profile, setProfile] = useState(riskProfile);

  function handleProviderChange(p: Provider) {
    setProvider(p);
    setModel(PROVIDER_MODELS[p].default);
  }

  async function handleSaveProvider() {
    if (!apiKey.trim()) {
      toast.error("Ingresá tu API key");
      return;
    }
    setSavingProvider(true);
    const result = await saveProvider({ userId, provider, model, apiKey });
    setSavingProvider(false);

    if (!result.ok) {
      toast.error("Error al guardar la configuración");
      return;
    }
    toast.success("Configuración guardada correctamente");
    router.refresh();
  }

  async function handleTestConnection() {
    if (!apiKey.trim() && !currentProvider) {
      toast.error("Guardá tu proveedor antes de probar");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: "test" }),
      });
      const data = await res.json();
      if (data.ok) toast.success("¡Conexión exitosa!");
      else toast.error("Conexión fallida. Revisá tu API key.");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setTesting(false);
    }
  }

  async function handleClassifyProfile() {
    if (riskAnswers.some((a) => !a.trim())) {
      toast.error("Respondé todas las preguntas");
      return;
    }
    setClassifying(true);
    try {
      const res = await fetch("/api/ai/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answers: riskAnswers }),
      });
      const data = await res.json();
      if (data.ok) {
        setProfile(data.data.profile);
        setShowRiskTest(false);
        toast.success(`Perfil clasificado: ${data.data.profile}`);
        router.refresh();
      } else {
        toast.error(data.error === "no_provider_configured" ? "Configurá tu proveedor de IA primero" : "Error al clasificar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setClassifying(false);
    }
  }

  async function handleReset() {
    const result = await resetUserProgress(userId);
    if (result.ok) {
      toast.success("Progreso reiniciado");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      {/* AI Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedor de IA</CardTitle>
          <CardDescription>
            Configurá tu proveedor de IA para usar el Coach y otras funciones. La API key se guarda encriptada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <RadioGroup value={provider} onValueChange={(v) => handleProviderChange(v as Provider)} className="flex flex-wrap gap-4">
              {(Object.keys(PROVIDER_NAMES) as Provider[]).map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <RadioGroupItem value={p} id={p} />
                  <Label htmlFor={p}>{PROVIDER_NAMES[p]}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Modelo</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_MODELS[provider].all.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder={currentProvider ? "••••••••••••••••" : "sk-..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)} aria-label={showKey ? "Ocultar key" : "Mostrar key"}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveProvider} disabled={savingProvider}>
              {savingProvider ? "Guardando…" : "Guardar"}
            </Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
              {testing ? "Probando…" : "Probar conexión"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Risk Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Riesgo</CardTitle>
          <CardDescription>
            {profile
              ? `Tu perfil actual: ${profile.charAt(0).toUpperCase() + profile.slice(1)}`
              : "No definido todavía."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showRiskTest ? (
            <Button variant="outline" onClick={() => setShowRiskTest(true)}>
              {profile ? "Volver a hacer el test" : "Hacer el test"}
            </Button>
          ) : (
            <div className="space-y-4">
              {RISK_QUESTIONS.map((q, i) => (
                <div key={i} className="space-y-1">
                  <Label className="text-sm">{q}</Label>
                  <Input
                    placeholder="Tu respuesta…"
                    value={riskAnswers[i]}
                    onChange={(e) => {
                      const next = [...riskAnswers];
                      next[i] = e.target.value;
                      setRiskAnswers(next);
                    }}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button onClick={handleClassifyProfile} disabled={classifying}>
                  {classifying ? "Analizando…" : "Clasificar perfil"}
                </Button>
                <Button variant="ghost" onClick={() => setShowRiskTest(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Zona peligrosa
          </CardTitle>
          <CardDescription>Esta acción es irreversible.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reiniciar mi progreso</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro/a?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción borrará todo tu XP, holdings, transacciones, misiones y chat. Tu balance volverá a $10.000. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sí, reiniciar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
