import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            PropertyAI
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
        </div>

        <div
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow)" }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
