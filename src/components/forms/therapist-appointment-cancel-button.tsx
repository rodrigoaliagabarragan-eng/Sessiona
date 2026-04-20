"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TherapistAppointmentCancelButton({
  appointmentId
}: {
  appointmentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancelAppointment() {
    setLoading(true);
    await fetch("/api/therapist/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: appointmentId })
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="ghost" onClick={cancelAppointment} disabled={loading}>
      {loading ? "Cancelando..." : "Cancelar"}
    </Button>
  );
}
