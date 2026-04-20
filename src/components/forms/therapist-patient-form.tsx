"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPatientSchema } from "@/lib/validation/patients";

type FormValues = z.infer<typeof createPatientSchema>;

export function TherapistPatientForm({
  therapistId
}: {
  therapistId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [createdNewAccount, setCreatedNewAccount] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<
    z.input<typeof createPatientSchema>,
    unknown,
    z.output<typeof createPatientSchema>
  >({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      notes: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setTempPassword(null);
    const response = await fetch("/api/therapist/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        therapistId
      })
    });

    const payload = (await response.json()) as {
      error?: string;
      temporaryPassword?: string | null;
      createdNewAccount?: boolean;
    };

    if (!response.ok) {
      setServerError(payload.error ?? "No se ha podido guardar el paciente.");
      return;
    }

    setTempPassword(payload.temporaryPassword ?? null);
    setCreatedNewAccount(Boolean(payload.createdNewAccount));
    reset();
    router.refresh();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Nombre completo" error={errors.fullName?.message}>
          <Input {...register("fullName")} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Teléfono" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </FormField>
        <FormField label="Fecha de nacimiento" error={errors.dateOfBirth?.message}>
          <Input type="date" {...register("dateOfBirth")} />
        </FormField>
      </div>
      <FormField
        label="Notas internas"
        error={errors.notes?.message}
        hint="Solo visibles para el terapeuta."
      >
        <Textarea {...register("notes")} />
      </FormField>
      {serverError ? (
        <p className="rounded-2xl bg-rose/30 px-4 py-3 text-sm text-ink-900">
          {serverError}
        </p>
      ) : null}
      {tempPassword ? (
        <div className="rounded-3xl bg-mist/70 p-4 text-sm text-ink-900">
          <p className="font-semibold">
            {createdNewAccount
              ? "Cuenta creada y vinculada."
              : "Cuenta existente vinculada."}
          </p>
          {createdNewAccount ? (
            <p className="mt-2">
              Contraseña temporal para compartir de forma segura:{" "}
              <span className="font-mono font-semibold">{tempPassword}</span>
            </p>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Crear o vincular paciente"}
      </Button>
    </form>
  );
}
