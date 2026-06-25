"use client";

import { useState, useRef, useEffect } from "react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  user,
  subject,
  accent,
  credits,
  DAILY_CREDITS,
  timeLeft,
  handleNewTask,
  handleLogout,
  SUBJECTS,
  switchSubject,
  displayIdx,
  chatHistory,
  handleSelectChat,
  setChatHistory,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const moreRef = useRef(null);

  const filteredHistory = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteChat = (chatId) => {
    const updated = chatHistory.filter((chat) => chat.id !== chatId);
    setChatHistory(updated);
    localStorage.setItem("chatHistory", JSON.stringify(updated));
  };

  return sidebarOpen ? (
    <aside
      style={{
        width:
  typeof window !== "undefined" && window.innerWidth <= 768
    ? "100%"
    : 280,
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        background: "#d8eaf6",
       minHeight:
  typeof window !== "undefined" && window.innerWidth <= 768
    ? "auto"
    : "100vh",
        flexShrink: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
        maxWidth: "100%",
overflowY: "auto"
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 16px",
        }}
      >
       <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
  }}
>
  <img
    src="/Intellia-ai.png"
    alt="Intellia AI"
    style={{
      width: "180px",      
      height: "80px",
      objectFit: "contain",
      display: "block",
    }}
  />
</div>
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#03132b",
            fontSize: 18,
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>

      {/* New task button */}
      <div style={{ padding: "0 12px 16px" }}>
        <button
          onClick={handleNewTask}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "1.5px dashed #d1d5db",
            cursor: "pointer",
            color: "#071735",
            fontWeight: 500,
            fontSize: 13,
            padding: "10px 12px",
            borderRadius: 10,
            width: "100%",
            fontFamily: "inherit",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.color = accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <span style={{ fontSize: 18 }}>⊕</span> New Chat
        </button>
      </div>

      {/* Chat History */}
      <div style={{ padding: "12px 12px", flex: 1, overflowY: "auto" }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "#9ca3af",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginBottom: 8,
            paddingLeft: 6,
          }}
        >
          📋 Chat History
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 12,
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />

        {/* History list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredHistory.length === 0 ? (
            <div style={{ fontSize: 12, color: "#9ca3af", padding: "16px 8px", textAlign: "center" }}>
              No chats yet. Start a new conversation!
            </div>
          ) : (
            filteredHistory.map((chat) => (
              <div
                key={chat.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  background: "#f9fafb",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all .15s",
                  borderLeft: `3px solid ${accent}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
              >
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => handleSelectChat(chat)}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: "#111",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4,
                  }}>
                    {chat.title}
                  </div>
                  <div style={{
                    fontSize: 11, color: "#9ca3af",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {chat.subject}
                  </div>
                  <div style={{ fontSize: 10, color: "#d1d5db", marginTop: 4 }}>
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#d1d5db", fontSize: 14, padding: "4px 8px",
                    borderRadius: 6, transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.background = "#fee2e2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#d1d5db";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Subjects */}
      <div style={{ padding: "12px 12px", borderTop: "1px solid #f3f4f6" }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, color: "#9ca3af",
          letterSpacing: ".08em", textTransform: "uppercase",
          marginBottom: 8, paddingLeft: 6,
        }}>
          Subjects
        </div>
        {SUBJECTS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => switchSubject(i)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              border: "none", cursor: "pointer", padding: "10px 12px",
              borderRadius: 10, textAlign: "left", width: "100%",
              fontFamily: "inherit", fontSize: 13.5, transition: "all .15s",
              background: displayIdx === i ? s.light : "transparent",
              color: displayIdx === i ? s.color : "#4b5563",
              fontWeight: displayIdx === i ? 600 : 400,
            }}
          >
            <span style={{ fontSize: 16 }}>{s.emoji}</span>
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* Credits */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid #f3f4f6" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 8,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: "#111" }}>
            <span style={{ fontSize: 16 }}>⚡</span>Daily Credits
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: credits > 30 ? "#16a34a" : credits > 10 ? "#d97706" : "#dc2626",
            background: credits > 30 ? "#dcfce7" : credits > 10 ? "#fef3c7" : "#fee2e2",
            padding: "2px 8px", borderRadius: 99,
          }}>
            {credits}/{DAILY_CREDITS}
          </span>
        </div>
        <div style={{ height: 6, background: "#e5e7eb", borderRadius: 99, overflow: "hidden", marginBottom: 7 }}>
          <div style={{
            width: `${(credits / DAILY_CREDITS) * 100}%`,
            height: "100%",
            background: credits > 30
              ? `linear-gradient(90deg,${accent},#6366f1)`
              : credits > 10
              ? "linear-gradient(90deg,#f59e0b,#ef4444)"
              : "linear-gradient(90deg,#ef4444,#dc2626)",
            borderRadius: 99,
            transition: "width .4s, background .4s",
          }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9ca3af" }}>
          <span>🔄</span>
          <span>Resets in{" "}
            <span style={{ fontWeight: 600, color: "#6b7280" }}>{timeLeft || "24:00:00"}</span>
          </span>
        </div>
      </div>

      {/* User */}
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg,${accent}44,#6366f144)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, color: accent, flexShrink: 0,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.grade}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", padding: "10px", border: "1.5px solid #e5e7eb",
            borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", color: "#6b7280", fontFamily: "inherit", transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#fca5a5";
            e.currentTarget.style.color = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  ) : null;
}