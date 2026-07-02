"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RichAnswer from "@/components/RichAnswer";
import DiagramVisualizer from "@/components/DiagramVisualizer";
import AdvancedDiagramRenderer from "@/components/AdvancedDiagramRenderer";
import Sidebar from "@/components/Sidebar";
import FollowUpPanel from "@/components/FollowUpPanel";
import QuizPanel from "@/components/QuizPanel";

const SUBJECTS = [
  {
    name: "Mathematics", emoji: "📐", color: "#4F46E5", light: "#EEF2FF", tabs: ["AI Solver"],
    demos: [
      { title: "Solve complex equations", desc: "Solve a system of 3 linear equations", bg: "#EEF2FF", icon: "∑" },
      { title: "Visualize functions", desc: "Plot and analyze quadratic functions", bg: "#F0FDF4", icon: "📈" },
      { title: "Analyze problems", desc: "Up to 60 problems — calculus, algebra, geometry", bg: "#FFF7ED", icon: "🧮" },
    ],
  },
  {
    name: "Chemistry", emoji: "⚗️", color: "#059669", light: "#ECFDF5", tabs: ["AI Solver"],
    demos: [
      { title: "Teaching material", desc: "Make a class 11 worksheet on chemical bonding", bg: "#ECFDF5", icon: "🧪" },
      { title: "Explain concepts", desc: "Explain benzene resonance structures", bg: "#EFF6FF", icon: "⚗️" },
      { title: "Analyze problems", desc: "Stoichiometry, thermodynamics, organic reactions", bg: "#FFF7ED", icon: "🔬" },
    ],
  },
  {
    name: "Biology", emoji: "🧬", color: "#10361e", light: "#F0FDF4", tabs: ["AI Solver"],
    demos: [
      { title: "Visualize processes", desc: "Diagram the steps of mitosis with labels", bg: "#F0FDF4", icon: "🧬" },
      { title: "Simplify concepts", desc: "Explain DNA transcription vs translation", bg: "#EFF6FF", icon: "🔬" },
      { title: "Create study notes", desc: "Summarize the human digestive system", bg: "#FFF7ED", icon: "📚" },
    ],
  },
  {
    name: "Physics", emoji: "⚡", color: "#372c20", light: "#FFFBEB", tabs: ["AI Solver"],
    demos: [
      { title: "Simulate motion", desc: "Projectile motion with angle and velocity", bg: "#FFFBEB", icon: "🚀" },
      { title: "Explain laws", desc: "Newton's 3 laws with real-world examples", bg: "#EEF2FF", icon: "⚡" },
      { title: "Solve numericals", desc: "Optics, electromagnetism, thermodynamics", bg: "#F0FDF4", icon: "🌡️" },
    ],
  },
  {
    name: "AI", emoji: "🤖", color: "#7C3AED", light: "#F5F3FF", tabs: ["AI Explainer"],
    demos: [
      { title: "Understand ML algorithms", desc: "Explain gradient descent with diagrams", bg: "#F5F3FF", icon: "🤖" },
      { title: "Code & debug AI models", desc: "Build a simple neural network in Python", bg: "#ECFDF5", icon: "🧠" },
      { title: "Compare AI architectures", desc: "CNN vs RNN vs Transformer breakdown", bg: "#FFF7ED", icon: "📊" },
    ],
  },
];

function buildSystemPrompt(subjectName, tabName) {
  return `You are Intellia AI, an expert tutor in ${subjectName}.

Your task: Provide detailed, step-by-step explanations with visual descriptions.

IMPORTANT: End EVERY answer with this exact format:

[QUIZ_START]
Q1: [question about the topic]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: A

Q2: [question about the topic]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: B

Q3: [question about the topic]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: C

Q4: [question about the topic]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: D

Q5: [question about the topic]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: A

[FOLLOWUP_START]
1. [follow-up question 1]
2. [follow-up question 2]
3. [follow-up question 3]
4. [follow-up question 4]
5. [follow-up question 5]
[FOLLOWUP_END]

Make the answer perfect, professional and educational.`;
}

