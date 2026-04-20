"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema } from "@/lib/validation/auth";

type FormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token ?? "",
      password: "",
      confirmPassword: "",
      note: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setServerError(payload.error ?? "No se ha podido cambiar la contraseña.");
      return;
    }

    router.push("/login?reset=1");
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {!token ? (
        <FormField label="Token de recuperación" error={errors.token?.message}>
          <Input {...register("token")} />
        </FormField>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nueva contraseña" error={errors.password?.message}>
          <Input type="password" {...register("password")} />
        </FormField>
        <FormField
          label="Confirmar contraseña"
          error={errors.confirmPassword?.message}
        >
          <Input type="password" {...register("confirmPassword")} />
        </FormField>
      </div>
      {serverError ? (
        <p className="rounded-2xl bg-rose/30 px-4 py-3 text-sm text-ink-900">
          {serverError}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
      </Button>
    </form>
  );
}
