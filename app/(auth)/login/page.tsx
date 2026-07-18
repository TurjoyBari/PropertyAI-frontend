import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage properties, leads, and AI tools.">
      <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
