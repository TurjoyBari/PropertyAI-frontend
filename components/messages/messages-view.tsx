"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { listMessages, sendMessage } from "@/services/messages.service";
import type { AppMessage } from "@/services/messages.service";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/store/toast-store";

type MessagesViewProps = {
  title?: string;
  subtitle?: string;
  peerLabel?: string;
  toUserPlaceholder?: string;
  emptyInboxText?: string;
};

export function MessagesView({
  title = "Messages",
  subtitle = "Send and receive messages with your contacts.",
  peerLabel = "Recipient user ID",
  toUserPlaceholder = "Paste user ID",
  emptyInboxText = "No conversations yet.",
}: MessagesViewProps) {
  const { data: session } = useSession();
  const [items, setItems] = useState<AppMessage[]>([]);
  const [toUserId, setToUserId] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const reload = () =>
    listMessages()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const threads = useMemo(() => {
    const me = session?.user?.id;
    const map = new Map<string, AppMessage[]>();
    for (const msg of items) {
      const other = msg.fromUserId === me ? msg.toUserId : msg.fromUserId;
      const list = map.get(other) || [];
      list.push(msg);
      map.set(other, list);
    }
    return Array.from(map.entries()).map(([peerId, messages]) => ({
      peerId,
      messages: messages.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime(),
      ),
    }));
  }, [items, session?.user?.id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await sendMessage({ toUserId, body });
      setBody("");
      toast("Message sent.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      </div>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <p className="text-sm font-semibold">New message</p>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">{peerLabel}</span>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              placeholder={toUserPlaceholder}
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Message</span>
            <textarea
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              rows={4}
              placeholder="Write your message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm font-semibold">Inbox</p>
          {loading ? (
            <div className="mt-4 space-y-3">
              <div className="h-16 animate-pulse rounded-xl bg-[var(--border)]" />
              <div className="h-16 animate-pulse rounded-xl bg-[var(--border)]" />
            </div>
          ) : threads.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">{emptyInboxText}</p>
          ) : (
            <div className="mt-4 max-h-[28rem] space-y-4 overflow-y-auto pr-1">
              {threads.map((thread) => {
                const last = thread.messages[thread.messages.length - 1];
                return (
                  <button
                    key={thread.peerId}
                    type="button"
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-left transition hover:border-[var(--accent)]"
                    onClick={() => setToUserId(thread.peerId)}
                  >
                    <p className="text-xs font-medium text-[var(--muted)]">
                      Contact · {thread.peerId.slice(0, 10)}…
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm">{last?.body}</p>
                    {last?.createdAt ? (
                      <p className="mt-2 text-[11px] text-[var(--muted)]">
                        {new Date(last.createdAt).toLocaleString()}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {items.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
          <div className="space-y-3">
            {items
              .slice()
              .reverse()
              .slice(0, 12)
              .map((item) => {
                const mine = item.fromUserId === session?.user?.id;
                return (
                  <article
                    key={item._id}
                    className={`max-w-xl rounded-2xl border border-[var(--border)] px-4 py-3 text-sm ${
                      mine ? "ml-auto bg-[var(--accent-soft)]" : "bg-[var(--card)]"
                    }`}
                  >
                    <p className="text-[11px] text-[var(--muted)]">
                      {mine ? "You" : "Them"} ·{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ""}
                    </p>
                    <p className="mt-1">{item.body}</p>
                  </article>
                );
              })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
