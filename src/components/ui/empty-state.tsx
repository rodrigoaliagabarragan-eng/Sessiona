import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <Card className="flex flex-col items-start gap-4 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        <p className="text-sm text-ink-600">{description}</p>
      </div>
      {ctaHref && ctaLabel ? (
        <Link className={buttonVariants("secondary")} href={ctaHref}>
          {ctaLabel}
        </Link>
      ) : null}
    </Card>
  );
}
