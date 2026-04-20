"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PatientAppointmentActions({
  appointmentId,
  canModify
}: {
  appointmentId: string;
  canModify: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"cancel" | "reschedule" | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!canModify) {
    return (
      <p className="text-xs text-ink-500">
        Esta cita ya no permite cambios desde el portal.
      </p>
    );
  }

  async function submit(action: "cancel" | "request_reschedule") {
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/patient/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        action === "cancel"
          ? { action, cancellationReason: text }
          : { action, patientMessage: text }
      )
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "No se ha podido guardar el cambio.");
      setLoading(false);
      return;
    }

    setText("");
    setMode(null);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setMode("cancel")}>
          Cancelar cita
        </Button>
        <Button variant="ghost" onClick={() => setMode("reschedule")}>
          Solicitar cambio
        </Button>
      </div>
      {mode ? (
        <div className="space-y-3 rounded-3xl bg-white/75 p-4">
          <Textarea
            placeholder={
              mode === "cancel"
                ? "Motivo de cancelación (opcional)"
                : "Describe qué cambio necesitas"
            }
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex gap-2">
            <Button
              onClick={() =>
                submit(mode === "cancel" ? "cancel" : "request_reschedule")
              }
              disabled={loading}
            >
              {loading ? "Guardando..." : "Confirmar"}
            </Button>
            <Button variant="ghost" onClick={() => setMode(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
