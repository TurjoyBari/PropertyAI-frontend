"use client";

import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hydrate: () => void;
};

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (theme) => {
    applyTheme(theme);
    localStorage.setItem("propertyai-theme", theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    get().setTheme(next);
  },
  hydrate: () => {
    const saved = localStorage.getItem("propertyai-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme: Theme =
      saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";
    applyTheme(theme);
    set({ theme });
  },
}));
