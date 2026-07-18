"use client";

import { useState } from "react";
import { publicCreateInquiry } from "@/services/public.service";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm";

export default function ContactPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    message: "",
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Send a message — we create a lead for our agents automatically.
      </p>
      <form
        className="mt-8 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const result = await publicCreateInquiry(form);
            setMessage(result.message);
          } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed");
          }
        }}
      >
        {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
        <input className={field} required placeholder="Full name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        <input className={field} required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input className={field} placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <input className={field} placeholder="Preferred location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        <textarea className={field} rows={4} placeholder="How can we help?" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
        <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white">
          Send
        </button>
      </form>
    </div>
  );
}
