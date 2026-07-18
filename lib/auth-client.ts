import { createAuthClient } from "better-auth/react";

/**
 * Browser auth client.
 * Calls same-origin `/api/auth/*` which Next.js rewrites to the NestJS backend.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword } =
  authClient;
