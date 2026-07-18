"use client";

import { useEffect, type ReactNode } from "react";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { useThemeStore } from "@/store/theme-store";

/** Hydrates theme preference on every surface (public + dashboards). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
}
