import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import type { UserRole } from "@prisma/client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch role from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        (session.user as SessionUser).role = dbUser?.role ?? "USER";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-assign ADMIN role if email matches ADMIN_EMAILS
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        await prisma.user.update({
          where: { id: user.id! },
          data: { role: "ADMIN" },
        });
      }
    },
  },
});

// Extended session user type
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

// Helper: get current session user or null
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

// Helper: require authenticated user, throws error info for API routes
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("UNAUTHORIZED");
  return user;
}

// Helper: require ADMIN role
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new AuthError("FORBIDDEN");
  return user;
}

// Helper: require resource owner or ADMIN
export async function requireOwnerOrAdmin(ownerId: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.id !== ownerId && user.role !== "ADMIN") {
    throw new AuthError("FORBIDDEN");
  }
  return user;
}

export class AuthError extends Error {
  type: "UNAUTHORIZED" | "FORBIDDEN";
  constructor(type: "UNAUTHORIZED" | "FORBIDDEN") {
    super(type === "UNAUTHORIZED" ? "Authentication required" : "Insufficient permissions");
    this.type = type;
  }
}
