"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Heart, MessageCircle, Phone } from "lucide-react";
import clsx from "clsx";
import { PublicPropertyCard } from "@/components/public/public-property-card";
import { propertyImage, AGENTS } from "@/lib/home-content";
import { useFavorite } from "@/hooks/use-favorite";
import {
  publicCreateInquiry,
  publicGetProperty,
  publicListProperties,
} from "@/services/public.service";
import { useSession } from "@/lib/auth-client";
import type { Property } from "@/types/property";
import { trackRecentlyViewed } from "@/lib/recently-viewed";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

function scrollKey(id: string) {
  return `property-scroll:${id}`;
}

export function ListingDetailClient() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { favorited, loading: favoriteLoading, ready, busy, toggle } =
    useFavorite(params.id);
  const resumedFavorite = useRef(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [activeImage, setActiveImage] = useState(0);
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
      .then((data) => {
        setProperty(data);
        setActiveImage(0);
        trackRecentlyViewed({
          _id: data._id,
          title: data.title,
          price: data.price,
          currency: data.currency,
          image: propertyImage(data),
          city: data.location.city,
          area: data.location.area,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          areaSqFt: data.areaSqFt,
        });
        publicListProperties({
          city: data.location.city,
          type: data.type,
          status: "available",
          limit: 4,
        })
          .then((res) =>
            setSimilar(res.items.filter((item) => item._id !== data._id).slice(0, 3)),
          )
          .catch(() => setSimilar([]));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Not found"));
  }, [params.id]);

  // Restore scroll after returning from Book Visit.
  useEffect(() => {
    if (!property) return;
    const raw = sessionStorage.getItem(scrollKey(params.id));
    if (!raw) return;
    sessionStorage.removeItem(scrollKey(params.id));
    const y = Number(raw);
    if (!Number.isFinite(y)) return;
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, [params.id, property]);

  // Resume favorite action after login redirect.
  useEffect(() => {
    if (resumedFavorite.current) return;
    if (!ready) return;
    if (!session?.user) return;
    if (searchParams.get("action") !== "favorite") return;

    resumedFavorite.current = true;
    const cleanUrl = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      router.replace(`${url.pathname}${url.search}`);
    };

    if (!favorited) {
      void toggle(`/listings/${params.id}`).finally(cleanUrl);
    } else {
      cleanUrl();
    }
  }, [ready, session?.user, searchParams, favorited, toggle, params.id, router]);

  if (error) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--muted)]">{error}</p>
    );
  }
  if (!property) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--border)]" />
      </div>
    );
  }

  const images =
    property.images?.length > 0
      ? property.images.map((img) =>
          img.startsWith("http") || img.startsWith("/") ? img : propertyImage(property),
        )
      : [propertyImage(property)];
  const agent = AGENTS[0];
  const mapQuery = encodeURIComponent(
    `${property.location.address}, ${property.location.city}, Bangladesh`,
  );
  const whatsappText = encodeURIComponent(
    `Hi, I'm interested in "${property.title}" (${property.price.toLocaleString()} ${property.currency}) on PropertyAI.`,
  );
  const bookPath = `/customer/visits/new?property=${property._id}`;
  const bookHref = session?.user
    ? bookPath
    : `/login?next=${encodeURIComponent(bookPath)}`;

  const rememberScroll = () => {
    sessionStorage.setItem(scrollKey(property._id), String(window.scrollY));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 lg:px-6">
      <div>
        <Link href="/listings" className="text-sm text-[var(--accent)] hover:underline">
          ← All listings
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {property.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {property.location.address}
              {property.location.area ? `, ${property.location.area}` : ""},{" "}
              {property.location.city}
            </p>
          </div>
          <p className="text-2xl font-semibold text-[var(--accent)]">
            {property.price.toLocaleString()} {property.currency}
          </p>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {property.bedrooms} bed · {property.bathrooms} bath
          {property.areaSqFt ? ` · ${property.areaSqFt} sqft` : ""} · {property.type}
        </p>
      </div>

      <section>
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--border)]">
          <Image
            src={images[activeImage] || propertyImage(property)}
            alt={property.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, index) => (
              <button
                key={src + index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border ${
                  activeImage === index ? "border-[var(--accent)]" : "border-[var(--border)]"
                }`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="112px" />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl font-semibold">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
              {property.description}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Amenities</h2>
            {property.amenities?.length ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {property.amenities.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">Amenities will be listed by the agent.</p>
            )}
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Virtual tour</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="relative aspect-video">
                <Image
                  src={images[0]}
                  alt="Virtual tour preview"
                  fill
                  className="object-cover opacity-80"
                  sizes="800px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <p className="rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                    360° tour available on request
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Location</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
              <iframe
                title="Google Map"
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm font-semibold">Quick actions</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={busy}
                className={clsx(
                  "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-60",
                  favorited
                    ? "border-red-500/40 bg-red-500/10 text-red-600"
                    : "border-[var(--border)]",
                )}
                onClick={() => void toggle(`/listings/${property._id}?action=favorite`)}
              >
                <Heart
                  size={16}
                  className={favorited ? "fill-red-500 text-red-500" : ""}
                />
                {favoriteLoading ? "Updating..." : favorited ? "Saved" : "Save favorite"}
              </button>
              <Link
                href={bookHref}
                onClick={rememberScroll}
                className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Book visit
              </Link>
              <a
                href={`https://wa.me/8801700000000?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
            {message ? <p className="mt-3 text-sm text-[var(--accent)]">{message}</p> : null}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="relative aspect-[4/3]">
              <Image src={agent.image} alt={agent.name} fill className="object-cover" sizes="400px" />
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold">Agent information</p>
              <p className="mt-2 font-semibold">{agent.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {agent.role} · {agent.experience} · ★ {agent.rating}
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                <Phone size={14} /> Contact agent
              </Link>
            </div>
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
            <h2 className="text-lg font-semibold">Send inquiry</h2>
            <input
              className={field}
              placeholder="Full name"
              required
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            />
            <input
              className={field}
              placeholder="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <input
              className={field}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <textarea
              className={field}
              rows={3}
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Send inquiry
            </button>
          </form>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl font-semibold">Similar properties</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <PublicPropertyCard key={item._id} property={item} badge="Similar" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
