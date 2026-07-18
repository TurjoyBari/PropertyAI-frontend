import Image from "next/image";
import Link from "next/link";
import { AGENTS } from "@/lib/home-content";

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Our Agents</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Meet trusted PropertyAI agents who help buyers, renters, and investors across Dhaka.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {AGENTS.map((agent) => (
          <article
            key={agent.name}
            className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
          >
            <div className="relative aspect-[4/3]">
              <Image src={agent.image} alt={agent.name} fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-5">
              <p className="font-semibold">{agent.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {agent.role} · {agent.experience}
              </p>
              <p className="mt-2 text-sm text-[var(--accent)]">★ {agent.rating}</p>
              <Link
                href="/contact"
                className="mt-4 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Contact
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
