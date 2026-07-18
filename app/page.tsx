export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
          Milestone 1 — Foundation Ready
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          PropertyAI
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Frontend (Next.js) and Backend (NestJS) are set up as separate apps.
          Authentication, dashboard, and AI features will be built step by step.
        </p>
        <div className="mt-8 flex flex-col items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
          <p>
            Frontend:{" "}
            <span className="font-mono text-zinc-800 dark:text-zinc-200">
              http://localhost:3000
            </span>
          </p>
          <p>
            Backend:{" "}
            <span className="font-mono text-zinc-800 dark:text-zinc-200">
              http://localhost:4000/health
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
