"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import clsx from "clsx";
import { Mic, Paperclip, Send } from "lucide-react";
import {
  chatWithAgent,
  clearChatHistory,
  getChatHistory,
  publicChatWithAgent,
  saveChatHistory,
} from "@/services/ai.service";
import { AiMatchCard } from "@/components/public/ai-match-card";
import { useSession } from "@/lib/auth-client";
import {
  loadGuestChat,
  saveGuestChat,
  type StoredChatState,
} from "@/lib/ai-chat-storage";
import type { ChatAgentResponse, MatchPropertyResult } from "@/types/ai";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  at: string;
  matches?: MatchPropertyResult[];
  mode?: ChatAgentResponse["mode"];
};

const DEFAULT_CHIPS = [
  "🏠 Find Property",
  "📅 Book Visit",
  "❤️ Favorites",
  "📞 Contact Agent",
];

const CHIP_MAP: Record<string, string> = {
  "🏠 Find Property": "Find apartments in Uttara under 80 lakh",
  "🏠 New search": "Find apartments in Uttara under 80 lakh",
  "❤️ Favorites": "Show my favorites",
  "📞 Contact Agent": "Who is the listing agent?",
};

function formatStamp(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export type PropertyAiChatProps = {
  /** studio = AI Studio (auth API); widget = public floating (public API) */
  variant?: "studio" | "widget";
  className?: string;
  onError?: (message: string | null) => void;
  showFocusProperty?: boolean;
  propertyId?: string;
  persist?: boolean;
};

export function PropertyAiChat({
  variant = "widget",
  className,
  onError,
  showFocusProperty = false,
  propertyId: focusPropertyId,
  persist = true,
}: PropertyAiChatProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_CHIPS);
  const [lastShownPropertyIds, setLastShownPropertyIds] = useState<string[]>(
    [],
  );
  const [bookVisitUrl, setBookVisitUrl] = useState<string | undefined>();
  const [history, setHistory] = useState<ChatTurn[]>([]);

  const persistState = useCallback(
    async (state: StoredChatState) => {
      if (!persist) return;
      if (isLoggedIn) {
        try {
          await saveChatHistory({
            messages: state.messages.map(({ role, content, at, matches }) => ({
              role,
              content,
              at,
              matches,
            })),
            lastShownPropertyIds: state.lastShownPropertyIds,
            quickReplies: state.quickReplies,
          });
        } catch {
          saveGuestChat(state);
        }
      } else {
        saveGuestChat(state);
      }
    },
    [isLoggedIn, persist],
  );

  useEffect(() => {
    let active = true;
    async function hydrate() {
      if (!persist) {
        if (active) setHydrated(true);
        return;
      }
      try {
        if (isLoggedIn) {
          const remote = await getChatHistory();
          if (!active) return;
          if (remote.messages?.length) {
            setHistory(
              remote.messages.map((m) => ({
                role: m.role,
                content: m.content,
                at:
                  typeof m.at === "string"
                    ? m.at
                    : m.at
                      ? new Date(m.at).toISOString()
                      : new Date().toISOString(),
                matches: (m.matches || undefined) as
                  | MatchPropertyResult[]
                  | undefined,
              })),
            );
            setLastShownPropertyIds(remote.lastShownPropertyIds || []);
            if (remote.quickReplies?.length) {
              setQuickReplies(remote.quickReplies);
            }
          } else {
            const guest = loadGuestChat();
            if (guest?.messages?.length) {
              setHistory(guest.messages as ChatTurn[]);
              setLastShownPropertyIds(guest.lastShownPropertyIds || []);
              setQuickReplies(guest.quickReplies || DEFAULT_CHIPS);
              void persistState(guest);
            }
          }
        } else {
          const guest = loadGuestChat();
          if (guest?.messages?.length) {
            setHistory(guest.messages as ChatTurn[]);
            setLastShownPropertyIds(guest.lastShownPropertyIds || []);
            setQuickReplies(guest.quickReplies || DEFAULT_CHIPS);
          }
        }
      } catch {
        const guest = loadGuestChat();
        if (guest?.messages?.length && active) {
          setHistory(guest.messages as ChatTurn[]);
          setLastShownPropertyIds(guest.lastShownPropertyIds || []);
        }
      } finally {
        if (active) setHydrated(true);
      }
    }
    void hydrate();
    return () => {
      active = false;
    };
  }, [isLoggedIn, persist, persistState]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const at = new Date().toISOString();
    const nextHistory: ChatTurn[] = [
      ...history,
      { role: "user", content: trimmed, at },
    ];
    setHistory(nextHistory);
    setMessage("");
    setLoading(true);
    setBookVisitUrl(undefined);
    onError?.(null);

    try {
      const api =
        variant === "studio" && isLoggedIn
          ? chatWithAgent
          : publicChatWithAgent;

      const data = await api({
        message: trimmed,
        propertyId: focusPropertyId || undefined,
        history: nextHistory.slice(0, -1).map(({ role, content }) => ({
          role,
          content,
        })),
        lastShownPropertyIds,
      });

      setNotice(data.notice);
      const ids = data.lastShownPropertyIds || [];
      if (data.lastShownPropertyIds) setLastShownPropertyIds(ids);
      const chips = data.quickReplies?.length
        ? data.quickReplies
        : DEFAULT_CHIPS;
      if (data.quickReplies?.length) setQuickReplies(chips);
      if (data.bookVisitUrl) setBookVisitUrl(data.bookVisitUrl);

      const assistantTurn: ChatTurn = {
        role: "assistant",
        content: data.reply,
        at: new Date().toISOString(),
        matches: data.matches,
        mode: data.mode,
      };
      const finalHistory = [...nextHistory, assistantTurn];
      setHistory(finalHistory);
      await persistState({
        messages: finalHistory,
        lastShownPropertyIds: ids.length ? ids : lastShownPropertyIds,
        quickReplies: chips,
      });
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    setHistory([]);
    setNotice(undefined);
    setLastShownPropertyIds([]);
    setBookVisitUrl(undefined);
    setQuickReplies(DEFAULT_CHIPS);
    const empty = {
      messages: [] as ChatTurn[],
      lastShownPropertyIds: [] as string[],
      quickReplies: DEFAULT_CHIPS,
    };
    saveGuestChat(empty);
    if (isLoggedIn) {
      try {
        await clearChatHistory();
      } catch {
        /* ignore */
      }
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(message);
  }

  // Attach / voice placeholders only
  void showFocusProperty;

  return (
    <div className={clsx("flex h-full min-h-0 flex-col", className)}>
      {notice ? (
        <p className="mb-2 shrink-0 rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-2 text-xs">
          {notice}
        </p>
      ) : null}

      <div className="mb-2 flex flex-wrap gap-1.5">
        {quickReplies.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={loading || !hydrated}
            onClick={() => {
              const mapped =
                chip === "📅 Book Visit"
                  ? lastShownPropertyIds.length
                    ? "Book visit for 1"
                    : "How does booking work?"
                  : CHIP_MAP[chip] || chip;
              void sendMessage(mapped);
            }}
            className="rounded-xl border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--accent-soft)] disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
        {history.length > 0 ? (
          <button
            type="button"
            onClick={() => void clearChat()}
            className="rounded-xl border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)]"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
      >
        {!hydrated ? (
          <p className="text-sm text-[var(--muted)]">Loading chat…</p>
        ) : null}
        {hydrated && history.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Say hi, search by area/budget, ask for details, or book a visit.
            Property cards appear when you search.
          </p>
        ) : null}
        {history.map((item, index) => (
          <div key={`${item.role}-${index}-${item.at}`}>
            <div
              className={clsx(
                "rounded-xl px-3 py-2 text-sm",
                item.role === "user"
                  ? "ml-6 bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "mr-4 bg-[var(--card)]",
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  {item.role === "user" ? "You" : "Assistant"}
                </p>
                <p className="text-[10px] text-[var(--muted)]">
                  {formatStamp(item.at)}
                </p>
              </div>
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
            {item.role === "assistant" && item.matches?.length ? (
              <div className="mt-2 grid gap-2">
                {item.matches.slice(0, 3).map((match) => (
                  <AiMatchCard
                    key={match.propertyId}
                    item={match}
                    mode={item.mode === "fallback" ? "fallback" : "live"}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {loading ? (
          <div className="mr-4 rounded-xl bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)]">
            <span className="inline-flex gap-1">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse [animation-delay:120ms]">●</span>
              <span className="animate-pulse [animation-delay:240ms]">●</span>
            </span>
            <span className="ml-2">Assistant is typing…</span>
          </div>
        ) : null}
      </div>

      {bookVisitUrl ? (
        <div className="mt-2 shrink-0">
          <Link
            href={bookVisitUrl}
            className="inline-flex rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            Book Visit
          </Link>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-2 flex shrink-0 items-end gap-1.5">
        <button
          type="button"
          disabled
          title="Coming soon"
          className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] opacity-50"
          aria-label="Attach file (coming soon)"
        >
          <Paperclip size={16} />
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] opacity-50"
          aria-label="Voice input (coming soon)"
        >
          <Mic size={16} />
        </button>
        <input
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          placeholder="Ask me anything about properties..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading || !hydrated}
        />
        <button
          type="submit"
          disabled={loading || !message.trim() || !hydrated}
          className="inline-flex rounded-xl bg-[var(--accent)] p-2.5 text-white hover:opacity-90 disabled:opacity-60"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
