import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import type { SessionUser } from "@/lib/permissions";

export async function requireApiUser(roles?: UserRole[]) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ApiError(401, "Debes iniciar sesión.");
  }

  const user: SessionUser & { email?: string | null; name?: string | null } = {
    id: session.user.id,
    role: session.user.role,
    therapistProfileId: session.user.therapistProfileId,
    patientProfileId: session.user.patientProfileId,
    email: session.user.email,
    name: session.user.name
  };

  if (roles && !roles.includes(user.role)) {
    throw new ApiError(403, "No tienes permisos para esta acción.");
  }

  return user;
}

export function resolveTherapistScope(
  user: SessionUser,
  therapistId?: string | null
) {
  if (user.role === "THERAPIST" && user.therapistProfileId) {
    return user.therapistProfileId;
  }

  if (user.role === "ADMIN" && therapistId) {
    return therapistId;
  }

  throw new ApiError(
    400,
    "No se ha podido determinar el terapeuta de esta operación."
  );
}
