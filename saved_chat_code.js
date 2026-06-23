"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RichAnswer from "@/components/RichAnswer";
import FollowUpPanel from "@/components/FollowUpPanel";

// Subject Data
const SUBJECTS = [
  {
    name: "Mathematics",
    emoji: "📐",
    color: "#4F46E5",
    light: "#EEF2FF",
    tabs: ["AI Solver", "AI Graphing", "AI Chat"],
    demos: [
      {
        title: "Solve complex equations step-by-step",
        desc: "Solve a system of 3 linear equations with detailed steps",
        bg: "#EEF2FF",
        icon: "∑",
      },
      { title: "Visualize functions & graphs", desc: "Plot and analyze quadratic functions", bg: "#F0FDF4", icon: "📈" },
      { title: "Analyze multiple problems at once", desc: "Up to 60 problems — calculus, algebra, geometry", bg: "#FFF7ED", icon: "🧮" },
    ],
    recent: ["Quadratic Formula Explained", "Integration by Parts..."],
  },
  {
    name: "Chemistry",
    emoji: "⚗️",
    color: "#059669",
    light: "#ECFDF5",
    tabs: ["AI Solver", "AI Visualizer", "AI Chat"],
    demos: [
      { title: "Use it as teaching material", desc: "Make a class 11 worksheet on chemical bonding", bg: "#ECFDF5", icon: "🧪" },
      { title: "Explain difficult concepts simply", desc: "Explain benzene resonance structures with a diagram", bg: "#EFF6FF", icon: "⚗️" },
      { title: "Analyze multiple problems at once", desc: "Stoichiometry, thermodynamics, and organic reactions", bg: "#FFF7ED", icon: "🔬" },
    ],
    recent: ["Benzene Resonance Structures", "Chemical Bonding Notes..."],
  },
  {
    name: "Biology",
    emoji: "🧬",
    color: "#16A34A",
    light: "#F0FDF4",
    tabs: ["AI Solver", "AI Diagram", "AI Chat"],
    demos: [
      { title: "Visualize biological processes", desc: "Diagram the steps of mitosis with labels", bg: "#F0FDF4", icon: "🧬" },
      { title: "Simplify tough concepts", desc: "Explain DNA transcription vs. translation clearly", bg: "#EFF6FF", icon: "🔬" },
      { title: "Create study notes & flashcards", desc: "Summarize the human digestive system", bg: "#FFF7ED", icon: "📚" },
    ],
    recent: ["Mitosis vs Meiosis", "Photosynthesis Pathway..."],
  },
  {
    name: "Physics",
    emoji: "⚡",
    color: "#D97706",
    light: "#FFFBEB",
    tabs: ["AI Solver", "AI Simulator", "AI Chat"],
    demos: [
      { title: "Simulate motion problems", desc: "Projectile motion with angle and velocity inputs", bg: "#FFFBEB", icon: "🚀" },
      { title: "Explain laws & theorems", desc: "Newton's 3 laws with real-world examples", bg: "#EEF2FF", icon: "⚡" },
      { title: "Solve numericals instantly", desc: "Optics, electromagnetism, and thermodynamics", bg: "#F0FDF4", icon: "🌡️" },
    ],
    recent: ["Projectile Motion Fundament...", "Electromagnetic Induction..."],
  },
  {
    name: "Artificial Intelligence",
    emoji: "🤖",
    color: "#7C3AED",
    light: "#F5F3FF",
    tabs: ["AI Explainer", "AI Visualizer", "AI Chat"],
    demos: [
      { title: "Understand ML algorithms", desc: "Explain gradient descent with animated diagrams", bg: "#F5F3FF", icon: "🤖" },
      { title: "Code & debug AI models", desc: "Build a simple neural network in Python", bg: "#ECFDF5", icon: "🧠" },
      { title: "Compare AI architectures", desc: "CNN vs RNN vs Transformer — detailed breakdown", bg: "#FFF7ED", icon: "📊" },
    ],
    recent: ["Transformer Architecture", "Backpropagation Explained..."],
  },
  {
    name: "Engineering",
    emoji: "⚙️",
    color: "#0369A1",
    light: "#E0F2FE",
    tabs: ["AI Solver", "AI Explainer", "AI Chat"],
    demos: [
      { title: "Solve engineering problems", desc: "Stress and strain analysis for a steel beam", bg: "#E0F2FE", icon: "🏗️" },
      { title: "Explain core concepts", desc: "Fluid dynamics: Bernoulli's equation explained", bg: "#F5F3FF", icon: "⚙️" },
      { title: "Circuit & signal analysis", desc: "Analyze an RLC circuit with step-by-step solution", bg: "#ECFDF5", icon: "🔌" },
    ],
    recent: ["Stress-Strain Analysis", "Fourier Transform Basics..."],
  },
  {
    name: "English",
    emoji: "📖",
    color: "#B45309",
    light: "#FFFBEB",
    tabs: ["AI Tutor", "AI Essay Helper", "AI Chat"],
    demos: [
      { title: "Improve essays & writing", desc: "Edit and enhance a college application essay", bg: "#FFFBEB", icon: "✍️" },
      { title: "Analyze literature", desc: "Themes and symbolism in Shakespeare's Hamlet", bg: "#F5F3FF", icon: "📖" },
      { title: "Grammar & vocabulary drills", desc: "Common grammar mistakes with fixes and examples", bg: "#ECFDF5", icon: "🔤" },
    ],
    recent: ["Essay Structure Guide", "Hamlet Symbolism Analysis..."],
  },
  {
    name: "Computer Science",
    emoji: "💻",
    color: "#0F766E",
    light: "#F0FDFA",
    tabs: ["AI Solver", "AI Code Helper", "AI Chat"],
    demos: [
      { title: "Debug your code instantly", desc: "Find and fix bugs in a Python sorting algorithm", bg: "#F0FDFA", icon: "🐛" },
      { title: "Explain data structures", desc: "Binary trees, graphs, hash maps — visually explained", bg: "#EEF2FF", icon: "🌲" },
      { title: "Crack coding interviews", desc: "Solve LeetCode-style problems with explanation", bg: "#FFF7ED", icon: "💡" },
    ],
    recent: ["Big O Notation Guide", "Recursion vs Iteration..."],
  },
];

