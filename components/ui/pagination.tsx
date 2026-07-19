"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationProps = {
  page: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
};

/** Build a compact page list with ellipses for large page counts. */
function pageItems(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | "…"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("…");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < totalPages - 1) items.push("…");
  items.push(totalPages);
  return items;
}

export function Pagination({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  disabled = false,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev =
    hasPreviousPage ?? page > 1;
  const canNext =
    hasNextPage ?? page < totalPages;
  const numbers = pageItems(page, totalPages);

  const btnBase =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-[var(--border)] px-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className={clsx("flex flex-wrap items-center justify-center gap-2", className)}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={!canPrev || disabled}
        onClick={() => onPageChange(page - 1)}
        className={btnBase}
      >
        <ChevronLeft className="h-4 w-4 sm:mr-1" aria-hidden />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Desktop: page numbers */}
      <div className="hidden items-center gap-1 sm:flex">
        {numbers.map((item, index) =>
          item === "…" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm text-[var(--muted)]"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              disabled={disabled}
              onClick={() => onPageChange(item)}
              className={clsx(
                btnBase,
                item === page &&
                  "border-[var(--accent)] bg-[var(--accent)] text-white",
              )}
            >
              {item}
            </button>
          ),
        )}
      </div>

      {/* Mobile: compact page indicator */}
      <span className="text-sm text-[var(--muted)] sm:hidden">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        aria-label="Next page"
        disabled={!canNext || disabled}
        onClick={() => onPageChange(page + 1)}
        className={btnBase}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4 sm:ml-1" aria-hidden />
      </button>
    </nav>
  );
}
