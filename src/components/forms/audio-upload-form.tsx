"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadAudioSchema } from "@/lib/validation/audio";

type FormValues = z.input<typeof uploadAudioSchema>;

export function AudioUploadForm({
  patientId,
  appointments,
  therapistId
}: {
  patientId: string;
  appointments: Array<{ id: string; label: string }>;
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
    resolver: zodResolver(uploadAudioSchema),
    defaultValues: {
      patientId,
      appointmentId: "",
      title: "",
      sessionDate: format(new Date(), "yyyy-MM-dd"),
      durationSeconds: 300,
      notesPrivate: ""
    }
  });

  const onSubmit = handleSubmit(async (values, event) => {
    const formElement = event?.target as HTMLFormElement | undefined;
    const fileInput = formElement?.querySelector<HTMLInputElement>("input[name=file]");
    const file = fileInput?.files?.[0];

    if (!file) {
      setServerError("Selecciona un archivo de audio.");
      return;
    }

    setServerError(null);
    const formData = new FormData();
    formData.set("patientId", values.patientId);
    if (therapistId) {
      formData.set("therapistId", therapistId);
    }
    if (values.appointmentId) {
      formData.set("appointmentId", values.appointmentId);
    }
    formData.set("title", values.title);
    formData.set("sessionDate", values.sessionDate);
    formData.set("durationSeconds", String(values.durationSeconds));
    formData.set("notesPrivate", values.notesPrivate ?? "");
    formData.set("file", file);

    const response = await fetch("/api/therapist/audio", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setServerError(payload.error ?? "No se ha podido subir el audio.");
      return;
    }

    reset({
      patientId,
      appointmentId: "",
      title: "",
      sessionDate: format(new Date(), "yyyy-MM-dd"),
      durationSeconds: 300,
      notesPrivate: ""
    });
    if (fileInput) {
      fileInput.value = "";
    }
    router.refresh();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <input type="hidden" value={patientId} {...register("patientId")} />
      <FormField label="Archivo de audio">
        <Input type="file" name="file" accept="audio/*" />
      </FormField>
      <FormField label="Título" error={errors.title?.message}>
        <Input {...register("title")} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Fecha de sesión" error={errors.sessionDate?.message}>
          <Input type="date" {...register("sessionDate")} />
        </FormField>
        <FormField label="Duración (segundos)" error={errors.durationSeconds?.message}>
          <Input type="number" min={30} max={14400} {...register("durationSeconds")} />
        </FormField>
      </div>
      <FormField
        label="Vincular a una cita"
        hint="Opcional"
        error={errors.appointmentId?.message}
      >
        <Select {...register("appointmentId")}>
          <option value="">Sin vincular</option>
          {appointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Notas privadas"
        hint="Solo visibles para el profesional."
        error={errors.notesPrivate?.message}
      >
        <Textarea {...register("notesPrivate")} />
      </FormField>
      {serverError ? (
        <p className="rounded-2xl bg-rose/30 px-4 py-3 text-sm text-ink-900">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Subiendo..." : "Subir audio"}
      </Button>
    </form>
  );
}
