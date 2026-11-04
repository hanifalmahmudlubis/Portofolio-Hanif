import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
import { rateLimit, resetRateLimit } from "./rate-limit";
import { ADMIN_SESSION_MAX_SECONDS, adminSessionWindow } from "./admin-session";
import { ApiError } from "./api/error";
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: ADMIN_SESSION_MAX_SECONDS },
  providers: [
    CredentialsProvider({
      name: "Email dan password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials.password ||
          credentials.email.length > 254 ||
          credentials.password.length > 72
        )
          return null;
        const email = credentials.email.trim().toLowerCase();
        try {
          rateLimit(`login:${email}`, 10);
        } catch (error) {
          if (error instanceof ApiError && error.status === 429)
            throw new Error("LoginRateLimited");
          throw error;
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (
          !user ||
          user.role !== "ADMIN" ||
          !(await bcrypt.compare(credentials.password, user.password))
        )
          return null;
        resetRateLimit(`login:${email}`);
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const now = Date.now();
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.signedInAt = now;
        token.lastActiveAt = now;
      } else if (!adminSessionWindow(token, now)) {
        // A missing/expired timing claim must never be renewed by a session update.
        delete token.id;
        delete token.role;
      } else if (trigger === "update" && session?.activity === true) {
        // Ignore client timestamps, identity and role; retain the original login time.
        token.lastActiveAt = now;
      }
      return token;
    },
    async session({ session, token }) {
      const now = Date.now();
      const timing = adminSessionWindow(token, now);
      session.serverTime = now;
      if (!timing || !token.id || token.role !== "ADMIN") {
        session.user = undefined;
        session.error = "SessionExpired";
        session.expires = new Date(0).toISOString();
        return session;
      }
      session.user = { ...session.user, id: token.id, role: token.role };
      session.idleExpiresAt = timing.idleExpiresAt;
      session.absoluteExpiresAt = timing.absoluteExpiresAt;
      session.expires = new Date(timing.expiresAt).toISOString();
      return session;
    },
  },
  pages: { signIn: "/admin/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
