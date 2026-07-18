"use client";

import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hydrate: () => void;
};

const STORAGE_KEY = "propertyai-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-animating");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.setTimeout(() => root.classList.remove("theme-animating"), 350);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (theme) => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    get().setTheme(next);
  },
  hydrate: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme: Theme =
      saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    set({ theme });
  },
}));
