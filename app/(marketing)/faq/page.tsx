"use client";

import { useEffect, useState } from "react";
import { publicFaq } from "@/services/public.service";

export default function FaqPage() {
  const [items, setItems] = useState<Array<{ q: string; a: string }>>([]);

  useEffect(() => {
    publicFaq()
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <article key={item.q} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="font-semibold">{item.q}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.a}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
