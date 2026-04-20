"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { WEEKDAY_OPTIONS } from "@/lib/constants";
import { availabilityRuleSchema } from "@/lib/validation/availability";

type FormValues = z.infer<typeof availabilityRuleSchema>;

export function TherapistAvailabilityForm({
  therapistId
}: {
  therapistId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(availabilityRuleSchema),
    defaultValues: {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "13:00",
      slotDurationMinutes: 50
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const response = await fetch("/api/therapist/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        therapistId
      })
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setServerError(payload.error ?? "No se ha podido guardar la disponibilidad.");
      return;
    }

    reset();
    router.refresh();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField label="Día de la semana" error={errors.dayOfWeek?.message}>
        <Select {...register("dayOfWeek")}>
          {WEEKDAY_OPTIONS.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Desde" error={errors.startTime?.message}>
          <Input type="time" {...register("startTime")} />
        </FormField>
        <FormField label="Hasta" error={errors.endTime?.message}>
          <Input type="time" {...register("endTime")} />
        </FormField>
      </div>
      <FormField
        label="Duración por hueco"
        error={errors.slotDurationMinutes?.message}
      >
        <Input type="number" min={25} max={120} {...register("slotDurationMinutes")} />
      </FormField>
      {serverError ? (
        <p className="rounded-2xl bg-rose/30 px-4 py-3 text-sm text-ink-900">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Añadir regla"}
      </Button>
    </form>
  );
}
