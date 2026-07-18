"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { UserAvatar, type AuthUser } from "@/components/public/user-menu";
import { getRole, homeForRole, roleLabel } from "@/lib/roles";

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user as AuthUser | undefined;
  const role = getRole(user);

  if (isPending) {
    return <div className="mx-auto max-w-3xl px-4 py-16 h-40 animate-pulse rounded-2xl bg-[var(--border)]" />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-[var(--muted)]">Please sign in to view your profile.</p>
        <Link href="/login" className="mt-4 inline-flex text-sm font-medium text-[var(--accent)] hover:underline">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">My Profile</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Account details for your PropertyAI session.</p>

      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <UserAvatar user={user} />
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {roleLabel(role)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={homeForRole(role)}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/customer/favorites"
          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
        >
          Saved Properties
        </Link>
      </div>
    </div>
  );
}
