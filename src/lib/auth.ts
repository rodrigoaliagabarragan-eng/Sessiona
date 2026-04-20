import { UserRole } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { APP_ROUTES_BY_ROLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const SESSION_MAX_AGE = 60 * 60 * 8;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            therapistProfile: true,
            patientProfile: true
          }
        });

        if (!user || !user.isActive) {
          return null;
        }

        const matches = await verifyPassword(password, user.passwordHash);
        if (!matches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          therapistProfileId: user.therapistProfile?.id ?? null,
          patientProfileId: user.patientProfile?.id ?? null
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.therapistProfileId = user.therapistProfileId ?? null;
        token.patientProfileId = user.patientProfileId ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
        session.user.therapistProfileId = token.therapistProfileId ?? null;
        session.user.patientProfileId = token.patientProfileId ?? null;
      }

      return session;
    }
  }
};

export async function auth() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireSession();

  if (!roles.includes(user.role)) {
    redirect(APP_ROUTES_BY_ROLE[user.role]);
  }

  return user;
}
