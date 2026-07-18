import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="Paste the tokenized link from your reset email.">
      <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