function buildSystemPrompt(subjectName) {
  return `You are Intellia AI, an expert educational tutor specialising in ${subjectName}.

Your response MUST be richly structured using these conventions:
- Use ## for major section headings (e.g. ## Fundamental Equations, ## Solution, ## Key Concepts)
- Use ### for sub-section headings
- Wrap ALL mathematical expressions in LaTeX: inline as $formula$ and block as $$formula$$
- Use **bold** for key terms, variables, important values
- Use bullet lists (- item) for multiple points
- Use numbered steps for solutions: "Step 1: ...", "Step 2: ..."
- Use markdown tables (| col | col |) for comparisons and data
- Use \`\`\`language\`\`\` for code blocks
- Use > for important notes or definitions
- Start with a brief "Given:" section when values are provided
- End with a "## Result" or "## Summary" section

Be thorough, clear, and use formatting to make answers beautiful and easy to study from.`;
}

async function groqChat({ systemPrompt, messages, maxTokens = 2048, temperature = 0.4, userGrade, subjects }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, messages, maxTokens, temperature, userGrade, subjects }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.text ?? "";
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answerLabel, setAnswerLabel] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");

  const cycleRef = useRef(null);
  const moreRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/auth/signin");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const subject = SUBJECTS[displayIdx];
  const accent = subject.color;

  useEffect(() => {
    cycleRef.current = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setDisplayIdx((p) => (p + 1) % SUBJECTS.length);
        setActiveTab(0);
        setAnimating(false);
      }, 320);
    }, 2800);
    return () => clearInterval(cycleRef.current);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const switchSubject = (idx) => {
    clearInterval(cycleRef.current);
    setAnimating(true);
    setTimeout(() => {
      setDisplayIdx(idx);
      setActiveTab(0);
      setAnswer("");
      setCurrentQuestion("");
      setAnimating(false);
    }, 220);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    router.push("/auth/signin");
  };

  const handleSolve = async () => {
    if (!inputValue.trim() || loading) return;
    const question = inputValue.trim();
    setLoading(true);
    setAnswer("");
    setCurrentQuestion(question);
    setAnswerLabel(`${subject.emoji} ${subject.name}`);

    try {
      const text = await groqChat({
        systemPrompt: buildSystemPrompt(subject.name),
        messages: [{ role: "user", content: question }],
        maxTokens: 2048,
        temperature: 0.4,
        userGrade: user?.grade,
        subjects: user?.subjects || [],
      });
      setAnswer(text);
    } catch (err) {
      setAnswer(`⚠️ ${err.message || "Something went wrong. Please try again."}`);
    }
    setLoading(false);
  };

  const handleDemo = (demo) => {
    setAnswer("");
    setCurrentQuestion("");
    setInputValue(demo.desc);
    inputRef.current?.focus();
  };

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f8f8f8; }
        .tab { border: none; background: transparent; cursor: pointer; padding: 8px 15px; border-radius: 9px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #666; transition: all .15s; white-space: nowrap; }
        .tab.on { background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.10); color: #111; font-weight: 600; }
        .card { border: 1.5px solid #ebebeb; border-radius: 16px; overflow: hidden; background: #fff; cursor: pointer; transition: box-shadow .2s, transform .2s; }
        .card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.10); transform: translateY(-3px); }
        .sbtn { display: flex; align-items: center; gap: 8px; border: none; cursor: pointer; padding: 7px 10px; border-radius: 9px; text-align: left; width: 100%; font-family: inherit; font-size: 13.5px; transition: all .15s; }
        .answer-wrap { background: #fff; border: 1.5px solid #e5e5e5; border-radius: 16px; padding: 24px 28px; margin-top: 18px; font-size: 14.5px; line-height: 1.78; color: #1a1a1a; max-height: 62vh; overflow-y: auto; animation: fadeUp .3s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        .dot { width: 8px; height: 8px; border-radius: 50%; animation: bop .75s ease infinite; }
        .dot:nth-child(2) { animation-delay: .15s; }
        .dot:nth-child(3) { animation-delay: .3s; }
        @keyframes bop { 0%, 80%, 100% { transform: scale(.65); opacity: .4 } 40% { transform: scale(1); opacity: 1 } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 99px; }
        .send { width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: background .2s, transform .1s; }
        .send:active { transform: scale(.91); }
        .hero-word { display: inline-block; transition: opacity .32s ease, transform .32s ease; }
        .hero-word.out { opacity: 0; transform: translateY(14px); }
      `}</style>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{ width: 252, borderRight: "1px solid #e8e8e8", display: "flex", flexDirection: "column", background: "#fff", minHeight: "100vh", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 14px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: `linear-gradient(135deg,${accent},#6366f1)`,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 12,
                  transition: "background .4s",
                  letterSpacing: "-0.5px",
                }}
              >
                ia
              </div>
              <span
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: 19,
                  color: "#111",
                  letterSpacing: "-0.5px",
                }}
              >
                Intellia AI
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#ccc",
                fontSize: 18,
              }}
            >
              ⊟
            </button>
          </div>

          {/* New task */}
          <div style={{ padding: "0 10px 14px" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "1.5px dashed #ddd",
                cursor: "pointer",
                color: "#666",
                fontWeight: 500,
                fontSize: 13,
                padding: "8px 12px",
                borderRadius: 10,
                width: "100%",
                fontFamily: "inherit",
                transition: "border .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            >
              <span style={{ fontSize: 19 }}>⊕</span> New task
            </button>
          </div>

          {/* Subjects */}
          <div style={{ padding: "0 10px 14px" }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: "#bbb",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 6,
                padding: "0 4px",
              }}
            >
              Subjects
            </div>
            {SUBJECTS.map((s, i) => (
              <button
                key={s.name}
                className="sbtn"
                onClick={() => switchSubject(i)}
                style={{
                  background: displayIdx === i ? s.light : "transparent",
                  color: displayIdx === i ? s.color : "#444",
                  fontWeight: displayIdx === i ? 600 : 400,
                }}
              >
                <span>{s.emoji}</span>
                {s.name}
              </button>
            ))}
          </div>

          {/* Recent */}
          <div style={{ padding: "0 14px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#bbb",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                Recent
              </span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#bbb",
                  fontSize: 12,
                }}
              >
                See all ›
              </button>
            </div>
            {subject.recent.map((r) => (
              <div
                key={r}
                style={{
                  fontSize: 13,
                  color: "#666",
                  padding: "6px 6px",
                  borderRadius: 7,
                  cursor: "pointer",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {r}
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Credits */}
          <div style={{ padding: "14px", borderTop: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontWeight: 600,
                  fontSize: 13.5,
                  color: "#111",
                }}
              >
                <span style={{ color: "#f59e0b" }}>⚡</span>Credits
              </span>
              <span style={{ fontSize: 12.5, color: "#888" }}>Unlimited</span>
            </div>
            <div style={{ height: 5, background: "#eee", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(90deg,${accent},#6366f1)`,
                  borderRadius: 99,
                  transition: "background .4s",
                }}
              />
            </div>
          </div>

          {/* User */}
          <div
            style={{
              padding: "10px 14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${accent}44,#6366f144)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  color: accent,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{user.name}</div>
                <div style={{ fontSize: 11, color: "#bbb" }}>{user.grade}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "8px",
                border: "1.5px solid #e5e5e5",
                borderRadius: 9,
                background: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "#666",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c33";
                e.currentTarget.style.color = "#c33";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e5e5";
                e.currentTarget.style.color = "#666";
              }}
            >
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 28px 64px",
          overflowY: "auto",
        }}
      >
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: "fixed",
              left: 12,
              top: 14,
              background: "#fff",
              border: "1.5px solid #e5e5e5",
              borderRadius: 9,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 16,
              color: "#888",
              zIndex: 50,
              boxShadow: "0 2px 10px rgba(0,0,0,.07)",
            }}
          >
            ☰
          </button>
        )}

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: "clamp(38px,5.5vw,60px)",
              fontWeight: 400,
              color: "#111",
              lineHeight: 1.16,
              letterSpacing: "-1.5px",
            }}
          >
            AI Solver for<br />
            <span
              className={`hero-word${animating ? " out" : ""}`}
              style={{ color: accent, transition: "color .4s" }}
            >
              {subject.name}
            </span>
          </h1>
          <p
            style={{
              fontSize: 15.5,
              color: "#888",
              marginTop: 12,
              fontWeight: 400,
            }}
          >
            Welcome, {user.name}! Ask anything about {subject.name}
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 3,
            background: "#f0f0f0",
            borderRadius: 12,
            padding: "4px",
            marginBottom: 24,
          }}
        >
          {subject.tabs.map((t, i) => (
            <button
              key={t}
              className={`tab${activeTab === i ? " on" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {t}
            </button>
          ))}
          <div ref={moreRef} style={{ position: "relative" }}>
            <button className="tab" onClick={() => setMoreOpen(!moreOpen)}>
              More <span style={{ fontSize: 10 }}>▾</span>
            </button>
            {moreOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  boxShadow: "0 6px 28px rgba(0,0,0,.10)",
                  padding: "6px",
                  zIndex: 200,
                  minWidth: 156,
                }}
              >
                {["Flashcards", "Study Planner", "Past Papers", "Formula Sheet"].map((m) => (
                  <div
                    key={m}
                    style={{
                      padding: "9px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13.5,
                      color: "#333",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Box */}
        <div
          style={{
            width: "100%",
            maxWidth: 820,
            border: "1.5px solid #e0e0e0",
            borderRadius: 18,
            padding: "16px 20px",
            background: "#fff",
            boxShadow: "0 2px 18px rgba(0,0,0,.05)",
            marginBottom: 8,
          }}
        >
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSolve();
            }}
            placeholder={`Ask anything about ${subject.name}…`}
            style={{
              width: "100%",
              minHeight: 78,
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 15,
              color: "#111",
              background: "transparent",
              fontFamily: "'DM Sans',sans-serif",
              lineHeight: 1.65,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                title="Attach"
                style={{
                  background: "none",
                  border: "1.5px solid #eee",
                  cursor: "pointer",
                  color: "#aaa",
                  fontSize: 14,
                  borderRadius: 8,
                  padding: "4px 9px",
                }}
              >
                📎
              </button>
              <span style={{ fontSize: 11.5, color: "#ccc" }}>⌘+Enter to solve</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
              }}
            >
              <span style={{ fontSize: 12, color: "#bbb" }}>Powered by</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: subject.light,
                  border: `1.5px solid ${accent}33`,
                  borderRadius: 9,
                  padding: "4px 11px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: accent,
                  transition: "all .3s",
                }}
              >
                {subject.emoji} Intellia {subject.tabs[activeTab]}
              </div>
              <button
                className="send"
                onClick={handleSolve}
                style={{
                  background: inputValue.trim() && !loading ? accent : "#f0f0f0",
                  color: inputValue.trim() && !loading ? "#fff" : "#ccc",
                }}
              >
                {loading ? "⏳" : "↑"}
              </button>
            </div>
          </div>
        </div>

        {/* Loading dots */}
        {loading && (
          <div
            style={{
              width: "100%",
              maxWidth: 820,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "16px 0",
            }}
          >
            <div className="dot" style={{ background: accent }} />
            <div className="dot" style={{ background: accent }} />
            <div className="dot" style={{ background: accent }} />
            <span style={{ fontSize: 13.5, color: "#aaa", marginLeft: 4 }}>
              Intellia is solving your {subject.name} question…
            </span>
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div style={{ width: "100%", maxWidth: 820 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `linear-gradient(135deg,${accent},#6366f1)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ia
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>
                Intellia AI · {answerLabel}
              </span>
              <button
                onClick={() => {
                  setAnswer("");
                  setCurrentQuestion("");
                }}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "1.5px solid #eee",
                  borderRadius: 7,
                  padding: "3px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#aaa",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ccc";
                  e.currentTarget.style.color = "#666";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#eee";
                  e.currentTarget.style.color = "#aaa";
                }}
              >
                Clear
              </button>
            </div>
            <div className="answer-wrap">
              <RichAnswer text={answer} accent={accent} />
            </div>
          </div>
        )}

        {/* Demo Cards */}
        {!answer && !loading && (
          <div style={{ width: "100%", maxWidth: 820, marginTop: 34 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 18 }}>
              Try demo
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {subject.demos.map((card, i) => (
                <div key={i} className="card" onClick={() => handleDemo(card)}>
                  <div
                    style={{
                      height: 116,
                      background: card.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 46,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ padding: "14px 16px 18px" }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 14.5,
                        color: "#111",
                        marginBottom: 5,
                        lineHeight: 1.35,
                      }}
                    >
                      {card.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#999",
                        marginBottom: 14,
                        lineHeight: 1.55,
                      }}
                    >
                      {card.desc}
                    </p>
                    <button
                      style={{
                        background: accent,
                        color: "#fff",
                        border: "none",
                        borderRadius: 99,
                        padding: "8px 20px",
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "opacity .15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = ".82")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      Try demo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Follow-up Panel */}
      {(answer || currentQuestion) && !loading && (
        <FollowUpPanel
          accent={accent}
          subjectName={subject.name}
          question={currentQuestion}
          userGrade={user.grade}
          subjects={user.subjects}
        />
      )}
    </div>
  );
}