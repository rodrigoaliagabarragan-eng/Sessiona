"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { requestPasswordResetSchema } from "@/lib/validation/auth";

type FormValues = z.infer<typeof requestPasswordResetSchema>;

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as {
      message?: string;
      devResetUrl?: string | null;
    };

    setMessage(
      payload.message ??
        "Si existe una cuenta con ese email, te hemos enviado instrucciones."
    );
    setDevResetUrl(payload.devResetUrl ?? null);
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <FormField
        label="Email"
        hint="En producción aquí se enviaría un correo seguro con un enlace de recuperación."
        error={errors.email?.message}
      >
        <Input type="email" autoComplete="email" {...register("email")} />
      </FormField>
      {message ? (
        <div className="space-y-3 rounded-3xl bg-mist/70 p-4 text-sm text-ink-900">
          <p>{message}</p>
          {devResetUrl ? (
            <p>
              Modo local: <Link className="font-semibold underline" href={devResetUrl}>abrir enlace de reseteo</Link>
            </p>
          ) : null}
        </div>
      ) : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Generando..." : "Solicitar recuperación"}
      </Button>
    </form>
  );
}
