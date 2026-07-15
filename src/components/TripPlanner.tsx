"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sendConciergeChat, type ConciergeHotel, type ConciergeMessage } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";

interface Recommendation {
  id: number;
  reason: string;
}

interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  recommendations: Recommendation[];
}

function parseRecommendations(text: string): { text: string; recommendations: Recommendation[] } {
  const match = text.match(/RECOMMENDATIONS:\s*(\[[\s\S]*?\])/i);
  if (!match) return { text, recommendations: [] };
  try {
    const recommendations = JSON.parse(match[1]);
    const cleanText = text.replace(/RECOMMENDATIONS:\s*\[[\s\S]*?\]/i, "").trim();
    return { text: cleanText, recommendations };
  } catch {
    return { text, recommendations: [] };
  }
}

function HotelCard({ hotel, reason }: { hotel?: ConciergeHotel; reason: string }) {
  if (!hotel) return null;
  const image = toAbsoluteImageUrl(hotel.image_url) ?? toAbsoluteImageUrl(hotel.image);

  return (
    <Link
      href={`/hotels/${hotel.slug ?? hotel.id}`}
      className="block group mt-2 rounded-xl overflow-hidden border border-secondary/15 hover:border-secondary/40 transition-all bg-surface-container-high"
    >
      <div className="relative h-28 overflow-hidden bg-surface-container-highest">
        {image ? (
          <img src={image} alt={hotel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🏨</div>
        )}
        <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-full text-secondary">
          AED {hotel.price}/night
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-on-surface text-sm leading-tight">{hotel.title}</p>
        <p className="text-on-surface-variant text-xs mt-0.5">{hotel.location}</p>
        <p className="text-on-surface-variant text-xs mt-1.5 italic leading-relaxed">&quot;{reason}&quot;</p>
        <span className="text-xs text-secondary font-medium group-hover:underline block mt-2">View hotel →</span>
      </div>
    </Link>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

const QUICK_PROMPTS = [
  "Romantic weekend for 2",
  "Family trip, 4 guests",
  "Business trip, budget AED 500",
  "Luxury suite with pool",
];

export default function TripPlanner() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [hotelsCache, setHotelsCache] = useState<ConciergeHotel[]>([]);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm your Dubai hotel concierge ✨\n\nTell me about your ideal stay — budget, dates, number of guests, or what kind of experience you're looking for.",
          recommendations: [],
        },
      ]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatEntry = { role: "user", content: text, recommendations: [] };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history: ConciergeMessage[] = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const { content: raw, hotels } = await sendConciergeChat(history);
      setHotelsCache(hotels);
      const { text: cleanText, recommendations } = parseRecommendations(raw);

      setMessages((prev) => [...prev, { role: "assistant", content: cleanText, recommendations }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
          recommendations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    setMessages([]);
    setOpen(false);
    setTimeout(() => setOpen(true), 50);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-8 z-[100] flex flex-col items-end gap-2">
        {pulse && !open && (
          <div className="bg-surface-container-high text-on-surface text-xs px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap border border-secondary/20 font-label-caps">
            AI TRIP PLANNER
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative w-16 h-16 bg-secondary text-on-secondary rounded-full shadow-[0px_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
          aria-label="Open AI Trip Planner"
        >
          <span className={`material-symbols-outlined text-2xl transition-transform ${open ? "" : "group-hover:rotate-12"}`}>
            {open ? "close" : "smart_toy"}
          </span>
          {pulse && !open && <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-30" />}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-28 right-8 z-[100] w-80 sm:w-96 bg-surface-container-high rounded-2xl shadow-2xl border border-secondary/15 flex flex-col overflow-hidden"
          style={{ maxHeight: "75vh" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary text-[18px]">auto_awesome</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">AI Concierge</p>
                <p className="text-xs text-on-surface-variant">
                  Lumina Dubai
                  {hotelsCache.length > 0 && <span className="ml-1 text-emerald-400">· {hotelsCache.length} hotels</span>}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-xs text-on-surface-variant hover:text-secondary transition px-2 py-1 rounded-lg hover:bg-secondary/5"
            >
              New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-secondary text-on-secondary rounded-br-sm"
                        : "bg-surface-container-highest text-on-surface rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.recommendations.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.recommendations.map((rec) => {
                        const hotel = hotelsCache.find((h) => String(h.id) === String(rec.id));
                        return <HotelCard key={rec.id} hotel={hotel} reason={rec.reason} />;
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-container-highest rounded-2xl rounded-bl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                  className="text-xs bg-surface-container-highest hover:bg-secondary/10 text-on-surface-variant hover:text-secondary px-3 py-1.5 rounded-full transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="px-4 pb-4 pt-2 border-t border-secondary/10">
            <div className="flex items-end gap-2 bg-surface rounded-2xl px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Describe your perfect stay…"
                rows={1}
                className="flex-1 bg-transparent text-sm text-on-surface placeholder-on-surface-variant/50 resize-none outline-none leading-relaxed"
                style={{ maxHeight: "80px" }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-secondary text-on-secondary flex items-center justify-center hover:opacity-90 transition disabled:opacity-30 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
            <p className="text-center text-[10px] text-on-surface-variant/40 mt-2">Powered by AI</p>
          </div>
        </div>
      )}
    </>
  );
}