import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";
import { auth } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/app");
  }

  return (
    <div className="page-wrap flex min-h-screen items-center justify-center py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="card-surface order-2 p-7 sm:p-8 lg:order-1">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-500">
              Registro de paciente
            </p>
            <h1 className="font-serif text-3xl text-ink-900">Crear acceso privado</h1>
            <p className="text-sm text-ink-600">
              El alta pública crea una cuenta de paciente. La vinculación con el
              terapeuta se realiza después desde el panel profesional.
            </p>
          </div>
          <div className="mt-8">
            <RegisterForm />
          </div>
          <p className="mt-6 text-sm text-ink-600">
            ¿Ya tienes cuenta?{" "}
            <Link className="font-semibold text-ink-900 underline" href="/login">
              Entrar
            </Link>
          </p>
        </div>
        <div className="order-1 rounded-[2.5rem] bg-white/75 p-8 shadow-soft lg:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-500">
            Qué recibirás
          </p>
          <ul className="mt-6 space-y-5 text-sm leading-7 text-ink-700">
            <li>Acceso a tus próximas citas y reservas si tu terapeuta publica huecos.</li>
            <li>Biblioteca privada para escuchar tus audios en streaming seguro.</li>
            <li>Separación estricta entre pacientes, profesionales y administración.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
