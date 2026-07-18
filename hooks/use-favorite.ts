"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addFavorite,
  checkFavorite,
  removeFavorite,
} from "@/services/favorites.service";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/store/toast-store";

export function useFavorite(propertyId?: string) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    if (!propertyId || !session?.user) {
      setFavorited(false);
      setHydrated(true);
      return;
    }
    setHydrated(false);
    checkFavorite(propertyId)
      .then((data) => {
        if (!active) return;
        setFavorited(data.favorited);
      })
      .catch(() => {
        if (!active) return;
        setFavorited(false);
      })
      .finally(() => {
        if (!active) return;
        setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [propertyId, session?.user]);

  const requireAuth = useCallback(
    (returnPath: string) => {
      router.push(`/login?next=${encodeURIComponent(returnPath)}`);
    },
    [router],
  );

  const toggle = useCallback(
    async (returnPath?: string) => {
      if (!propertyId) return;
      if (!session?.user) {
        requireAuth(returnPath || `/listings/${propertyId}?action=favorite`);
        return;
      }

      const previous = favorited;
      setFavorited(!previous);
      setLoading(true);
      try {
        if (previous) {
          await removeFavorite(propertyId);
          toast("Property removed from your favorites.");
        } else {
          await addFavorite(propertyId);
          toast("Property added to your favorites.");
        }
      } catch (err) {
        setFavorited(previous);
        const message = err instanceof Error ? err.message : "Could not update favorite";
        if (/already/i.test(message) && !previous) {
          setFavorited(true);
          toast("Property added to your favorites.");
        } else {
          toast(message, "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [favorited, propertyId, requireAuth, session?.user],
  );

  const ready = hydrated && !isPending;

  return {
    favorited,
    loading,
    ready,
    busy: !ready || loading,
    isAuthenticated: Boolean(session?.user),
    toggle,
  };
}
