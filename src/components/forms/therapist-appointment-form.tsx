"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { therapistAppointmentSchema } from "@/lib/validation/appointments";

type FormValues = z.input<typeof therapistAppointmentSchema>;

type AppointmentInput = {
  id: string;
  patientId: string;
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  patientMessage: string | null;
};

export function TherapistAppointmentForm({
  patients,
  appointment,
  therapistId
}: {
  patients: Array<{ id: string; name: string }>;
  appointment?: AppointmentInput | null;
  therapistId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<
    z.input<typeof therapistAppointmentSchema>,
    unknown,
    z.output<typeof therapistAppointmentSchema>
  >({
    resolver: zodResolver(therapistAppointmentSchema),
    defaultValues: appointment
      ? {
          id: appointment.id,
          patientId: appointment.patientId,
          startsAt: format(new Date(appointment.startsAt), "yyyy-MM-dd'T'HH:mm"),
          durationMinutes: appointment.durationMinutes,
          status: appointment.status,
          patientMessage: appointment.patientMessage ?? ""
        }
      : {
          patientId: patients[0]?.id ?? "",
          startsAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          durationMinutes: 50,
          status: AppointmentStatus.SCHEDULED,
          patientMessage: ""
        }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const response = await fetch("/api/therapist/appointments", {
      method: appointment ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        therapistId
      })
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setServerError(payload.error ?? "No se ha podido guardar la cita.");
      return;
    }

    router.push("/app/therapist/appointments");
    router.refresh();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField label="Paciente" error={errors.patientId?.message}>
        <Select {...register("patientId")}>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Inicio" error={errors.startsAt?.message}>
          <Input type="datetime-local" {...register("startsAt")} />
        </FormField>
        <FormField label="Duración" error={errors.durationMinutes?.message}>
          <Input type="number" min={25} max={120} {...register("durationMinutes")} />
        </FormField>
      </div>
      {appointment ? (
        <FormField label="Estado" error={errors.status?.message}>
          <Select {...register("status")}>
            {Object.values(AppointmentStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </FormField>
      ) : null}
      <FormField
        label="Mensaje o notas de cita"
        error={errors.patientMessage?.message}
      >
        <Textarea {...register("patientMessage")} />
      </FormField>
      {serverError ? (
        <p className="rounded-2xl bg-rose/30 px-4 py-3 text-sm text-ink-900">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Guardando..."
          : appointment
            ? "Actualizar cita"
            : "Crear cita"}
      </Button>
    </form>
  );
}
