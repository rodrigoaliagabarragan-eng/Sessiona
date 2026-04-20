"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteAvailabilityButton({ ruleId }: { ruleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function removeRule() {
    setLoading(true);
    await fetch(`/api/therapist/availability/${ruleId}`, {
      method: "DELETE"
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="ghost" onClick={removeRule} disabled={loading}>
      {loading ? "Eliminando..." : "Eliminar"}
    </Button>
  );
}
