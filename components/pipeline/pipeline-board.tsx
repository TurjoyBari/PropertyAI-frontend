"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { listLeads, updateLead } from "@/services/leads.service";
import {
  PipelineColumn,
  LEAD_STATUSES,
  STATUS_LABELS,
} from "@/components/pipeline/pipeline-board-parts";
import type { Lead, LeadStatus } from "@/types/lead";

function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

export function PipelineBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    listLeads({ limit: 100, page: 1 })
      .then((data) => {
        if (!active) return;
        setLeads(data.items);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load pipeline");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(
      LEAD_STATUSES.map((status) => [status, [] as Lead[]]),
    ) as Record<LeadStatus, Lead[]>;

    leads.forEach((lead) => {
      map[lead.status]?.push(lead);
    });
    return map;
  }, [leads]);

  const onDragStart = (event: DragStartEvent) => {
    const lead = leads.find((item) => item._id === String(event.active.id));
    setActiveLead(lead ?? null);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const leadId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId) return;

    const lead = leads.find((item) => item._id === leadId);
    if (!lead) return;

    // Dropped on a column, or on another card (use that card's status).
    let nextStatus: LeadStatus | null = null;
    if (isLeadStatus(overId)) {
      nextStatus = overId;
    } else {
      const overLead = leads.find((item) => item._id === overId);
      nextStatus = overLead?.status ?? null;
    }

    if (!nextStatus || nextStatus === lead.status) return;

    const previous = leads;
    setLeads((current) =>
      current.map((item) =>
        item._id === leadId ? { ...item, status: nextStatus } : item,
      ),
    );
    setSavingId(leadId);

    try {
      const updated = await updateLead(leadId, { status: nextStatus });
      setLeads((current) =>
        current.map((item) => (item._id === leadId ? updated : item)),
      );
    } catch {
      setLeads(previous);
      setError("Could not update lead status. Try again.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => (
          <div key={status} className="h-[28rem] w-72 shrink-0 animate-pulse rounded-2xl bg-[var(--border)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sales Pipeline</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Drag leads across stages. Changes save instantly.
          </p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Add lead
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {savingId ? (
        <p className="text-xs text-[var(--muted)]">Saving status update...</p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STATUSES.map((status) => (
            <PipelineColumn key={status} status={status} leads={grouped[status]} />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg">
              <p className="text-sm font-semibold">{activeLead.fullName}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Moving to {STATUS_LABELS[activeLead.status]}...
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
