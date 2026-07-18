"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bot,
  Building2,
  CalendarCheck2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AiPropertyFinder } from "@/components/public/ai-property-finder";
import { PublicPropertyCard } from "@/components/public/public-property-card";
import {
  AGENTS,
  BLOG_POSTS,
  CATEGORIES,
  HOME_IMAGES,
  POPULAR_LOCATIONS,
  REVIEWS,
} from "@/lib/home-content";
import { publicFaq, publicListProperties } from "@/services/public.service";
import { PROPERTY_TYPES, type Property } from "@/types/property";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function HomePageView() {
  const router = useRouter();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [latest, setLatest] = useState<Property[]>([]);
  const [faq, setFaq] = useState<Array<{ q: string; a: string }>>([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [search, setSearch] = useState({
    intent: "buy",
    location: "",
    type: "",
    budgetMax: "",
    bedrooms: "",
  });

  useEffect(() => {
    publicListProperties({ limit: 24, status: "available" })
      .then((data) => {
        setFeatured(data.items.slice(0, 8));
        setLatest(data.items.slice(0, 6));
      })
      .catch(() => {
        setFeatured([]);
        setLatest([]);
      });
    publicFaq()
      .then((data) => setFaq(data.items))
      .catch(() => setFaq([]));
  }, []);

  const collections = useMemo(() => {
    const luxury = [...featured].sort((a, b) => b.price - a.price).slice(0, 4);
    const investment = featured
      .filter((p) => p.type === "commercial" || p.type === "land")
      .slice(0, 4);
    const trending = featured.slice(0, 4);
    const recent = latest.slice(0, 4);
    return { luxury, investment, trending, recent };
  }, [featured, latest]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.intent) params.set("intent", search.intent);
    if (search.location) params.set("area", search.location);
    if (search.type) params.set("type", search.type);
    if (search.budgetMax) params.set("maxPrice", search.budgetMax);
    if (search.bedrooms) params.set("bedrooms", search.bedrooms);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div>
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <Image
          src={HOME_IMAGES.hero}
          alt="Modern home exterior"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,18,15,0.78)_0%,rgba(8,18,15,0.45)_55%,rgba(8,18,15,0.25)_100%)]" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 lg:px-6 lg:pb-20">
          <p className="animate-fade font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            PropertyAI
          </p>
          <h1 className="animate-rise mt-4 max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Find Your Dream Property with AI
          </h1>
          <p
            className="animate-rise mt-4 max-w-xl text-base text-white/85 sm:text-lg"
            style={{ animationDelay: "80ms" }}
          >
            Search thousands of verified properties using AI-powered recommendations.
          </p>
          <div
            className="animate-rise mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "140ms" }}
          >
            <Link
              href="/listings"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Browse Properties
            </Link>
            <Link
              href="/finder"
              className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              AI Property Finder
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 lg:px-6">
        <form
          onSubmit={onSearch}
          className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] md:grid-cols-6"
        >
          <select
            className={field}
            value={search.intent}
            onChange={(e) => setSearch((s) => ({ ...s, intent: e.target.value }))}
          >
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
          <input
            className={field}
            placeholder="Location (e.g. Uttara)"
            value={search.location}
            onChange={(e) => setSearch((s) => ({ ...s, location: e.target.value }))}
          />
          <select
            className={field}
            value={search.type}
            onChange={(e) => setSearch((s) => ({ ...s, type: e.target.value }))}
          >
            <option value="">Property type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className={field}
            type="number"
            placeholder="Budget max"
            value={search.budgetMax}
            onChange={(e) => setSearch((s) => ({ ...s, budgetMax: e.target.value }))}
          />
          <input
            className={field}
            type="number"
            placeholder="Bedrooms"
            value={search.bedrooms}
            onChange={(e) => setSearch((s) => ({ ...s, bedrooms: e.target.value }))}
          />
          <button
            type="submit"
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Search Property
          </button>
        </form>
      </section>

      <div id="home-listings" className="scroll-mt-24">
        <Section
          title="Featured Properties"
          subtitle="Hand-picked homes ready for your next visit."
          actionHref="/listings"
          actionLabel="View all"
        >
          <PropertyGrid
            items={featured}
            badge="Featured"
            empty="Add available properties to see featured cards."
          />
        </Section>

        <Section title="Trending Properties" subtitle="What buyers are exploring right now.">
          <PropertyGrid items={collections.trending} badge="Trending" />
        </Section>
        <Section title="Recently Added" subtitle="Fresh listings from our agents.">
          <PropertyGrid items={collections.recent} badge="New" />
        </Section>
        <Section title="Luxury Collection" subtitle="Premium homes and high-end addresses.">
          <PropertyGrid items={collections.luxury} badge="Luxury" />
        </Section>
        <Section title="Investment Opportunities" subtitle="Commercial and land options for growth.">
          <PropertyGrid
            items={
              collections.investment.length ? collections.investment : collections.trending
            }
            badge="Invest"
          />
        </Section>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium text-[var(--accent)]">AI Property Finder</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Tell us what you need. We rank the best matches.
          </h2>
        </div>
        <AiPropertyFinder compact />
      </section>

      <Section
        title="Popular Locations"
        subtitle="Browse verified homes by neighborhood — opens filtered listings."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_LOCATIONS.map((loc) => (
            <Link
              key={loc.name}
              href={`/listings?area=${encodeURIComponent(loc.name)}`}
              className="group relative overflow-hidden rounded-2xl transition hover:opacity-95"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={loc.image}
                  alt={loc.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-display text-xl font-semibold">{loc.name}</p>
                  <p className="text-sm text-white/80">{loc.count}+ properties</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Property Categories" subtitle="Jump straight into the type you want.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={`/listings?type=${cat.type}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-6 transition hover:border-[var(--accent)]"
            >
              <p className="font-display text-xl font-semibold">{cat.label}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Browse {cat.label.toLowerCase()} listings
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Latest Properties"
        subtitle="Newly listed homes from our network."
        actionHref="/listings"
        actionLabel="See more"
      >
        <PropertyGrid items={latest} badge="Latest" />
      </Section>

      <Section title="Why Choose Us" subtitle="Built for trust, speed, and smarter decisions.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: BadgeCheck, label: "Verified Property" },
            { icon: Bot, label: "AI Recommendation" },
            { icon: Users, label: "Trusted Agents" },
            { icon: ShieldCheck, label: "Secure Process" },
            { icon: CalendarCheck2, label: "Easy Booking" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-center transition hover:border-[var(--accent)]"
            >
              <item.icon className="mx-auto text-[var(--accent)]" size={22} />
              <p className="mt-3 text-sm font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="border-y border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          {[
            ["10,000+", "Properties"],
            ["5,000+", "Customers"],
            ["500+", "Agents"],
            ["30+", "Cities"],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="font-display text-3xl font-semibold text-[var(--accent)]">{value}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <Section title="Customer Reviews" subtitle="Real stories from buyers and renters.">
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <blockquote
              key={review.name}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                &ldquo;{review.text}&rdquo;
              </p>
              <footer className="mt-4 text-sm font-semibold">{review.name}</footer>
            </blockquote>
          ))}
        </div>
      </Section>

      <Section
        title="Our Agents"
        subtitle="Top performers ready to guide your next move."
        actionHref="/agents"
        actionLabel="Meet all"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {AGENTS.map((agent) => (
            <article
              key={agent.name}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]"
            >
              <div className="relative aspect-[4/3]">
                <Image src={agent.image} alt={agent.name} fill className="object-cover" sizes="33vw" />
              </div>
              <div className="p-4">
                <p className="font-semibold">{agent.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {agent.role} · {agent.experience}
                </p>
                <p className="mt-2 text-sm text-[var(--accent)]">★ {agent.rating}</p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Contact
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Blog" subtitle="Guides, market notes, and AI tips." actionHref="/blog" actionLabel="Read more">
        <div className="grid gap-4 md:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.title}
              href={post.href}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--accent)]"
            >
              <p className="text-xs uppercase tracking-wide text-[var(--accent)]">{post.tag}</p>
              <p className="mt-3 font-semibold">{post.title}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="FAQ" subtitle="Quick answers before you dive in.">
        <div className="mx-auto max-w-3xl space-y-2">
          {faq.map((item, index) => (
            <div key={item.q} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
                onClick={() => setOpenFaq(index)}
              >
                {item.q}
                <span className="text-[var(--muted)]">{openFaq === index ? "−" : "+"}</span>
              </button>
              {openFaq === index ? (
                <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
                  {item.a}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-6">
        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_55%),var(--card)] px-6 py-14 text-center sm:px-10">
          <Building2 className="mx-auto text-[var(--accent)]" />
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Ready to Find Your Dream Property?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">
            Browse verified listings, get AI matches, book a visit, or message an agent on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/listings"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              Browse Property
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  actionHref,
  actionLabel,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="text-sm font-medium text-[var(--accent)] hover:underline">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function PropertyGrid({
  items,
  badge,
  empty,
}: {
  items: Property[];
  badge?: string;
  empty?: string;
}) {
  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
        {empty || "Properties will appear here once listings are available."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((property) => (
        <PublicPropertyCard key={property._id + (badge || "")} property={property} badge={badge} />
      ))}
    </div>
  );
}
