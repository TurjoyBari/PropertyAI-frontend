"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function friendlyGoogleError(message?: string | null) {
  const raw = (message || "").toLowerCase();
  if (!raw) return "Google sign-in failed. Please try again.";
  if (raw.includes("account_not_linked") || raw.includes("not_linked")) {
    return "This Google email already has an account. Use email/password once, then Google will link automatically.";
  }
  if (raw.includes("popup") || raw.includes("closed")) {
    return "Google sign-in was cancelled. You can try again anytime.";
  }
  if (raw.includes("network") || raw.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  if (raw.includes("not configured") || raw.includes("client id")) {
    return "Google login is not configured yet. Please use email and password.";
  }
  if (raw.includes("duplicate") || raw.includes("already exists")) {
    return "An account with this email already exists. Sign in with email/password, then try Google again.";
  }
  if (raw.includes("expired") || raw.includes("session")) {
    return "Your session expired. Please try Google sign-in again.";
  }
  if (raw.includes("invalid") || raw.includes("token") || raw.includes("oauth")) {
    return "Google could not verify this sign-in. Please try again.";
  }
  return "Google sign-in failed. Please try again.";
}

export function GoogleAuthDivider() {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden="true">
      <div className="h-px flex-1 bg-[var(--border)]" />
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        OR
      </span>
      <div className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

type GoogleSignInButtonProps = {
  onError?: (message: string) => void;
  disabled?: boolean;
};

/**
 * Continues Better Auth Google OAuth. New users get default role `user` (Customer).
 * Callback page resolves the final role dashboard.
 */
export function GoogleSignInButton({ onError, disabled }: GoogleSignInButtonProps) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [loading, setLoading] = useState(false);

  const onGoogle = async () => {
    onError?.("");
    setLoading(true);

    const callback = new URL("/auth/callback", window.location.origin);
    if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) {
      callback.searchParams.set("next", nextPath);
    }

    const errorCallback = new URL("/login", window.location.origin);

    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: `${callback.pathname}${callback.search}`,
        errorCallbackURL: errorCallback.pathname,
      });

      if (error) {
        onError?.(friendlyGoogleError(error.message || error.code));
        setLoading(false);
      }
      // On success Better Auth redirects away; keep loading until navigation.
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      onError?.(friendlyGoogleError(message));
      setLoading(false);
    }
  };

  const busy = loading || disabled;

  return (
    <button
      type="button"
      onClick={() => void onGoogle()}
      disabled={busy}
      className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[color-mix(in_oklab,var(--foreground)_4%,var(--card))] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon className="h-5 w-5 shrink-0" />
      {loading ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
}
