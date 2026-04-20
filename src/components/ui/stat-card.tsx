import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <span className="text-3xl font-semibold text-ink-900">{value}</span>
        {helper ? <span className="text-xs text-ink-500">{helper}</span> : null}
      </div>
    </Card>
  );
}
