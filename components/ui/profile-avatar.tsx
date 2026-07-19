"use client";

import { useState } from "react";
import clsx from "clsx";

type ProfileAvatarProps = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  className?: string;
  /** Tailwind size classes for the container, e.g. "h-8 w-8 text-xs" */
  sizeClassName?: string;
  roundedClassName?: string;
  alt?: string;
};

function initialsFrom(name?: string | null, email?: string | null) {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/**
 * Avatar that works with Google profile URLs.
 * Google user-content CDN often blocks hotlinks without referrerPolicy=no-referrer.
 */
export function ProfileAvatar({
  src,
  name,
  email,
  className,
  sizeClassName = "h-9 w-9 text-sm",
  roundedClassName = "rounded-full",
  alt,
}: ProfileAvatarProps) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src!}
        alt={alt || name || "Profile"}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={clsx(
          sizeClassName,
          roundedClassName,
          "object-cover",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={clsx(
        sizeClassName,
        roundedClassName,
        "inline-flex items-center justify-center bg-[var(--accent-soft)] font-semibold text-[var(--accent)]",
        className,
      )}
      aria-hidden
    >
      {initialsFrom(name, email)}
    </span>
  );
}
