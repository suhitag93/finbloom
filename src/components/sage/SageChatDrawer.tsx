import { useState, useRef, useEffect, useCallback } from "react";
import { X, ArrowUp, Flower2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "sage" | "user";
  content: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  "Help me make a plan",
  "I'm feeling overwhelmed",
  "Celebrate my streak",
  "Check my goals",
];

const OPENING_MESSAGE: Message = {
  id: "welcome",
  role: "sage",
  content:
    "Morning. You've been showing up consistently — that matters. How are you feeling about money today?",
  timestamp: new Date(),
};

interface SageChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SageChatDrawer = ({ open, onClose }: SageChatDrawerProps) => {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 72) + "px";
    }
  }, [input]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const sageId = crypto.randomUUID();
    const sageMsg: Message = {
      id: sageId,
      role: "sage",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, sageMsg]);
    setInput("");
    setShowChips(false);
    setIsStreaming(true);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/sage-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ message: text.trim() }),
        }
      );

      if (!res.ok) {
        if (res.status === 429) {
          const body = await res.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === sageId
                ? { ...m, content: "We've had a good run today. Come back tomorrow and we'll keep going. 🌱" }
                : m
            )
          );
          setDailyLimitReached(true);
          setIsStreaming(false);
          return;
        }
        throw new Error("Chat request failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              fullContent += token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === sageId ? { ...m, content: fullContent } : m
                )
              );
            }
          } catch {
            // partial JSON
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === sageId
            ? {
                ...m,
                content:
                  "Something felt off on my end. Want to try again?",
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-3xl animate-sage-drawer-up"
        style={{ height: "86vh" }}
      >
        {/* Handle pill */}
        <div className="flex justify-center pt-3">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center px-4 py-3 gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#F0EBF7" }}>
            <Flower2 size={18} style={{ color: "#9B89B0" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-foreground leading-tight">Sage</p>
            <p className="text-[11px] leading-tight" style={{ color: "#9B89B0" }}>
              Your financial companion
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 flex flex-col gap-3 scrollbar-hide">
          {/* Session timestamp */}
          <p className="text-center text-[10px] text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-2"}`}
            >
              {msg.role === "sage" && (
                <div
                  className="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 mt-1"
                  style={{ background: "#F0EBF7" }}
                >
                  <Flower2 size={13} style={{ color: "#9B89B0" }} />
                </div>
              )}
              <div
                className="max-w-[80%] px-3.5 py-2.5 text-[14px] leading-[1.45]"
                style={
                  msg.role === "sage"
                    ? {
                        background: "#EAF2EB",
                        color: "#2D4A32",
                        borderRadius: "4px 18px 18px 18px",
                      }
                    : {
                        background: "#7A9E7E",
                        color: "#fff",
                        borderRadius: "18px 18px 4px 18px",
                      }
                }
              >
                {msg.content}
                {msg.role === "sage" && isStreaming && msg === messages[messages.length - 1] && (
                  <span className="sage-cursor">▋</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick-reply chips */}
        {showChips && (
          <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
            {QUICK_REPLIES.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-colors"
                style={{
                  border: "1px solid #C4B5D4",
                  background: "#F9F6FC",
                  color: "#6B5B8B",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div
          className="flex items-end gap-2 px-4 pb-4 pt-2"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Sage..."
            rows={1}
            className="flex-1 resize-none rounded-full bg-gray-50 px-4 py-2 text-sm outline-none transition-colors"
            style={{
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: input ? "#9B89B0" : "#e5e7eb",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "#9B89B0" }}
          >
            <ArrowUp size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SageChatDrawer;
