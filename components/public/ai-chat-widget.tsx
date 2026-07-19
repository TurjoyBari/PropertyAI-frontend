"use client";

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Bot, Minus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const PropertyAiChat = lazy(() =>
  import("@/components/ai/property-ai-chat").then((m) => ({
    default: m.PropertyAiChat,
  })),
);

/**
 * Global floating AI assistant for public (marketing) pages.
 * Lazy-loads the shared PropertyAiChat (same backend intent/chat logic as AI Studio).
 */
export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [mountedChat, setMountedChat] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setMinimized(false);
  }, []);

  const openChat = useCallback(() => {
    setMountedChat(true);
    setMinimized(false);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open && !minimized) {
      panelRef.current?.focus();
    }
  }, [open, minimized]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && !minimized ? (
          <motion.div
            key="panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto flex h-[min(650px,calc(100dvh-6rem))] max-h-[calc(100dvh-5rem)] w-[min(100vw-1.5rem,420px)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_50px_rgba(15,23,20,0.18)] outline-none max-sm:fixed max-sm:inset-3 max-sm:h-auto max-sm:max-h-none max-sm:w-auto"
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Bot size={20} />
                </span>
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className="truncate text-sm font-semibold tracking-tight"
                  >
                    PropertyAI Assistant
                  </h2>
                  <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Minimize chat"
                  onClick={() => setMinimized(true)}
                  className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Close chat"
                  onClick={close}
                  className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 p-3">
              {mountedChat ? (
                <Suspense
                  fallback={
                    <p className="p-4 text-sm text-[var(--muted)]">
                      Loading assistant…
                    </p>
                  }
                >
                  <PropertyAiChat variant="widget" className="h-full" />
                </Suspense>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        aria-label={open && !minimized ? "Close assistant" : "Open PropertyAI assistant"}
        onClick={() => {
          if (open && !minimized) close();
          else if (minimized) {
            setMinimized(false);
            setOpen(true);
          } else openChat();
        }}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_12px_30px_rgba(15,118,110,0.35)] transition hover:scale-105 hover:opacity-95"
      >
        {!open || minimized ? (
          <span
            className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)]/30"
            aria-hidden
          />
        ) : null}
        <span className="relative z-10">
          {open && !minimized ? <X size={22} /> : <Bot size={24} />}
        </span>
      </button>
    </div>
  );
}
