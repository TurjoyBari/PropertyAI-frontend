"use client";

import { useEffect, useState } from "react";
import { listMessages, sendMessage } from "@/services/messages.service";
import type { AppMessage } from "@/services/messages.service";
import { useSession } from "@/lib/auth-client";

export default function CustomerMessagesPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<AppMessage[]>([]);
  const [toUserId, setToUserId] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    listMessages()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
      <p className="text-sm text-[var(--muted)]">
        Send a message using an agent&apos;s user id (from your agent contact).
      </p>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <form
        className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await sendMessage({ toUserId, body });
            setBody("");
            await reload();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Send failed");
          }
        }}
      >
        <input
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm"
          placeholder="Agent user ID"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          required
        />
        <textarea
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm"
          rows={3}
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white">
          Send
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item._id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
            <p className="text-xs text-[var(--muted)]">
              {item.fromUserId === session?.user?.id ? "You →" : "←"} {item.toUserId.slice(0, 8)}…
            </p>
            <p className="mt-2">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
