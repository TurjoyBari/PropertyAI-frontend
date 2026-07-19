"use client";

import { useEffect, useState } from "react";
import {
  listNotifications,
  markNotificationRead,
  sendNotification,
} from "@/services/notifications.service";
import type { AppNotification } from "@/types/notification";

const fieldClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function NotificationsView() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    channel: "in_app" as "in_app" | "email" | "whatsapp",
    email: "",
    phone: "",
  });

  const reload = () =>
    listNotifications()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );

  useEffect(() => {
    let active = true;
    listNotifications()
      .then((data) => {
        if (!active) return;
        setItems(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          In-app feed plus optional email / WhatsApp (console until SMTP / Meta keys are set).
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <form
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setSending(true);
            setError(null);
            try {
              await sendNotification({
                title: form.title,
                body: form.body,
                channel: form.channel,
                email: form.email || undefined,
                phone: form.phone || undefined,
              });
              setForm({
                title: "",
                body: "",
                channel: "in_app",
                email: "",
                phone: "",
              });
              await reload();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Send failed");
            } finally {
              setSending(false);
            }
          }}
        >
          <h2 className="text-lg font-semibold">Send notification</h2>
          <input
            className={fieldClass}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            className={fieldClass}
            rows={3}
            placeholder="Message"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            required
          />
          <select
            className={fieldClass}
            value={form.channel}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                channel: e.target.value as typeof form.channel,
              }))
            }
          >
            <option value="in_app">In-app</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          {form.channel === "email" ? (
            <input
              className={fieldClass}
              type="email"
              placeholder="Recipient email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          ) : null}
          {form.channel === "whatsapp" ? (
            <input
              className={fieldClass}
              placeholder="Phone with country code"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
            />
          ) : null}
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-lg font-semibold">Inbox</h2>
          {error ? (
            <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>
          ) : null}
          {loading ? (
            <div className="mt-4 h-40 animate-pulse rounded-xl bg-[var(--border)]" />
          ) : items.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">No notifications yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li
                  key={item._id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{item.body}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                        {item.channel} · {item.status}
                      </p>
                    </div>
                    {item.status !== "read" ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-[var(--accent)] hover:underline"
                        onClick={async () => {
                          await markNotificationRead(item._id);
                          await reload();
                        }}
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
