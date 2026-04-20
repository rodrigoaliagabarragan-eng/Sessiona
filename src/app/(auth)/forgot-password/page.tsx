import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="page-wrap flex min-h-screen items-center justify-center py-10">
      <div className="card-surface w-full max-w-xl p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-500">
            Recuperación de contraseña
          </p>
          <h1 className="font-serif text-3xl text-ink-900">Restablecer acceso</h1>
          <p className="text-sm text-ink-600">
            Esta primera versión prepara el flujo de recuperación con token seguro
            almacenado en base de datos.
          </p>
        </div>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
