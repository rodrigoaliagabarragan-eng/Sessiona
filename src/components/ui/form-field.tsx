export function FormField({
  label,
  error,
  hint,
  children
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm text-ink-700">
      <span className="block font-medium text-ink-800">{label}</span>
      {children}
      {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
    </label>
  );
}
