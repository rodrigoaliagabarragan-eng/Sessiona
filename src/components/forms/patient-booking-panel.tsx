"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import { patientBookAppointmentSchema } from "@/lib/validation/appointments";

type FormValues = z.infer<typeof patientBookAppointmentSchema>;

type Slot = {
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
};

export function PatientBookingPanel({
  therapists
}: {
  therapists: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(patientBookAppointmentSchema),
    defaultValues: {
      therapistId: therapists[0]?.id ?? "",
      startsAt: "",
      durationMinutes: 50
    }
  });

  const therapistId = watch("therapistId");

  useEffect(() => {
    async function loadSlots() {
      if (!therapistId) {
        return;
      }

      setLoadingSlots(true);
      setServerError(null);
      const response = await fetch(
        `/api/patient/availability?therapistId=${therapistId}`
      );
      const payload = (await response.json()) as {
        slots?: Slot[];
        error?: string;
      };

      if (!response.ok) {
        setServerError(payload.error ?? "No se ha podido cargar la disponibilidad.");
        setSlots([]);
        setLoadingSlots(false);
        return;
      }

      setSlots(payload.slots ?? []);
      setSelectedSlot(null);
      setLoadingSlots(false);
    }

    void loadSlots();
  }, [therapistId]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const response = await fetch("/api/patient/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setServerError(payload.error ?? "No se ha podido reservar la cita.");
      return;
    }

    router.refresh();
  });

  return (
    <div className="space-y-5">
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField label="Profesional">
          <Select {...register("therapistId")}>
            {therapists.map((therapist) => (
              <option key={therapist.id} value={therapist.id}>
                {therapist.name}
              </option>
            ))}
          </Select>
        </FormField>

        {loadingSlots ? (
          <p className="text-sm text-ink-600">Cargando huecos disponibles...</p>
        ) : null}

        <div className="grid gap-3">
          {slots.slice(0, 12).map((slot) => {
            const active = selectedSlot?.startsAt === slot.startsAt;
            return (
              <button
                key={slot.startsAt}
                type="button"
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-200 bg-white hover:border-accent hover:bg-mist/40"
                }`}
                onClick={() => {
                  setSelectedSlot(slot);
                  setValue("startsAt", slot.startsAt);
                  setValue("durationMinutes", slot.durationMinutes);
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{formatDateTime(slot.startsAt)}</p>
                    <p className="text-xs opacity-80">
                      Fin {format(new Date(slot.endsAt), "HH:mm")}
                    </p>
                  </div>
                  <Badge tone={active ? "neutral" : "accent"}>
                    {slot.durationMinutes} min
                  </Badge>
                </div>
              </button>
            );
          })}
          {!loadingSlots && slots.length === 0 ? (
            <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-ink-600">
              No hay huecos publicados en este momento.
            </p>
          ) : null}
        </div>

        {serverError ? (
          <p className="rounded-2xl bg-rose/30 px-4 py-3 text-sm text-ink-900">
            {serverError}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting || !selectedSlot}>
          {isSubmitting ? "Reservando..." : "Reservar cita"}
        </Button>
      </form>
    </div>
  );
}
