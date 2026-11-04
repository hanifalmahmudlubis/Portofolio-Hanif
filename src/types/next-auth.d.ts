import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;

      role: string;
    } & DefaultSession["user"];
    error?: "SessionExpired";
    serverTime?: number;
    idleExpiresAt?: number;
    absoluteExpiresAt?: number;
  }

  interface User {
    id: string;

    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;

    role?: string;
    signedInAt?: number;
    lastActiveAt?: number;
  }
}
