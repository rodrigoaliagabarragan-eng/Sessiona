import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="page-wrap flex min-h-screen items-center justify-center py-10">
      <div className="card-surface w-full max-w-xl p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-500">
            Nueva contraseña
          </p>
          <h1 className="font-serif text-3xl text-ink-900">Actualizar credenciales</h1>
          <p className="text-sm text-ink-600">
            El token se valida en servidor y se invalida al usarse.
          </p>
        </div>
        <div className="mt-8">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
