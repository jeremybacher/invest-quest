"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard-error]", error.message);
  }, [error]);

  return (
    <div className="max-w-md mx-auto mt-12 space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Ocurrió un error</AlertTitle>
        <AlertDescription>{error.message ?? "Error inesperado. Intentá de nuevo."}</AlertDescription>
      </Alert>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline">
          Reintentar
        </Button>
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
