export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/50 bg-white/65 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-500">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-ink-900 sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-2xl text-sm text-ink-600">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
