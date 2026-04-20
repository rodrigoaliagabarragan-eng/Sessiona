"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/validation/auth";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setServerError(payload.error ?? "No se ha podido crear la cuenta.");
      return;
    }

    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    router.push("/app/patient");
    router.refresh();
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <FormField label="Nombre completo" error={errors.fullName?.message}>
        <Input autoComplete="name" {...register("fullName")} />
      </FormField>
      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Contraseña" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
        </FormField>
        <FormField
          label="Confirmar contraseña"
          error={errors.confirmPassword?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </FormField>
      </div>
      {serverError ? (
        <p className="rounded-2xl bg-rose/30 px-4 py-3 text-sm text-ink-900">
          {serverError}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
