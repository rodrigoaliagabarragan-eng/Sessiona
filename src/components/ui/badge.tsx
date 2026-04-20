import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children
}: {
  className?: string;
  tone?: "neutral" | "accent" | "warning" | "success";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent/25 text-ink-900"
      : tone === "warning"
        ? "bg-rose/25 text-ink-900"
        : tone === "success"
          ? "bg-mist text-ink-900"
          : "bg-ink-100 text-ink-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
