"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { publicCreateInquiry, publicGetProperty } from "@/services/public.service";
import { addFavorite } from "@/services/favorites.service";
import { useSession } from "@/lib/auth-client";
import type { Property } from "@/types/property";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    publicGetProperty(params.id)
      .then(setProperty)
      .catch((err) => setError(err instanceof Error ? err.message : "Not found"));
  }, [params.id]);

  if (error) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--muted)]">{error}</p>;
  }
  if (!property) {
    return <div className="mx-auto max-w-3xl px-4 py-16 h-40 animate-pulse rounded-2xl bg-[var(--border)]" />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div>
        <Link href="/listings" className="text-sm text-[var(--accent)] hover:underline">
          ← All listings
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{property.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {property.location.address}, {property.location.city}
        </p>
        <p className="mt-4 text-xl font-semibold">
          {property.price.toLocaleString()} {property.currency}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {property.bedrooms} bed · {property.bathrooms} bath · {property.type}
        </p>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">{property.description}</p>

      <div className="flex flex-wrap gap-2">
        {session?.user ? (
          <button
            type="button"
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
            onClick={async () => {
              try {
                await addFavorite(property._id);
                setMessage("Saved to favorites");
              } catch (err) {
                setMessage(err instanceof Error ? err.message : "Could not save");
              }
            }}
          >
            Save favorite
          </button>
        ) : (
          <Link href="/login" className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium">
            Sign in to save
          </Link>
        )}
        <Link
          href={session?.user ? `/customer/visits/new?propertyId=${property._id}` : "/login"}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Book visit
        </Link>
      </div>

      <form
        className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const result = await publicCreateInquiry({
              ...form,
              propertyId: property._id,
            });
            setMessage(result.message);
            setForm({ fullName: "", email: "", phone: "", message: "" });
          } catch (err) {
            setMessage(err instanceof Error ? err.message : "Inquiry failed");
          }
        }}
      >
        <h2 className="text-lg font-semibold">Contact / inquiry</h2>
        {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
        <input
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm"
          placeholder="Full name"
          required
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />
        <input
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm"
          placeholder="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <textarea
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm"
          rows={3}
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Send inquiry
        </button>
      </form>
    </div>
  );
}
