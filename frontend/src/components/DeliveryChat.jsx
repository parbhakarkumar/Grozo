import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, ChevronDown, Bike } from "lucide-react";

// ─────────────────────────────────────────────
// Quick reply chips for one-tap convenience
// ─────────────────────────────────────────────
const QUICK_REPLIES = [
  "Where are you?",
  "Please hurry",
  "I'm at the gate",
  "Call me when near",
  "Leave at door",
];

// ─────────────────────────────────────────────
// TypingIndicator — animated 3-dot bounce
// ─────────────────────────────────────────────
const TypingIndicator = ({ name }) => (
  <div className="flex items-end gap-2 mb-3 animate-fadeIn">
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 10,
        background: "linear-gradient(135deg, #164e63, #0e7490)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      🛵
    </div>
    <div
      style={{
        background: "#1e293b",
        borderRadius: "16px 16px 16px 4px",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 6, fontWeight: 600 }}>
        {name}
      </span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#06b6d4",
            display: "inline-block",
            animation: `chatBounce 1.2s infinite ${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// ChatBubble — individual message bubble
// ─────────────────────────────────────────────
const ChatBubble = ({ msg, isOwn }) => {
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="animate-fadeIn"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, maxWidth: "82%" }}>
        {!isOwn && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              background: "linear-gradient(135deg, #164e63, #0e7490)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            🛵
          </div>
        )}
        <div
          style={{
            background: isOwn
              ? "linear-gradient(135deg, #0891b2, #06b6d4)"
              : "#1e293b",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            fontSize: 13,
            lineHeight: 1.45,
            fontWeight: 500,
            boxShadow: isOwn
              ? "0 2px 8px rgba(6, 182, 212, 0.25)"
              : "0 2px 8px rgba(0,0,0,0.15)",
            wordBreak: "break-word",
          }}
        >
          {msg.message}
        </div>
      </div>
      <span
        style={{
          fontSize: 10,
          color: "#64748b",
          marginTop: 3,
          paddingLeft: isOwn ? 0 : 34,
          paddingRight: isOwn ? 4 : 0,
          fontWeight: 600,
        }}
      >
        {isOwn ? `You • ${time}` : `${msg.senderName || "Rider"} • ${time}`}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────
// DeliveryChat — Main floating chat component
// ─────────────────────────────────────────────
const DeliveryChat = ({ orderId, socket, riderName = "Rajesh Kumar", isActiveDelivery = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isRiderTyping, setIsRiderTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  }, []);

  // Socket.IO listeners
  useEffect(() => {
    if (!socket || !orderId) return;

    const handleChatMessage = (msg) => {
      if (msg.orderId !== orderId) return;
      setMessages((prev) => {
        // Deduplicate by id
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // If chat is closed and message is from rider, increment unread
      if (msg.sender === "rider") {
        setUnreadCount((prev) => {
          // Only increment if panel is not open
          return prev + 1;
        });
      }
      scrollToBottom();
    };

    const handleTyping = (payload) => {
      if (payload.orderId !== orderId || payload.sender !== "rider") return;
      setIsRiderTyping(true);
      scrollToBottom();
    };

    const handleStopTyping = (payload) => {
      if (payload.orderId !== orderId || payload.sender !== "rider") return;
      setIsRiderTyping(false);
    };

    socket.on("chat_message", handleChatMessage);
    socket.on("chat_typing", handleTyping);
    socket.on("chat_stop_typing", handleStopTyping);

    return () => {
      socket.off("chat_message", handleChatMessage);
      socket.off("chat_typing", handleTyping);
      socket.off("chat_stop_typing", handleStopTyping);
    };
  }, [socket, orderId, scrollToBottom]);

  // Clear unread when chat opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, scrollToBottom]);

  // Send message
  const sendMessage = useCallback(
    (text) => {
      const trimmed = (text || inputText).trim();
      if (!trimmed || !socket || !orderId) return;

      socket.emit("chat_message", {
        orderId,
        message: trimmed,
        sender: "customer",
        senderName: "You",
        timestamp: new Date().toISOString(),
      });

      setInputText("");
      scrollToBottom();
    },
    [inputText, socket, orderId, scrollToBottom]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Emit typing indicator
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && orderId) {
      socket.emit("chat_typing", { orderId, sender: "customer" });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("chat_stop_typing", { orderId, sender: "customer" });
      }, 1500);
    }
  };

  if (!isActiveDelivery) return null;

  return (
    <>
      {/* ── Keyframe Animations ────────────────────── */}
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(6,182,212,0); }
        }
        .animate-fadeIn {
          animation: chatSlideUp 0.25s ease-out;
        }
        .chat-panel-enter {
          animation: chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chat-bubble-pulse {
          animation: chatPulse 2s infinite;
        }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      {/* ── Floating Chat Bubble ───────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={unreadCount > 0 ? "chat-bubble-pulse" : ""}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: 20,
            background: "linear-gradient(135deg, #0e7490, #06b6d4)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(6, 182, 212, 0.35), 0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 9999,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Chat with your rider"
        >
          <MessageCircle style={{ width: 26, height: 26 }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#ef4444",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
                boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Chat Panel ─────────────────────────────── */}
      {isOpen && (
        <div
          className="chat-panel-enter"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 380,
            maxWidth: "calc(100vw - 32px)",
            height: 520,
            maxHeight: "calc(100vh - 48px)",
            borderRadius: 24,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            background: "#0f172a",
            border: "1px solid rgba(6, 182, 212, 0.2)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* ── Header ───────────────────────────── */}
          <div
            style={{
              background: "linear-gradient(135deg, #0c4a6e, #164e63)",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(6, 182, 212, 0.15)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  background: "rgba(6, 182, 212, 0.15)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🛵
              </div>
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {riderName}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#22c55e",
                      display: "inline-block",
                      boxShadow: "0 0 6px rgba(34,197,94,0.6)",
                    }}
                  />
                  <span
                    style={{
                      color: "#86efac",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    Online • Express Rider
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(255,255,255,0.08)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* ── Messages Area ────────────────────── */}
          <div
            className="chat-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px 8px",
              background: "#0f172a",
            }}
          >
            {messages.length === 0 && !isRiderTyping && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 12,
                  opacity: 0.6,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: "rgba(6, 182, 212, 0.1)",
                    border: "1px solid rgba(6, 182, 212, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageCircle style={{ width: 26, height: 26, color: "#06b6d4" }} />
                </div>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "center",
                    maxWidth: 220,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Send a message to your delivery rider
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} isOwn={msg.sender === "customer"} />
            ))}

            {isRiderTyping && <TypingIndicator name={riderName} />}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Replies ────────────────────── */}
          {messages.length < 4 && (
            <div
              style={{
                padding: "6px 14px 2px",
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "#0f172a",
                flexShrink: 0,
              }}
            >
              {QUICK_REPLIES.map((text) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: "1px solid rgba(6, 182, 212, 0.25)",
                    background: "rgba(6, 182, 212, 0.08)",
                    color: "#67e8f9",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.25)";
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* ── Input Bar ────────────────────────── */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0f172a",
                color: "#f1f5f9",
                fontSize: 13,
                fontWeight: 500,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(6, 182, 212, 0.4)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputText.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: inputText.trim()
                  ? "linear-gradient(135deg, #0891b2, #06b6d4)"
                  : "#1e293b",
                border: inputText.trim()
                  ? "none"
                  : "1px solid rgba(255,255,255,0.08)",
                color: inputText.trim() ? "#fff" : "#475569",
                cursor: inputText.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
                boxShadow: inputText.trim()
                  ? "0 4px 12px rgba(6, 182, 212, 0.3)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (inputText.trim()) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Send style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DeliveryChat;
