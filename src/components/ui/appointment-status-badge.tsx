import { AppointmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";

export function AppointmentStatusBadge({
  status
}: {
  status: AppointmentStatus;
}) {
  const tone =
    status === "COMPLETED"
      ? "success"
      : status === "CANCELLED" || status === "NO_SHOW"
        ? "warning"
        : "accent";

  return <Badge tone={tone}>{APPOINTMENT_STATUS_LABELS[status]}</Badge>;
}
