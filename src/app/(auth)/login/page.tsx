import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/app");
  }

  return (
    <div className="page-wrap flex min-h-screen items-center justify-center py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.5rem] bg-ink-900 p-8 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
            Acceso seguro
          </p>
          <h1 className="mt-6 max-w-md font-serif text-5xl leading-tight">
            Privacidad y claridad para cada sesión.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/70">
            Entra con tus credenciales para acceder solo a la información que te
            corresponde según tu rol. Todo el control de acceso relevante se
            valida también en servidor.
          </p>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            Credenciales demo disponibles en el README y en los seeds del proyecto.
          </div>
        </div>
        <div className="card-surface p-7 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-500">
              Iniciar sesión
            </p>
            <h2 className="font-serif text-3xl text-ink-900">Bienvenido de nuevo</h2>
            <p className="text-sm text-ink-600">
              Si eres paciente y todavía no tienes acceso, tu terapeuta puede
              vincular tu cuenta existente o crearla desde su panel.
            </p>
          </div>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-6 text-sm text-ink-600">
            ¿Aún no tienes cuenta de paciente?{" "}
            <Link className="font-semibold text-ink-900 underline" href="/register">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
