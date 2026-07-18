"use client";

import { create } from "zustand";

type ToastItem = {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
};

type ToastState = {
  items: ToastItem[];
  push: (message: string, tone?: ToastItem["tone"]) => void;
  dismiss: (id: number) => void;
};

let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, tone = "success") => {
    const id = ++seq;
    set((state) => ({ items: [...state.items, { id, message, tone }] }));
    window.setTimeout(() => {
      set((state) => ({ items: state.items.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((t) => t.id !== id) })),
}));

export function toast(message: string, tone?: ToastItem["tone"]) {
  useToastStore.getState().push(message, tone);
}
