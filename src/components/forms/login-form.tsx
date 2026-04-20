"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validation/auth";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/app";
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (!result?.ok) {
      setServerError("Las credenciales no son válidas o la cuenta está inactiva.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </FormField>
      <FormField label="Contraseña" error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
      </FormField>
      {serverError ? (
        <p className="rounded-2xl bg-rose/30 px-4 py-3 text-sm text-ink-900">
          {serverError}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
        <Link className="text-sm text-ink-600 hover:text-ink-900" href="/forgot-password">
          He olvidado mi contraseña
        </Link>
      </div>
    </form>
  );
}
