"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/auth-schemas";
import { authClient, signIn } from "@/lib/auth-client";
import { homeForRole } from "@/lib/roles";
import {
  GoogleAuthDivider,
  GoogleSignInButton,
} from "@/components/auth/google-sign-in-button";

function loginErrorFromQuery(code: string | null) {
  if (!code) return null;
  if (code === "account_not_linked") {
    return "This Google email already has an account. Sign in with email/password once, or try Google again after linking is enabled.";
  }
  if (code === "google" || code === "access_denied" || code === "oauth_provider_error") {
    return "Google sign-in was cancelled or failed. Please try again.";
  }
  return "Could not complete sign-in. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    // Better Auth may append error=account_not_linked; prefer the most specific code.
    const codes = searchParams.getAll("error");
    const preferred =
      codes.find((c) => c === "account_not_linked") ??
      codes.find((c) => c === "google") ??
      codes[0] ??
      null;
    setFormError(loginErrorFromQuery(preferred));
  }, [searchParams]);

  const resolveHome = async () => {
    if (nextPath) return nextPath;
    const session = await authClient.getSession();
    const role = (session.data?.user as { role?: string } | undefined)?.role;
    return homeForRole(role);
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(error.message || "Invalid email or password");
      return;
    }

    const home = await resolveHome();
    router.push(home);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError ? (
        <p className="rounded-lg bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-[var(--danger)]">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-[var(--danger)]">{errors.password.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <GoogleAuthDivider />

      <GoogleSignInButton
        disabled={isSubmitting}
        onError={(message) => setFormError(message || null)}
      />

      <p className="pt-2 text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
