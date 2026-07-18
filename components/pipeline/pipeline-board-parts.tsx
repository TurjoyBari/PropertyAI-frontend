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
        "flex min-h-[28rem] w-72 shrink-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)]",
        isOver && "ring-2 ring-[var(--accent)]",
      )}
    >
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold">{STATUS_LABELS[status]}</h2>
        <span className="rounded-lg bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
          {leads.length}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {leads.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-8 text-center text-xs text-[var(--muted)]">
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
        "rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-sm",
        isDragging && "opacity-60 ring-2 ring-[var(--accent)]",
      )}
    >
      <button
        type="button"
        className="w-full cursor-grab text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <p className="text-sm font-semibold">{lead.fullName}</p>
        <p className="mt-1 truncate text-xs text-[var(--muted)]">{lead.email}</p>
        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-[var(--muted)]">
          <span className="capitalize">{lead.temperature}</span>
          <span>{lead.source.replaceAll("_", " ")}</span>
        </div>
      </button>
      <Link
        href={`/leads/${lead._id}`}
        className="mt-3 inline-flex text-xs font-medium text-[var(--accent)] hover:underline"
      >
        Open details
      </Link>
    </article>
  );
}

export { LEAD_STATUSES, STATUS_LABELS };
