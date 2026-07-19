"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import clsx from "clsx";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Extra line under description (e.g. “This action cannot be undone.”) */
  warning?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmLoadingLabel?: string;
  /** Visual tone for the confirm button */
  tone?: "danger" | "accent";
  loading?: boolean;
  /** Click outside closes the dialog (ignored while loading) */
  closeOnOverlayClick?: boolean;
  onConfirm: () => void | Promise<void>;
};

/**
 * Reusable confirmation modal — Cancel Visit, Delete Property, Logout, etc.
 * Portaled to document.body so it always stacks above dashboards/charts.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  warning,
  cancelLabel = "Keep",
  confirmLabel = "Confirm",
  confirmLoadingLabel = "Working…",
  tone = "danger",
  loading = false,
  closeOnOverlayClick = true,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => confirmRef.current?.focus(), 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        e.preventDefault();
        onOpenChange(false);
        return;
      }

      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, loading, onOpenChange]);

  const close = () => {
    if (loading) return;
    onOpenChange(false);
  };

  const dialog = (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ isolation: "isolate" }}
        >
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (closeOnOverlayClick) close();
            }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              disabled={loading}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] disabled:opacity-50"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex gap-3">
              <span
                className={clsx(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  tone === "danger"
                    ? "bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-[var(--danger)]"
                    : "bg-[var(--accent-soft)] text-[var(--accent)]",
                )}
              >
                <AlertTriangle size={20} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h2 id={titleId} className="text-lg font-semibold tracking-tight">
                  {title}
                </h2>
                {description ? (
                  <p id={descriptionId} className="mt-2 text-sm text-[var(--muted)]">
                    {description}
                  </p>
                ) : null}
                {warning ? (
                  <p className="mt-2 text-sm font-medium text-[var(--danger)]">
                    {warning}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={close}
                disabled={loading}
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] disabled:opacity-60"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                disabled={loading}
                onClick={() => void onConfirm()}
                className={clsx(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60",
                  tone === "danger"
                    ? "bg-[var(--danger)] hover:opacity-90"
                    : "bg-[var(--accent)] hover:opacity-90",
                )}
              >
                {loading ? confirmLoadingLabel : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(dialog, document.body);
}
