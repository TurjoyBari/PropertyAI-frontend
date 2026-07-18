import type { DashboardNotification } from "@/types/dashboard";

export function NotificationsPanel({
  items,
}: {
  items: DashboardNotification[];
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="text-base font-semibold">Notifications</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Recent system updates</p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
          <p className="text-sm font-medium">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Notifications will appear when properties and leads become active.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[var(--border)] px-3 py-3"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