function parseResponse(response) {
  const quizMatch = response.match(/\[QUIZ_START\]([\s\S]*?)\[FOLLOWUP_START\]/);
  const followupMatch = response.match(/\[FOLLOWUP_START\]([\s\S]*?)\[FOLLOWUP_END\]/);

  let quiz = [];
  let followUp = [];

  if (quizMatch) {
    const quizText = quizMatch[1];
    const questionRegex = /Q(\d+):\s*(.+?)\nA\)\s*(.+?)\nB\)\s*(.+?)\nC\)\s*(.+?)\nD\)\s*(.+?)\nAnswer:\s*([A-D])/g;
    let match;
    while ((match = questionRegex.exec(quizText)) !== null) {
      quiz.push({
        q: match[2].trim(),
        options: [match[3].trim(), match[4].trim(), match[5].trim(), match[6].trim()],
        correct: match[7].charCodeAt(0) - 65,
      });
    }
  }

  if (followupMatch) {
    followUp = followupMatch[1]
      .split("\n")
      .filter((line) => line.match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);
  }

  const answerText = response
    .replace(/\[QUIZ_START\][\s\S]*?\[FOLLOWUP_START\][\s\S]*?\[FOLLOWUP_END\]/g, "")
    .trim();

  return { answerText, quiz, followUp };
}

async function groqChat({ systemPrompt, messages, maxTokens = 4000 }) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, messages, maxTokens }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || `API error ${res.status}`);
    }

    const data = await res.json();
    if (!data.text) throw new Error("No text in response");
    return data.text;
  } catch (err) {
    console.error("❌ groqChat error:", err);
    throw err;
  }
}

