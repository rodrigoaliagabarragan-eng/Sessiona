import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      therapistProfileId?: string | null;
      patientProfileId?: string | null;
    };
  }

  interface User {
    role: UserRole;
    therapistProfileId?: string | null;
    patientProfileId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    therapistProfileId?: string | null;
    patientProfileId?: string | null;
  }
}
