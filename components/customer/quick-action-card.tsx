"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cardHover } from "@/components/customer/page-transition";

export function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  accent,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: string;
}) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <Link
        href={href}
        className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_8px_30px_rgba(20,32,28,0.04)] transition hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border))]"
      >
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background:
              accent ||
              "color-mix(in oklab, var(--accent) 14%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Icon size={20} />
        </span>
        <p className="mt-4 text-base font-semibold tracking-tight">{title}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </Link>
    </motion.div>
  );
}
