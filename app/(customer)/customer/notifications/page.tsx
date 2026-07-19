"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  listNotifications,
  markNotificationRead,
} from "@/services/notifications.service";
import type { AppNotification } from "@/types/notification";
import { CustomerPageHeader } from "@/components/customer/page-header";
import { PageTransition } from "@/components/customer/page-transition";
import { Skeleton } from "@/components/customer/skeleton";
import { toast } from "@/store/toast-store";

export default function CustomerNotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    listNotifications()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="space-y-8">
        <CustomerPageHeader
          title="Notifications"
          subtitle="Visit updates, messages, and account alerts."
        />

        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center text-sm text-[var(--muted)]">
            No notifications yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((note) => {
              const unread = note.status !== "read";
              return (
                <li
                  key={note._id}
                  className={`flex gap-4 rounded-2xl border bg-[var(--card)] p-4 shadow-[0_8px_30px_rgba(20,32,28,0.04)] ${
                    unread
                      ? "border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Bell size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold tracking-tight">{note.title}</p>
                      {note.createdAt ? (
                        <p className="text-xs text-[var(--muted)]">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{note.body}</p>
                    {unread ? (
                      <button
                        type="button"
                        className="mt-3 text-sm font-semibold text-[var(--accent)] hover:underline"
                        onClick={async () => {
                          try {
                            await markNotificationRead(note._id);
                            setItems((prev) =>
                              prev.map((row) =>
                                row._id === note._id
                                  ? { ...row, status: "read" }
                                  : row,
                              ),
                            );
                          } catch (err) {
                            toast(
                              err instanceof Error
                                ? err.message
                                : "Could not mark as read",
                              "error",
                            );
                          }
                        }}
                      >
                        Mark as read
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageTransition>
  );
}