// ── Mobile bottom-sheet used for Follow-up / Quiz on small screens ──────────
function MobileSheet({ title, accent, onClose, children }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "flex-end" }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(3px)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxHeight: "82vh",
          background: "rgba(15,23,42,.98)",
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${accent}55`,
          borderRadius: "20px 20px 0 0",
          padding: "14px 16px 24px",
          overflowY: "auto",
          boxShadow: "0 -20px 50px rgba(0,0,0,.5)",
          animation: "sheetUp .25s ease",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,.2)", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
              color: "#cbd5e1", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activePanel, setActivePanel] = useState("Follow-up");
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth > 768) {
      setSidebarOpen(true);
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answerLabel, setAnswerLabel] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [error, setError] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [diagramType, setDiagramType] = useState("Generic Diagram");

  const DAILY_CREDITS = 100;
  const CREDIT_KEY = "intellia_credits";
  const [credits, setCredits] = useState(DAILY_CREDITS);
  const [creditsResetAt, setCreditsResetAt] = useState(null);
  const [showNoCredits, setShowNoCredits] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [mobilePanel, setMobilePanel] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const cycleRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/auth/signin");
    } else {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
        router.push("/auth/signin");
      }
    }
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(CREDIT_KEY);
    const now = Date.now();
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (now >= saved.resetAt) {
          const newReset = now + 24 * 60 * 60 * 1000;
          const fresh = { credits: DAILY_CREDITS, resetAt: newReset };
          localStorage.setItem(CREDIT_KEY, JSON.stringify(fresh));
          setCredits(DAILY_CREDITS);
          setCreditsResetAt(newReset);
        } else {
          setCredits(saved.credits);
          setCreditsResetAt(saved.resetAt);
        }
      } catch {
        const newReset = now + 24 * 60 * 60 * 1000;
        const fresh = { credits: DAILY_CREDITS, resetAt: newReset };
        localStorage.setItem(CREDIT_KEY, JSON.stringify(fresh));
        setCredits(DAILY_CREDITS);
        setCreditsResetAt(newReset);
      }
    } else {
      const newReset = now + 24 * 60 * 60 * 1000;
      const fresh = { credits: DAILY_CREDITS, resetAt: newReset };
      localStorage.setItem(CREDIT_KEY, JSON.stringify(fresh));
      setCredits(DAILY_CREDITS);
      setCreditsResetAt(newReset);
    }
  }, []);

  useEffect(() => {
    if (!creditsResetAt) return;
    const tick = () => {
      const now = Date.now();
      const diff = creditsResetAt - now;
      if (diff <= 0) {
        const newReset = now + 24 * 60 * 60 * 1000;
        const fresh = { credits: DAILY_CREDITS, resetAt: newReset };
        localStorage.setItem(CREDIT_KEY, JSON.stringify(fresh));
        setCredits(DAILY_CREDITS);
        setCreditsResetAt(newReset);
        setShowNoCredits(false);
        setTimeLeft("");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [creditsResetAt]);

  const deductCredit = () => {
    const newCredits = Math.max(0, credits - 1);
    setCredits(newCredits);
    const raw = localStorage.getItem(CREDIT_KEY);
    let resetAt = Date.now() + 24 * 60 * 60 * 1000;
    if (raw) {
      try {
        resetAt = JSON.parse(raw).resetAt;
      } catch {}
    }
    localStorage.setItem(CREDIT_KEY, JSON.stringify({ credits: newCredits, resetAt }));
  };

  useEffect(() => {
    cycleRef.current = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setDisplayIdx((p) => (p + 1) % SUBJECTS.length);
        setActiveTab(0);
        setAnimating(false);
      }, 320);
    }, 4500);

    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, []);

  const switchSubject = (idx) => {
    if (cycleRef.current) clearInterval(cycleRef.current);
    setAnimating(true);
    setTimeout(() => {
      setDisplayIdx(idx);
      setActiveTab(0);
      setAnswer("");
      setCurrentQuestion("");
      setError("");
      setQuizScore(null);
      setQuizAnswers({});
      setQuizData([]);
      setFollowUpQuestions([]);
      setAnimating(false);
    }, 220);
  };

  const handleNewTask = () => {
    setAnswer("");
    setCurrentQuestion("");
    setError("");
    setInputValue("");
    setQuizScore(null);
    setQuizAnswers({});
    setQuizData([]);
    setFollowUpQuestions([]);
    setCurrentChatId(null);
    if (inputRef.current) inputRef.current.focus();
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

    if (credits <= 0) {
      setShowNoCredits(true);
      return;
    }

    const question = inputValue.trim();
    let fileContent = "";

    if (selectedFile) {
      try {
        fileContent = await selectedFile.text();
      } catch (err) {
        console.error("File read error:", err);
      }
    }

    const finalPrompt = selectedFile
      ? `\nUser Question:\n${question}\n\nAttached File Name:\n${selectedFile.name}\n\nAttached File Content:\n${fileContent}\n`
      : question;

    setLoading(true);
    setAnswer("");
    setError("");
    setCurrentQuestion(question);
    setAnswerLabel(`${subject.emoji} ${subject.name}`);
    setQuizData([]);
    setFollowUpQuestions([]);

    deductCredit();

    try {
      let userId = user?.id;
      if (!userId) {
        userId = user?.email || `user_${Date.now()}`;
        const updatedUser = { ...user, id: userId };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      const systemPrompt = buildSystemPrompt(subject.name, subject.tabs[activeTab]);

      const text = await groqChat({
        systemPrompt,
        messages: [{ role: "user", content: finalPrompt }],
        maxTokens: 4000,
      });

      const { answerText, quiz, followUp } = parseResponse(text);

      setAnswer(answerText);
      setQuizData(quiz.length > 0 ? quiz : generateFallbackQuiz(subject.name));
      setFollowUpQuestions(followUp.length > 0 ? followUp : generateFallbackFollowUp());
      setDiagramType(detectDiagramType(question, subject.name));
      setInputValue("");

      const chatTitle = question.substring(0, 50) + (question.length > 50 ? "..." : "");
      const newChat = {
        id: Date.now().toString(),
        title: chatTitle,
        subject: subject.name,
        question,
        answer: answerText,
        timestamp: new Date().toISOString(),
        userId,
      };

      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
      setCurrentChatId(newChat.id);
    } catch (err) {
      console.error("❌ Chat error:", err);
      setError(err.message || "Failed to get response. Please try again.");
      setAnswer("");
    }
    setLoading(false);
  };

  const handleDemo = (demo) => {
    setAnswer("");
    setError("");
    setCurrentQuestion("");
    setInputValue(demo.desc);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const generateFallbackQuiz = (subjectName) => {
    const quizzes = {
      Mathematics: [
        { q: "What is the derivative of 3x²?", options: ["6x", "3x", "x", "2x"], correct: 0 },
        { q: "Solve: x + 5 = 12", options: ["x = 7", "x = 17", "x = 2", "x = 8"], correct: 0 },
        { q: "What is sin(90°)?", options: ["1", "0", "0.5", "-1"], correct: 0 },
        { q: "Find the area of circle with radius 5", options: ["25π", "10π", "50π", "100π"], correct: 0 },
        { q: "What is log₁₀(100)?", options: ["2", "1", "10", "100"], correct: 0 },
      ],
      Chemistry: [
        { q: "What is the atomic number of Oxygen?", options: ["8", "6", "7", "9"], correct: 0 },
        { q: "What is the pH of neutral water?", options: ["7", "0", "14", "1"], correct: 0 },
        { q: "How many electrons in Cl⁻ ion?", options: ["18", "17", "16", "19"], correct: 0 },
        { q: "What is oxidation state of N in NO₂?", options: ["+4", "+3", "+2", "+5"], correct: 0 },
        { q: "Which bond is strongest?", options: ["Triple bond", "Double bond", "Single bond", "Ionic"], correct: 0 },
      ],
      Biology: [
        { q: "How many chromosomes do humans have?", options: ["46", "23", "48", "50"], correct: 0 },
        { q: "Powerhouse of cell?", options: ["Mitochondria", "Nucleus", "Ribosome", "Lysosome"], correct: 0 },
        { q: "Plants make food via?", options: ["Photosynthesis", "Respiration", "Fermentation", "Digestion"], correct: 0 },
        { q: "DNA strands in double helix?", options: ["2", "1", "3", "4"], correct: 0 },
        { q: "Enzyme that breaks DNA?", options: ["DNase", "Protease", "Lipase", "Amylase"], correct: 0 },
      ],
      Physics: [
        { q: "What is Newton's 1st Law?", options: ["F=ma", "Object stays at rest unless acted upon", "Action-reaction", "Energy conservation"], correct: 1 },
        { q: "Speed of light?", options: ["3×10⁸ m/s", "3×10⁵ m/s", "3×10⁶ m/s", "3×10⁹ m/s"], correct: 0 },
        { q: "What is SI unit of force?", options: ["Newton", "Joule", "Watt", "Pascal"], correct: 0 },
        { q: "Define velocity?", options: ["Speed only", "Speed with direction", "Acceleration", "Distance/time"], correct: 1 },
        { q: "What is acceleration?", options: ["Change in velocity", "Speed", "Distance", "Time"], correct: 0 },
      ],
      AI: [
        { q: "What is a neural network?", options: ["Network of interconnected neurons", "Only biological neurons", "Computer memory", "Internet connection"], correct: 0 },
        { q: "What does backpropagation do?", options: ["Updates weights based on errors", "Deletes old data", "Forwards input", "Prints output"], correct: 0 },
        { q: "What is activation function?", options: ["Introduces non-linearity", "Activates computer", "Turns on AI", "Connects networks"], correct: 0 },
        { q: "What does CNN mean?", options: ["Convolutional Neural Network", "Computer Network", "Connected Nodes", "Central Neural Net"], correct: 0 },
        { q: "What is dropout in neural networks?", options: ["Randomly disables neurons during training", "Removes data", "Stops training", "Closes connections"], correct: 0 },
      ],
    };
    return quizzes[subjectName] || quizzes.Mathematics;
  };

  const generateFallbackFollowUp = () => [
    "Can you provide more examples?",
    "How is this applied in real-world?",
    "What are common mistakes?",
    "Can you compare with similar concepts?",
    "What is the next level of difficulty?",
  ];

  const detectDiagramType = (question, subject) => {
    const q = question.toLowerCase();
    if (subject === "Chemistry") {
      if (q.includes("structure") || q.includes("bond") || q.includes("molecule")) return "Molecule Structure";
      if (q.includes("cycle") || q.includes("reaction")) return "Reaction Cycle";
    }
    if (subject === "Biology") {
      if (q.includes("mitosis") || q.includes("meiosis") || q.includes("cell")) return "Cell Cycle";
      if (q.includes("photosynthesis") || q.includes("respiration")) return "Process Cycle";
      if (q.includes("dna") || q.includes("protein")) return "DNA Structure";
    }
    if (subject === "Physics") {
      if (q.includes("graph") || q.includes("motion") || q.includes("velocity")) return "Motion Diagram";
      if (q.includes("force") || q.includes("energy")) return "Force Diagram";
    }
    if (subject === "Mathematics") {
      if (q.includes("graph") || q.includes("function") || q.includes("plot")) return "Graph Plot";
      if (q.includes("triangle") || q.includes("geometry")) return "Geometry Diagram";
    }
    return "Generic Diagram";
  };

  const handleQuizAnswer = (questionIdx, optionIdx) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const submitQuiz = () => {
    let correct = 0;
    quizData.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correct++;
    });
    setQuizScore({ correct, total: quizData.length });
  };

  const handleSelectChat = (chat) => {
    setCurrentQuestion(chat.question);
    setAnswer(chat.answer);
    const chatSubject = SUBJECTS.find((s) => s.name === chat.subject);
    setAnswerLabel(`${chatSubject?.emoji} ${chat.subject}`);
    setCurrentChatId(chat.id);
    if (windowWidth <= 768) setSidebarOpen(false);
  };

  if (!user) return null;

  const subject = SUBJECTS[displayIdx];
  const accent = subject.color;
  const isMobile = windowWidth <= 768;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        background: "#0c0f18",
        backgroundImage: `
          radial-gradient(circle at 8% 15%, rgba(99,102,241,0.22) 0%, transparent 45%),
          radial-gradient(circle at 92% 78%, rgba(20,184,166,0.20) 0%, transparent 45%),
          radial-gradient(circle at 55% 45%, rgba(124,58,237,0.16) 0%, transparent 55%)
        `,
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        html, body { background: #0c0f18; }
        body { font-family: 'DM Sans', sans-serif; color: #111827; overflow-y: auto; }
        .tab { border: none; background: transparent; cursor: pointer; border-radius: 9px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #94a3b8; transition: all .2s; white-space: nowrap; padding: 9px 16px; }
        .tab.on { background: rgba(255,255,255,0.9); box-shadow: 0 8px 20px rgba(0,0,0,0.25); color: #111; font-weight: 700; }
        .answer-wrap {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0;
          margin-top: 20px;
          box-shadow: none;
          font-size: 16px;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
        @keyframes sheetUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: none } }
        .dot { width: 8px; height: 8px; border-radius: 50%; animation: bop .75s ease infinite; }
        .dot:nth-child(2) { animation-delay: .15s; }
        .dot:nth-child(3) { animation-delay: .3s; }
        @keyframes bop { 0%, 80%, 100% { transform: scale(.65); opacity: .4 } 40% { transform: scale(1); opacity: 1 } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.28); }
        .send { width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all .2s; font-weight: 700; }
        .send:active { transform: scale(.92); }
        .hero-word { display: inline-block; transition: opacity .32s ease, transform .32s ease; }
        .hero-word.out { opacity: 0; transform: translateY(14px); }

        .demo-card {
          cursor: pointer;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255,255,255,0.045);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color .35s ease;
          display: flex;
          flex-direction: column;
          min-height: 340px;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .demo-card:hover {
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 35px 80px rgba(0,0,0,0.5);
        }

        .diagram-stage {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: clamp(16px,3vw,28px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
          transform: perspective(1400px) rotateX(1.5deg);
        }

        .logo-badge-3d { transform: perspective(300px) rotateX(6deg); box-shadow: 0 10px 22px rgba(0,0,0,.35), 0 2px 0 rgba(255,255,255,.12) inset; }

        @media (max-width: 1024px) {
          main { padding: 24px !important; }
          .app-aside { width: 100% !important; max-width: 100% !important; position: relative !important; min-height: auto !important; max-height: none !important; top: auto !important; border-left: none !important; border-top: 1px solid rgba(255,255,255,.1); }
        }
        @media (max-width: 768px) {
          main { padding: 16px !important; padding-top: 72px !important; width: 100% !important; }
          textarea { font-size: 16px !important; }
          .answer-wrap { padding: 18px !important; border-radius: 18px !important; }
          .send { width: 44px !important; height: 44px !important; }
          .demo-card { min-height: 300px; }
        }
        @media (max-width: 600px) {
          h1 { font-size: 30px !important; }
          p { font-size: 14px !important; }
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        subject={subject}
        accent={accent}
        credits={credits}
        DAILY_CREDITS={DAILY_CREDITS}
        timeLeft={timeLeft}
        handleNewTask={handleNewTask}
        handleLogout={handleLogout}
        SUBJECTS={SUBJECTS}
        switchSubject={switchSubject}
        displayIdx={displayIdx}
        chatHistory={chatHistory}
        handleSelectChat={handleSelectChat}
        setChatHistory={setChatHistory}
        windowWidth={windowWidth}
      />

      {/* Mobile top bar — keeps the Intellia AI logo visible even when the sidebar drawer is closed */}
      {isMobile && !sidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            zIndex: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            background: "rgba(12,15,24,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e5e7eb",
              borderRadius: 10,
              width: 38,
              height: 38,
              cursor: "pointer",
              fontSize: 17,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ☰
          </button>
          <img
            src="/Intellia-ai.png"
            alt="Intellia AI"
            className="logo-badge-3d"
            style={{ height: 34, objectFit: "contain", borderRadius: 8 }}
          />
          <div style={{ width: 38 }} />
        </div>
      )}

      {/* Desktop-only collapsed-sidebar toggle */}
      {!isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed", left: 16, top: 16,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "#e5e7eb", borderRadius: 10, padding: "8px 12px", cursor: "pointer",
            fontSize: 18, zIndex: 50, boxShadow: "0 4px 14px rgba(0,0,0,.3)",
            display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42,
          }}
        >
          ☰
        </button>
      )}

      {/* Main */}
      <main
        style={{
          flex: 1,
          width: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "clamp(16px,4vw,48px)",
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: "100vh",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Hero */}
        {!answer && (
          <div style={{ textAlign: "center", marginBottom: 30, position: "relative", padding: "30px 20px" }}>
            <div
              style={{
                position: "absolute", top: "-50px", left: "50%", transform: "translateX(-50%)",
                width: "280px", height: "280px", background: `${accent}30`, filter: "blur(100px)",
                borderRadius: "50%", zIndex: 0,
              }}
            />
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px",
                borderRadius: 999, background: "rgba(255,255,255,0.08)", border: `1px solid ${accent}40`,
                color: accent, fontSize: 12, fontWeight: 700, marginBottom: 20,
                backdropFilter: "blur(12px)", position: "relative", zIndex: 2,
              }}
            >
              🚀 AI Learning Platform
            </div>

            <h1
              style={{
                fontSize: "clamp(30px,4vw,46px)", fontWeight: 800, lineHeight: 1.1,
                color: "#ffffff", letterSpacing: "-1px", marginBottom: 18, position: "relative", zIndex: 2,
              }}
            >
              Learn{" "}
              <span className={`hero-word${animating ? " out" : ""}`} style={{ color: accent, textShadow: `0 0 20px ${accent}` }}>
                {subject.name}
              </span>{" "}
              with Intellia AI
            </h1>

            <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 700, margin: "0 auto", lineHeight: 1.8, position: "relative", zIndex: 2 }}>
              Welcome back <strong style={{ color: "#fff" }}>{user.name}</strong>. Get visual explanations, AI-generated diagrams,
              quizzes, follow-up questions, and interactive learning experiences powered by Intellia AI.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 28, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
              {["🤖 AI Tutor", "📊 Smart Diagrams", "🧠 Interactive Quiz"].map((t) => (
                <div key={t} style={{ padding: "10px 18px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "6px", marginBottom: 28 }}>
          {subject.tabs.map((t, i) => (
            <button key={t} className={`tab${activeTab === i ? " on" : ""}`} onClick={() => setActiveTab(i)} title={`Switch to ${t}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div
          style={{
            maxWidth: 860, width: "100%", padding: "16px", borderRadius: 18,
            background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
            marginBottom: 12,
          }}
        >
          <input
            type="file" ref={fileInputRef} style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedFile(file);
            }}
          />

          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSolve();
              }
            }}
            placeholder={`Ask anything about ${subject.name}...`}
            style={{
              width: "100%", minHeight: 84, border: "none", outline: "none", resize: "none",
              fontSize: 15, color: "#f1f5f9", background: "transparent",
              fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7,
            }}
          />

          {selectedFile && (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{(selectedFile.size / 1024).toFixed(2)} KB</div>
              </div>
              <button onClick={() => setSelectedFile(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#f87171", fontSize: 16, fontWeight: 700 }}>
                ✕
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button" title="Attach" onClick={() => fileInputRef.current?.click()}
                style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", cursor: "pointer", color: "#e5e7eb", fontSize: 20, borderRadius: 8, padding: "6px 10px", position: "relative", zIndex: 5 }}
              >
                📎
              </button>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Enter ⏎ to send · Shift+Enter for new line</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${accent}22`, border: `1.5px solid ${accent}44`, borderRadius: 9, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, color: accent }}>
                {subject.emoji} {subject.tabs[activeTab]}
              </div>

              {credits <= 10 && credits > 0 && (
                <div style={{ fontSize: 11.5, color: "#fbbf24", fontWeight: 600, background: "rgba(251,191,36,0.14)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "4px 8px" }}>
                  ⚡ {credits} left
                </div>
              )}

              <button
                className="send"
                onClick={credits <= 0 ? () => setShowNoCredits(true) : handleSolve}
                disabled={loading || !inputValue.trim()}
                style={{
                  background: credits <= 0 ? "rgba(255,255,255,0.1)" : inputValue.trim() && !loading ? accent : "rgba(255,255,255,0.1)",
                  color: credits <= 0 ? "#64748b" : inputValue.trim() && !loading ? "#fff" : "#64748b",
                  opacity: loading || !inputValue.trim() ? 0.6 : 1,
                  cursor: credits <= 0 ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "⏳" : credits <= 0 ? "🚫" : "↑"}
              </button>
            </div>
          </div>
        </div>

        {answer && (
          <div className="mobile-tools" style={{ display: isMobile ? "flex" : "none", gap: 10, width: "100%", maxWidth: 860, margin: "15px 0" }}>
            <button onClick={() => setMobilePanel("follow")} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#4F46E5", color: "#fff", fontWeight: 600 }}>
              📖 Follow-up
            </button>
            <button onClick={() => setMobilePanel("quiz")} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#059669", color: "#fff", fontWeight: 600 }}>
              📝 Quiz
            </button>
          </div>
        )}

        {error && (
          <div style={{ width: "100%", maxWidth: 860, background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(252,165,165,0.4)", borderRadius: 12, padding: "14px 18px", color: "#fca5a5", fontSize: 14, fontWeight: 500, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#fca5a5", fontSize: 18 }}>
              ✕
            </button>
          </div>
        )}

        {loading && (
          <div style={{ width: "100%", maxWidth: 860, display: "flex", alignItems: "center", gap: 8, padding: "20px 0" }}>
            <div className="dot" style={{ background: accent }} />
            <div className="dot" style={{ background: accent }} />
            <div className="dot" style={{ background: accent }} />
            <span style={{ fontSize: 14, color: "#94a3b8", marginLeft: 6, fontWeight: 500 }}>Intellia is thinking…</span>
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div style={{ width: "100%", maxWidth: 1080, overflowX: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingLeft: 4 }}>
              <div
                className="logo-badge-3d"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg,${accent},#6366f1)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 800,
                }}
              >
                ia
              </div>
              <span style={{ fontWeight: 600, fontSize: 15, color: "#e5e7eb" }}>{answerLabel}</span>
              <button
                onClick={() => { setAnswer(""); setCurrentQuestion(""); }}
                style={{ marginLeft: "auto", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, color: "#94a3b8", fontFamily: "inherit", fontWeight: 600, transition: "all .15s" }}
              >
                Clear
              </button>
            </div>
            <div className="answer-wrap">
              <RichAnswer text={answer} accent={accent} />
              {quizData.length > 0 && (
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${accent}22` }}>
                  <div className="diagram-stage">
                    <DiagramVisualizer type={diagramType} subject={subject.name} accent={accent} />
                    <AdvancedDiagramRenderer topic={currentQuestion} subject={subject.name} accent={accent} />
                  </div>
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Key Elements</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, background: "rgba(255,255,255,0.06)", color: "#e2e8f0", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)" }}>• Structural Analysis</span>
                      <span style={{ fontSize: 12, background: "rgba(255,255,255,0.06)", color: "#e2e8f0", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)" }}>• Context: {subject.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Demo Cards */}
        {!answer && !loading && !error && (
          <div style={{ width: "100%", maxWidth: 860, marginTop: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: accent, marginBottom: 24, letterSpacing: "-0.5px" }}>
              Explore Learning Modules
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
              {subject.demos.map((card, i) => (
                <div
                  key={i}
                  className="demo-card"
                  onClick={() => handleDemo(card)}
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const px = (e.clientX - r.left) / r.width - 0.5;
                    const py = (e.clientY - r.top) / r.height - 0.5;
                    e.currentTarget.style.transform = `perspective(1000px) rotateX(${py * -10}deg) rotateY(${px * 10}deg) translateY(-6px)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ height: 140, background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, flexShrink: 0 }}>
                    {card.icon}
                  </div>
                  <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 17, color: "#f1f5f9", marginBottom: 8, lineHeight: 1.5, wordBreak: "break-word" }}>
                      {card.title}
                    </p>
                    <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, wordBreak: "break-word", flex: 1, marginBottom: 20 }}>
                      {card.desc}
                    </p>
                    <button
                      style={{ padding: "12px 18px", background: "linear-gradient(135deg,#4f46e5,#7c3aed,#06b6d4)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", width: "fit-content", boxShadow: "0 10px 25px rgba(79,70,229,.35)" }}
                    >
                      ✨ Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Right Panel - Quiz & Follow-up (desktop / tablet) */}
      {(answer || currentQuestion) && !loading && !isMobile && (
        <aside
          className="app-aside"
          style={{
            width: 360, maxWidth: "100%", background: "rgba(15,23,42,.85)", backdropFilter: "blur(25px)",
            display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,.1)",
            borderTop: "none", position: "relative", minHeight: "auto", maxHeight: "none",
            overflowY: "visible", flexShrink: 0,
          }}
        >
          <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Learning Assistant</h3>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Quiz, follow-ups and smart insights</p>
          </div>

          <div style={{ display: "flex", gap: 10, padding: "16px" }}>
            {["Follow-up", "Quiz"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setActivePanel(t);
                  if (t === "Quiz") { setQuizAnswers({}); setQuizScore(null); }
                }}
                style={{
                  flex: 1, border: "none", cursor: "pointer", borderRadius: 12, padding: "12px 18px",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: activePanel === t ? 700 : 600, fontSize: 13,
                  color: activePanel === t ? "#fff" : "#94a3b8",
                  background: activePanel === t ? `linear-gradient(135deg, ${accent}, #6366f1)` : "rgba(255,255,255,0.06)",
                  boxShadow: activePanel === t ? "0 10px 25px rgba(99,102,241,0.35)" : "none",
                  transition: "all .3s ease",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, padding: "18px 14px", overflowY: "auto" }}>
            {activePanel === "Follow-up" && (
              <FollowUpPanel questions={followUpQuestions} accent={accent} onSelect={(q) => setInputValue(q)} />
            )}
            {activePanel === "Quiz" && (
              <QuizPanel
                quiz={quizData} answers={quizAnswers} score={quizScore} accent={accent}
                onAnswer={handleQuizAnswer} onSubmit={submitQuiz}
                onRetake={() => { setQuizScore(null); setQuizAnswers({}); }}
              />
            )}
          </div>
        </aside>
      )}

      {/* Mobile bottom sheets */}
      {isMobile && mobilePanel === "follow" && (
        <MobileSheet title="Follow-up Questions" accent={accent} onClose={() => setMobilePanel(null)}>
          <FollowUpPanel questions={followUpQuestions} accent={accent} onSelect={(q) => { setInputValue(q); setMobilePanel(null); }} />
        </MobileSheet>
      )}
      {isMobile && mobilePanel === "quiz" && (
        <MobileSheet title="Quiz" accent={accent} onClose={() => setMobilePanel(null)}>
          <QuizPanel
            quiz={quizData} answers={quizAnswers} score={quizScore} accent={accent}
            onAnswer={handleQuizAnswer} onSubmit={submitQuiz}
            onRetake={() => { setQuizScore(null); setQuizAnswers({}); }}
          />
        </MobileSheet>
      )}

      {showNoCredits && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }}
          onClick={() => setShowNoCredits(false)}
        >
          <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", maxWidth: 420, width: "90%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.35)", animation: "fadeUp .3s ease" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 10, fontFamily: "'DM Serif Display',serif" }}>You're out of credits!</h2>
            <p style={{ fontSize: 14.5, color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>
              You've used all <strong>100 daily credits</strong>. Your credits will automatically reset in:
            </p>
            <div style={{ background: "linear-gradient(135deg,#eef2ff,#f5f3ff)", border: "2px solid #c7d2fe", borderRadius: 16, padding: "20px 24px", marginBottom: 28, fontFamily: "'DM Mono',monospace,monospace" }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: "#4f46e5", letterSpacing: "4px" }}>{timeLeft || "24:00:00"}</div>
              <div style={{ fontSize: 12, color: "#818cf8", marginTop: 6, fontWeight: 600 }}>HH : MM : SS</div>
            </div>
            <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${Math.round(((DAILY_CREDITS - credits) / DAILY_CREDITS) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 99 }} />
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 24 }}>{DAILY_CREDITS - credits} / {DAILY_CREDITS} credits used today</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowNoCredits(false)}
                style={{ flex: 1, padding: "14px", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 10px 25px rgba(99,102,241,.35)", transition: "all .3s ease" }}
              >
                ✨ Continue Learning
              </button>
              <button
                onClick={() => setShowNoCredits(false)}
                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#fff", boxShadow: "0 4px 12px rgba(79,70,229,.35)" }}
              >
                ⭐ Upgrade Plan
              </button>
            </div>
            <p style={{ fontSize: 11.5, color: "#d1d5db", marginTop: 14 }}>Free plan: 100 messages/day · Resets every 24 hours</p>
          </div>
        </div>
      )}
    </div>
  );
}
