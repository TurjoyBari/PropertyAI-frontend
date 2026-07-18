"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import clsx from "clsx";
import type { Lead, LeadStatus } from "@/types/lead";
import { LEAD_STATUSES } from "@/types/lead";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  interested: "Interested",
  visit_scheduled: "Visit Scheduled",
  negotiation: "Negotiation",
  closed: "Closed",
};

export function PipelineColumn({
  status,
  leads,
}: {
  status: LeadStatus;
  leads: Lead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={clsx(
        "flex min-h-[18rem] min-w-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] xl:min-h-0 xl:h-full",
        isOver && "ring-2 ring-[var(--accent)]",
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5">
        <h2 className="truncate text-xs font-semibold sm:text-sm">
          {STATUS_LABELS[status]}
        </h2>
        <span className="shrink-0 rounded-lg bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
          {leads.length}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 sm:p-3">
        {leads.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] px-2 py-6 text-center text-xs text-[var(--muted)]">
            Drop leads here
          </p>
        ) : (
          leads.map((lead) => <PipelineCard key={lead._id} lead={lead} />)
        )}
      </div>
    </section>
  );
}

function PipelineCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead._id,
    data: { lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-xl border border-[var(--border)] bg-[var(--background)] p-2.5 shadow-sm",
        isDragging && "opacity-60 ring-2 ring-[var(--accent)]",
      )}
    >
      <button
        type="button"
        className="w-full cursor-grab text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <p className="truncate text-sm font-semibold">{lead.fullName}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{lead.email}</p>
        <div className="mt-2 flex items-center justify-between gap-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
          <span className="truncate capitalize">{lead.temperature}</span>
          <span className="truncate">{lead.source.replaceAll("_", " ")}</span>
        </div>
      </button>
      <Link
        href={`/leads/${lead._id}`}
        className="mt-2 inline-flex text-xs font-medium text-[var(--accent)] hover:underline"
      >
        Open
      </Link>
    </article>
  );
}

export { LEAD_STATUSES, STATUS_LABELS };
