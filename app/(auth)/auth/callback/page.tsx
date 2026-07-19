"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";
import { homeForRole } from "@/lib/roles";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Finishing Google sign-in...");

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const next = searchParams.get("next");
      const error = searchParams.get("error");

      if (error) {
        setMessage("Google sign-in failed. Redirecting...");
        router.replace(`/login?error=google`);
        return;
      }

      try {
        const session = await authClient.getSession();
        if (cancelled) return;

        if (!session.data?.user) {
          setMessage("Could not create a session. Redirecting...");
          router.replace("/login?error=google");
          return;
        }

        const role = (session.data.user as { role?: string }).role;
        const home =
          next?.startsWith("/") && !next.startsWith("//")
            ? next
            : homeForRole(role);

        setMessage("Signed in. Redirecting...");
        router.replace(home);
        router.refresh();
      } catch {
        if (cancelled) return;
        setMessage("Something went wrong. Redirecting...");
        router.replace("/login?error=google");
      }
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return <p className="text-center text-sm text-[var(--muted)]">{message}</p>;
}

export default function AuthCallbackPage() {
  return (
    <AuthShell title="Almost there" subtitle="Completing your secure sign-in.">
      <Suspense fallback={<p className="text-center text-sm text-[var(--muted)]">Loading...</p>}>
        <AuthCallbackInner />
      </Suspense>
    </AuthShell>
  );
}
