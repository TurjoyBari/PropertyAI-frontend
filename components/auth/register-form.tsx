"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/lib/auth-schemas";
import { authClient, signIn, signUp } from "@/lib/auth-client";
import { homeForRole } from "@/lib/roles";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      accountType: "customer",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: values.accountType === "agent" ? "/dashboard" : "/customer",
    });

    if (error) {
      setFormError(error.message || "Could not create account");
      return;
    }

    await signIn.email({
      email: values.email,
      password: values.password,
    });

    // Map UI choice → Better Auth role (customer = user). Admin cannot self-register.
    const rolePayload = values.accountType === "agent" ? "agent" : "user";
    const roleResponse = await fetch("/api/account/signup-role", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: rolePayload }),
    });

    if (!roleResponse.ok) {
      const payload = await roleResponse.json().catch(() => null);
      setFormError(payload?.message || "Account created, but role could not be set");
      return;
    }

    // Refresh session so middleware sees the updated role.
    await authClient.getSession();
    router.push(homeForRole(rolePayload));
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError ? (
        <p className="rounded-lg bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">I am registering as</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent-soft)]">
            <input
              type="radio"
              value="customer"
              className="accent-[var(--accent)]"
              {...register("accountType")}
            />
            Customer
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent-soft)]">
            <input
              type="radio"
              value="agent"
              className="accent-[var(--accent)]"
              {...register("accountType")}
            />
            Agent
          </label>
        </div>
        {errors.accountType ? (
          <p className="text-xs text-[var(--danger)]">{errors.accountType.message}</p>
        ) : null}
        <p className="text-xs text-[var(--muted)]">
          Customer browses & books visits. Agent manages leads and listings. Admin is assigned later.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-xs text-[var(--danger)]">{errors.name.message}</p>
        ) : null}
      </div>

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
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-[var(--danger)]">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-xs text-[var(--danger)]">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="pt-2 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
