"use client";

import { useToastStore } from "@/store/toast-store";
import clsx from "clsx";

export function ToastViewport() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={clsx(
            "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-[var(--shadow)]",
            item.tone === "success" &&
              "border-[var(--accent)] bg-[var(--card)] text-[var(--foreground)]",
            item.tone === "error" &&
              "border-[var(--danger)] bg-[var(--card)] text-[var(--danger)]",
            item.tone === "info" &&
              "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]",
          )}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{item.message}</p>
            <button
              type="button"
              className="text-xs text-[var(--muted)]"
              onClick={() => dismiss(item.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
