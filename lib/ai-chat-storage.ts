export type StoredChatState = {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    at: string;
    matches?: unknown[];
    mode?: string;
  }>;
  lastShownPropertyIds: string[];
  quickReplies: string[];
};

const STORAGE_KEY = "propertyai.public.chat.v1";

export function loadGuestChat(): StoredChatState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChatState;
    if (!Array.isArray(parsed?.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGuestChat(state: StoredChatState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        messages: (state.messages || []).slice(-40),
        lastShownPropertyIds: state.lastShownPropertyIds || [],
        quickReplies: state.quickReplies || [],
      }),
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearGuestChat() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
