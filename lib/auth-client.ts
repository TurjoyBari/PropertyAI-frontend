import { createAuthClient } from "better-auth/react";

/**
 * Prefer the live browser origin so production / preview Vercel URLs
 * never call localhost baked from a stale NEXT_PUBLIC_APP_URL.
 */
function resolveAuthBaseURL() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Browser auth client.
 * Calls same-origin `/api/auth/*` which Next.js rewrites to the NestJS backend.
 */
export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
});

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword } =
  authClient;
