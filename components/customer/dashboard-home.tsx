"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Heart,
  Home,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { propertyImage } from "@/lib/home-content";
import { getRecentlyViewed, type RecentProperty } from "@/lib/recently-viewed";
import { listFavorites } from "@/services/favorites.service";
import { listVisits } from "@/services/visits.service";
import { listMessages } from "@/services/messages.service";
import { listNotifications } from "@/services/notifications.service";
import { publicMatchProperties, publicListProperties } from "@/services/public.service";
import { CustomerPropertyCard } from "@/components/customer/customer-property-card";
import { QuickActionCard } from "@/components/customer/quick-action-card";
import { PageTransition } from "@/components/customer/page-transition";
import { PropertyCardSkeleton, Skeleton } from "@/components/customer/skeleton";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import {
  VISIT_STATUS_LABELS,
  type Visit,
  visitPropertyAddress,
  visitPropertyTitle,
} from "@/types/visit";
import type { FavoriteItem } from "@/services/favorites.service";
import type { AppNotification } from "@/types/notification";
import type { MatchPropertyResult } from "@/types/ai";
import type { Property } from "@/types/property";

function StatChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-xs text-white/75">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

export function CustomerDashboardHome() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [recommendations, setRecommendations] = useState<MatchPropertyResult[]>([]);
  const [browseFallback, setBrowseFallback] = useState<Property[]>([]);
  const [recent, setRecent] = useState<RecentProperty[]>([]);

  useEffect(() => {
    setRecent(getRecentlyViewed());
  }, []);

  useEffect(() => {
    let active = true;
    const userId = session?.user?.id;

    Promise.allSettled([
      listFavorites(),
      listVisits({ limit: 20 }),
      listMessages(),
      listNotifications(),
      publicMatchProperties({
        budgetMax: 15_000_000,
        location: "Dhaka",
        bedrooms: 3,
        notes: "Customer dashboard recommendations",
      }),
      publicListProperties({ status: "available", limit: 6 }),
    ]).then((results) => {
      if (!active) return;

      const fav = results[0].status === "fulfilled" ? results[0].value.items : [];
      const visitItems = results[1].status === "fulfilled" ? results[1].value.items : [];
      const messages = results[2].status === "fulfilled" ? results[2].value : [];
      const notes = results[3].status === "fulfilled" ? results[3].value : [];
      const match = results[4].status === "fulfilled" ? results[4].value : null;
      const listed = results[5].status === "fulfilled" ? results[5].value.items : [];

      setFavorites(fav);
      setVisits(visitItems);
      setUnreadMessages(
        messages.filter((m) => !m.isRead && m.toUserId === userId).length,
      );
      setNotifications(notes.slice(0, 5));
      setRecommendations((match?.matches || []).slice(0, 6));
      setBrowseFallback(listed);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const upcomingVisits = useMemo(
    () =>
      visits
        .filter((v) => v.status === "scheduled")
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        )
        .slice(0, 3),
    [visits],
  );

  const unreadNotes = notifications.filter((n) => n.status !== "read").length;
  const name = session?.user?.name || "there";
  const image =
    (session?.user as { image?: string } | undefined)?.image || undefined;

  return (
    <PageTransition>
      <div className="space-y-10">
        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#134e4a] p-6 text-white shadow-[var(--shadow)] sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/30 bg-white/15 shadow-lg">
                <ProfileAvatar
                  src={image}
                  name={name}
                  email={session?.user?.email}
                  sizeClassName="h-full w-full text-xl"
                  roundedClassName="rounded-2xl"
                  className="bg-transparent text-white"
                />
              </div>
              <div>
                <p className="text-sm text-white/80">Welcome back</p>
                <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {name}
                </h1>
                <p className="mt-1 text-sm text-white/75">
                  Your home search, visits, and AI picks — in one place.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[28rem]">
              {loading ? (
                <>
                  <Skeleton className="h-20 bg-white/15" />
                  <Skeleton className="h-20 bg-white/15" />
                  <Skeleton className="h-20 bg-white/15" />
                  <Skeleton className="h-20 bg-white/15" />
                </>
              ) : (
                <>
                  <StatChip label="Saved" value={favorites.length} icon={Heart} />
                  <StatChip
                    label="Upcoming"
                    value={upcomingVisits.length}
                    icon={CalendarDays}
                  />
                  <StatChip
                    label="Messages"
                    value={unreadMessages}
                    icon={MessageSquare}
                  />
                  <StatChip
                    label="AI picks"
                    value={recommendations.length || browseFallback.length}
                    icon={Sparkles}
                  />
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* Quick actions */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickActionCard
              href="/customer/favorites"
              icon={Heart}
              title="Saved Properties"
              description="Homes you liked and want to revisit"
            />
            <QuickActionCard
              href="/customer/visits/new"
              icon={CalendarDays}
              title="Book Visit"
              description="Schedule a tour for a listing you love"
            />
            <QuickActionCard
              href="/customer/ai"
              icon={Sparkles}
              title="AI Property Finder"
              description="Match homes to budget and lifestyle"
            />
            <QuickActionCard
              href="/listings"
              icon={Home}
              title="Browse Properties"
              description="Explore verified listings across Dhaka"
            />
          </div>
        </section>

        {/* Continue browsing */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Continue browsing</h2>
            <Link href="/listings" className="text-sm font-medium text-[var(--accent)] hover:underline">
              Browse all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-5 py-8 text-sm text-[var(--muted)]">
              Recently viewed homes will appear here as you browse listings.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recent.slice(0, 4).map((item) => (
                <CustomerPropertyCard
                  key={item._id}
                  compact
                  property={{
                    _id: item._id,
                    title: item.title,
                    price: item.price,
                    currency: item.currency,
                    bedrooms: item.bedrooms ?? 0,
                    bathrooms: item.bathrooms ?? 0,
                    areaSqFt: item.areaSqFt,
                    images: item.image ? [item.image] : [],
                    location: { city: item.city, area: item.area },
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recommended */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Recommended for you</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                AI-ranked homes based on popular buyer criteria
              </p>
            </div>
            <Link href="/customer/ai" className="text-sm font-medium text-[var(--accent)] hover:underline">
              Open AI Finder
            </Link>
          </div>
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="min-w-[260px] max-w-[280px] flex-1">
                  <PropertyCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {(recommendations.length
                ? recommendations.map((m) => ({
                    _id: m.property._id,
                    title: m.property.title,
                    price: m.property.price,
                    currency: m.property.currency,
                    bedrooms: m.property.bedrooms,
                    bathrooms: m.property.bathrooms,
                    areaSqFt: m.property.areaSqFt,
                    images: m.property.images || [],
                    location: m.property.location,
                  }))
                : browseFallback
              ).map((property) => (
                <div key={property._id} className="min-w-[260px] max-w-[280px] flex-1">
                  <CustomerPropertyCard property={property} compact />
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Upcoming visits */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Upcoming visits</h2>
              <Link
                href="/customer/visits"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View all
              </Link>
            </div>
            {loading ? (
              <Skeleton className="h-40" />
            ) : upcomingVisits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-5 py-8 text-sm text-[var(--muted)]">
                No upcoming visits.{" "}
                <Link href="/listings" className="text-[var(--accent)] hover:underline">
                  Find a home
                </Link>{" "}
                and book a tour.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingVisits.map((visit) => {
                  const property =
                    typeof visit.property === "string" ? null : visit.property;
                  const when = new Date(visit.scheduledAt);
                  return (
                    <Link
                      key={visit._id}
                      href={`/customer/visits/${visit._id}`}
                      className="flex gap-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]"
                    >
                      <div className="relative hidden w-28 shrink-0 sm:block">
                        <Image
                          src={propertyImage(property ?? {})}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-center p-4">
                        <p className="font-semibold">{visitPropertyTitle(visit)}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {visitPropertyAddress(visit)}
                        </p>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {when.toLocaleDateString()} ·{" "}
                          {when.toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          · {VISIT_STATUS_LABELS[visit.status]}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Notifications preview */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Notifications</h2>
              <Link
                href="/customer/notifications"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2">
              {loading ? (
                <div className="space-y-2 p-3">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                  You&apos;re all caught up.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {notifications.map((note) => (
                    <li key={note._id} className="flex gap-3 px-3 py-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                        <Bell size={14} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{note.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">
                          {note.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {unreadNotes > 0 ? (
                <p className="border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)]">
                  {unreadNotes} unread
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {/* Favorites preview */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Favorite properties</h2>
            <Link
              href="/customer/favorites"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          ) : favorites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-5 py-8 text-sm text-[var(--muted)]">
              No saved homes yet. Tap the heart on any listing to save it here.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favorites.slice(0, 3).map((item) => (
                <CustomerPropertyCard key={item._id} property={item.property} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
