import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up with email or continue with Google as a Customer."
    >
      <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading...</p>}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
