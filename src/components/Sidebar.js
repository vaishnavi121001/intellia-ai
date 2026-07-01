"use client";

import { useState, useRef } from "react";

function groupLabel(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 Days";
  if (diffDays <= 30) return "Previous 30 Days";
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

const GROUP_ORDER = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days"];

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
  windowWidth,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [logoTilt, setLogoTilt] = useState({ rx: 0, ry: 0 });
  const logoRef = useRef(null);

  const isMobile = windowWidth <= 768;

  const filteredHistory = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Claude-style relative grouping: Today / Yesterday / Previous 7 Days / Previous 30 Days / Month Year
  const groupedHistory = filteredHistory.reduce((groups, chat) => {
    const label = groupLabel(chat.timestamp);
    if (!groups[label]) groups[label] = [];
    groups[label].push(chat);
    return groups;
  }, {});

  const orderedGroupKeys = [
    ...GROUP_ORDER.filter((k) => groupedHistory[k]),
    ...Object.keys(groupedHistory).filter((k) => !GROUP_ORDER.includes(k)),
  ];

  const deleteChat = (chatId) => {
    const updated = chatHistory.filter((chat) => chat.id !== chatId);
    setChatHistory(updated);
    localStorage.setItem("chatHistory", JSON.stringify(updated));
  };

  const handleLogoMove = (e) => {
    const rect = logoRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setLogoTilt({ rx: py * -14, ry: px * 14 });
  };

  if (!sidebarOpen) return null;

  const content = (
    <aside
      style={{
        width: isMobile ? "84%" : 280,
        maxWidth: isMobile ? 320 : 280,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        background: "rgba(13,17,28,0.97)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        minHeight: isMobile ? "100vh" : "100vh",
        height: isMobile ? "100vh" : "auto",
        flexShrink: 0,
        boxShadow: isMobile
          ? "8px 0 40px rgba(0,0,0,.45)"
          : "1px 0 0 rgba(255,255,255,0.03)",
        overflowY: "auto",
        position: isMobile ? "fixed" : "relative",
        top: 0,
        left: 0,
        zIndex: 1001,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          ref={logoRef}
          onMouseMove={handleLogoMove}
          onMouseLeave={() => setLogoTilt({ rx: 0, ry: 0 })}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px",
            perspective: "600px",
          }}
        >
          <img
            src="/Intellia-ai.png"
            alt="Intellia AI"
            style={{
              width: "170px",
              height: "74px",
              objectFit: "contain",
              display: "block",
              transform: `rotateX(${logoTilt.rx}deg) rotateY(${logoTilt.ry}deg)`,
              transition: "transform .18s ease-out",
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,.45))",
              willChange: "transform",
            }}
          />
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            cursor: "pointer",
            color: "#cbd5e1",
            fontSize: 15,
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* New task button */}
      <div style={{ padding: "14px 12px 10px" }}>
        <button
          onClick={handleNewTask}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1.5px dashed rgba(255,255,255,0.18)",
            cursor: "pointer",
            color: "#cbd5e1",
            fontWeight: 500,
            fontSize: 13,
            padding: "11px 12px",
            borderRadius: 10,
            width: "100%",
            fontFamily: "inherit",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.color = accent;
            e.currentTarget.style.background = `${accent}14`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            e.currentTarget.style.color = "#cbd5e1";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
        >
          <span style={{ fontSize: 18 }}>⊕</span> New Chat
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "0 12px 10px" }}>
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 12px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 8,
            fontSize: 12.5,
            color: "#e5e7eb",
            fontFamily: "inherit",
            boxSizing: "border-box",
            outline: "none",
          }}
        />
      </div>

      {/* Chat History - Claude style: flat rows, relative date grouping, hover-reveal delete */}
      <div style={{ padding: "6px 10px", flex: 1, overflowY: "auto" }}>
        {orderedGroupKeys.length === 0 ? (
          <div style={{ fontSize: 12, color: "#64748b", padding: "20px 8px", textAlign: "center" }}>
            No chats yet. Start a new conversation!
          </div>
        ) : (
          orderedGroupKeys.map((label) => (
            <div key={label} style={{ marginBottom: 6 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#64748b",
                  letterSpacing: ".06em",
                  margin: "14px 8px 6px",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {groupedHistory[label].map((chat) => (
                  <div
                    key={chat.id}
                    onMouseEnter={() => setHoveredId(chat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleSelectChat(chat)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: hoveredId === chat.id ? "rgba(255,255,255,0.07)" : "transparent",
                      transition: "background .12s",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: "#e2e8f0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {chat.title}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      style={{
                        opacity: hoveredId === chat.id ? 1 : 0,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#64748b",
                        fontSize: 12,
                        padding: "4px 6px",
                        borderRadius: 6,
                        transition: "opacity .12s, color .12s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Subjects */}
      <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "#64748b",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginBottom: 6,
            paddingLeft: 8,
          }}
        >
          Subjects
        </div>
        {SUBJECTS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => switchSubject(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              cursor: "pointer",
              padding: "9px 10px",
              borderRadius: 8,
              textAlign: "left",
              width: "100%",
              fontFamily: "inherit",
              fontSize: 13,
              transition: "all .15s",
              background: displayIdx === i ? `${s.color}22` : "transparent",
              color: displayIdx === i ? s.color : "#94a3b8",
              fontWeight: displayIdx === i ? 600 : 400,
            }}
          >
            <span style={{ fontSize: 15 }}>{s.emoji}</span>
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* Credits */}
      <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>
            <span style={{ fontSize: 15 }}>⚡</span>Daily Credits
          </span>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: credits > 30 ? "#4ade80" : credits > 10 ? "#fbbf24" : "#f87171",
              background: credits > 30 ? "rgba(74,222,128,0.12)" : credits > 10 ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)",
              padding: "2px 8px",
              borderRadius: 99,
            }}
          >
            {credits}/{DAILY_CREDITS}
          </span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden", marginBottom: 7 }}>
          <div
            style={{
              width: `${(credits / DAILY_CREDITS) * 100}%`,
              height: "100%",
              background:
                credits > 30
                  ? `linear-gradient(90deg,${accent},#6366f1)`
                  : credits > 10
                  ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                  : "linear-gradient(90deg,#ef4444,#dc2626)",
              borderRadius: 99,
              transition: "width .4s, background .4s",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
          <span>🔄</span>
          <span>
            Resets in <span style={{ fontWeight: 600, color: "#94a3b8" }}>{timeLeft || "24:00:00"}</span>
          </span>
        </div>
      </div>

      {/* User */}
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${accent}55,#6366f155)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.grade}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            color: "#94a3b8",
            fontFamily: "inherit",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#f87171";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );

  if (!isMobile) return content;

  // Mobile: overlay drawer with backdrop
  return (
    <>
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          zIndex: 1000,
        }}
      />
      {content}
    </>
  );
}
