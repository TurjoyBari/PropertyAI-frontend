"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/auth-schemas";
import { authClient, signIn } from "@/lib/auth-client";
import { homeForRole } from "@/lib/roles";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

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

  const onGoogle = async () => {
    setFormError(null);
    setGoogleLoading(true);
    const home = nextPath || "/customer/dashboard";
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: home,
    });
    if (error) {
      setFormError(
        error.message ||
          "Google login is not configured. Add GOOGLE_CLIENT_ID/SECRET on the backend.",
      );
      setGoogleLoading(false);
    }
  };

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
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
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
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
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

      <button
        type="button"
        onClick={onGoogle}
        disabled={googleLoading}
        className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] disabled:opacity-60"
      >
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <p className="pt-2 text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
