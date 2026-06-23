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
      {
        title: "Solve complex equations", desc: "Solve a system of 3 linear equations", bg: "#EEF2FF", icon: "∑",
      },
      {
        title: "Visualize functions", desc: "Plot and analyze quadratic functions", bg: "#F0FDF4", icon: "📈",
      },
      {
        title: "Analyze problems", desc: "Up to 60 problems — calculus, algebra, geometry", bg: "#FFF7ED", icon: "🧮",
      },
    ],
  },
  {
    name: "Chemistry", emoji: "⚗️", color: "#059669", light: "#ECFDF5", tabs: ["AI Solver"],
    demos: [
      {
        title: "Teaching material", desc: "Make a class 11 worksheet on chemical bonding", bg: "#ECFDF5", icon: "🧪",
      },
      {
        title: "Explain concepts", desc: "Explain benzene resonance structures", bg: "#EFF6FF", icon: "⚗️",
      },
      {
        title: "Analyze problems", desc: "Stoichiometry, thermodynamics, organic reactions", bg: "#FFF7ED", icon: "🔬",
      },
    ],
  },
  {
    name: "Biology", emoji: "🧬", color: "#10361e", light: "#F0FDF4",
    tabs: ["AI Solver"],
    demos: [
      {
        title: "Visualize processes", desc: "Diagram the steps of mitosis with labels", bg: "#F0FDF4", icon: "🧬",
      },
      {
        title: "Simplify concepts", desc: "Explain DNA transcription vs translation", bg: "#EFF6FF", icon: "🔬",
      },
      {
        title: "Create study notes", desc: "Summarize the human digestive system", bg: "#FFF7ED", icon: "📚",
      },
    ],
  },
  {
    name: "Physics", emoji: "⚡", color: "#372c20", light: "#FFFBEB", tabs: ["AI Solver"],
    demos: [
      {
        title: "Simulate motion", desc: "Projectile motion with angle and velocity", bg: "#FFFBEB", icon: "🚀",
      },
      {
        title: "Explain laws", desc: "Newton's 3 laws with real-world examples", bg: "#EEF2FF", icon: "⚡",
      },
      {
        title: "Solve numericals", desc: "Optics, electromagnetism, thermodynamics", bg: "#F0FDF4", icon: "🌡️",
      },
    ],
  },
  {
    name: "AI", emoji: "🤖",
    color: "#7C3AED", light: "#F5F3FF", tabs: ["AI Explainer"],
    demos: [
      {
        title: "Understand ML algorithms", desc: "Explain gradient descent with diagrams", bg: "#F5F3FF", icon: "🤖",
      },
      {
        title: "Code & debug AI models", desc: "Build a simple neural network in Python", bg: "#ECFDF5", icon: "🧠",
      },
      {
        title: "Compare AI architectures", desc: "CNN vs RNN vs Transformer breakdown", bg: "#FFF7ED", icon: "📊",
      },
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
    console.log("📤 Sending to /api/chat:", {
      systemPromptLength: systemPrompt?.length,
      messagesCount: messages?.length,
    });

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt,
        messages,
        maxTokens,
      }),
    });

    console.log("📨 API Response Status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ API Error:", errorData);
      throw new Error(
        errorData.error ||
        errorData.details ||
        `API error ${res.status}`
      );
    }

    const data = await res.json();
    console.log("✅ Got response from API");

    if (!data.text) {
      throw new Error("No text in response");
    }

    return data.text;
  } catch (err) {
    console.error("❌ groqChat error:", err);
    throw err;
  }
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activePanel, setActivePanel] = useState("Follow-up");
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const cycleRef = useRef(null);
  const inputRef = useRef(null);

  // Load user
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

  // Load chat history
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

  // Credits system
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

  // Credits timer
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
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
          s
        ).padStart(2, "0")}`
      );
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
      } catch { }
    }
    localStorage.setItem(CREDIT_KEY, JSON.stringify({ credits: newCredits, resetAt }));
  };

  // Auto-cycle subjects
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
    setLoading(true);
    setAnswer("");
    setError("");
    setCurrentQuestion(question);
    setAnswerLabel(`${subject.emoji} ${subject.name}`);
    setQuizData([]);
    setFollowUpQuestions([]);

    deductCredit();

    try {
      console.log(
        "🎯 Starting chat with question:",
        question.substring(0, 50)
      );

      // Get user ID
      let userId = user?.id;
      if (!userId) {
        userId = user?.email || `user_${Date.now()}`;
        const updatedUser = { ...user, id: userId };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Build system prompt
      const systemPrompt = buildSystemPrompt(subject.name, subject.tabs[activeTab]);
      console.log("📋 System prompt length:", systemPrompt.length);

      // Call Groq
      const text = await groqChat({
        systemPrompt,
        messages: [{ role: "user", content: question }],
        maxTokens: 4000,
      });

      console.log("📝 Got AI response, parsing...");

      // Parse response
      const { answerText, quiz, followUp } = parseResponse(text);

      console.log(
        "✅ Parsed response - Quiz:",
        quiz.length,
        "FollowUp:",
        followUp.length
      );

      setAnswer(answerText);
      setQuizData(quiz.length > 0 ? quiz : generateFallbackQuiz(subject.name));
      setFollowUpQuestions(
        followUp.length > 0 ? followUp : generateFallbackFollowUp()
      );
      setDiagramType(detectDiagramType(question, subject.name));
      setInputValue("");

      // Save to chat history
      const chatTitle =
        question.substring(0, 50) + (question.length > 50 ? "..." : "");
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

      console.log("💾 Chat saved to history");
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
        {
          q: "What is the derivative of 3x²?",
          options: ["6x", "3x", "x", "2x"],
          correct: 0,
        },
        {
          q: "Solve: x + 5 = 12",
          options: ["x = 7", "x = 17", "x = 2", "x = 8"],
          correct: 0,
        },
        {
          q: "What is sin(90°)?",
          options: ["1", "0", "0.5", "-1"],
          correct: 0,
        },
        {
          q: "Find the area of circle with radius 5",
          options: ["25π", "10π", "50π", "100π"],
          correct: 0,
        },
        {
          q: "What is log₁₀(100)?",
          options: ["2", "1", "10", "100"],
          correct: 0,
        },
      ],
      Chemistry: [
        {
          q: "What is the atomic number of Oxygen?",
          options: ["8", "6", "7", "9"],
          correct: 0,
        },
        {
          q: "What is the pH of neutral water?",
          options: ["7", "0", "14", "1"],
          correct: 0,
        },
        {
          q: "How many electrons in Cl⁻ ion?",
          options: ["18", "17", "16", "19"],
          correct: 0,
        },
        {
          q: "What is oxidation state of N in NO₂?",
          options: ["+4", "+3", "+2", "+5"],
          correct: 0,
        },
        {
          q: "Which bond is strongest?",
          options: ["Triple bond", "Double bond", "Single bond", "Ionic"],
          correct: 0,
        },
      ],
      Biology: [
        {
          q: "How many chromosomes do humans have?",
          options: ["46", "23", "48", "50"],
          correct: 0,
        },
        {
          q: "Powerhouse of cell?",
          options: ["Mitochondria", "Nucleus", "Ribosome", "Lysosome"],
          correct: 0,
        },
        {
          q: "Plants make food via?",
          options: ["Photosynthesis", "Respiration", "Fermentation", "Digestion"],
          correct: 0,
        },
        {
          q: "DNA strands in double helix?",
          options: ["2", "1", "3", "4"],
          correct: 0,
        },
        {
          q: "Enzyme that breaks DNA?",
          options: ["DNase", "Protease", "Lipase", "Amylase"],
          correct: 0,
        },
      ],
      Physics: [
        {
          q: "What is Newton's 1st Law?",
          options: [
            "F=ma",
            "Object stays at rest unless acted upon",
            "Action-reaction",
            "Energy conservation",
          ],
          correct: 1,
        },
        {
          q: "Speed of light?",
          options: ["3×10⁸ m/s", "3×10⁵ m/s", "3×10⁶ m/s", "3×10⁹ m/s"],
          correct: 0,
        },
        {
          q: "What is SI unit of force?",
          options: ["Newton", "Joule", "Watt", "Pascal"],
          correct: 0,
        },
        {
          q: "Define velocity?",
          options: ["Speed only", "Speed with direction", "Acceleration", "Distance/time"],
          correct: 1,
        },
        {
          q: "What is acceleration?",
          options: ["Change in velocity", "Speed", "Distance", "Time"],
          correct: 0,
        },
      ],
      AI: [
        {
          q: "What is a neural network?",
          options: [
            "Network of interconnected neurons",
            "Only biological neurons",
            "Computer memory",
            "Internet connection",
          ],
          correct: 0,
        },
        {
          q: "What does backpropagation do?",
          options: [
            "Updates weights based on errors",
            "Deletes old data",
            "Forwards input",
            "Prints output",
          ],
          correct: 0,
        },
        {
          q: "What is activation function?",
          options: [
            "Introduces non-linearity",
            "Activates computer",
            "Turns on AI",
            "Connects networks",
          ],
          correct: 0,
        },
        {
          q: "What does CNN mean?",
          options: [
            "Convolutional Neural Network",
            "Computer Network",
            "Connected Nodes",
            "Central Neural Net",
          ],
          correct: 0,
        },
        {
          q: "What is dropout in neural networks?",
          options: [
            "Randomly disables neurons during training",
            "Removes data",
            "Stops training",
            "Closes connections",
          ],
          correct: 0,
        },
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
      if (q.includes("structure") || q.includes("bond") || q.includes("molecule"))
        return "Molecule Structure";
      if (q.includes("cycle") || q.includes("reaction")) return "Reaction Cycle";
    }

    if (subject === "Biology") {
      if (q.includes("mitosis") || q.includes("meiosis") || q.includes("cell"))
        return "Cell Cycle";
      if (q.includes("photosynthesis") || q.includes("respiration"))
        return "Process Cycle";
      if (q.includes("dna") || q.includes("protein")) return "DNA Structure";
    }

    if (subject === "Physics") {
      if (q.includes("graph") || q.includes("motion") || q.includes("velocity"))
        return "Motion Diagram";
      if (q.includes("force") || q.includes("energy")) return "Force Diagram";
    }

    if (subject === "Mathematics") {
      if (q.includes("graph") || q.includes("function") || q.includes("plot"))
        return "Graph Plot";
      if (q.includes("triangle") || q.includes("geometry"))
        return "Geometry Diagram";
    }

    return "Generic Diagram";
  };

  const handleQuizAnswer = (questionIdx, optionIdx) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
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
  };

  if (!user) return null;

  const subject = SUBJECTS[displayIdx];
  const accent = subject.color;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#4a5263",
        backgroundImage: `
      radial-gradient(circle at 10% 20%, rgb(121, 121, 151) 0%, transparent 45%),
      radial-gradient(circle at 90% 80%, rgb(95, 151, 161) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgb(103, 133, 158) 0%, transparent 50%)
    `,
      }}
    >      <style>{`
        * { box-sizing: border-box; margin: 0; }
        body {
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #c5c7c9 0%, #eef2ff 50%, #f5f3ff 100%);
  color: #111827;
  overflow-y: auto;
}
        .tab { border: none; background: transparent; cursor: pointer; border-radius: 9px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #666; transition: all .2s; white-space: nowrap; }
        .tab.on { background: #eae8ef; box-shadow: 0 1px 3px rgba(0,0,0,.08); color: #111; font-weight: 600; }
.card {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all .35s ease;
} 
         .card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0,0,0,0.12);
}
        .sbtn { display: flex; align-items: center; gap: 8px; border: none; cursor: pointer; padding: 10px 12px; border-radius: 10px; text-align: left; width: 100%; font-family: inherit; font-size: 13.5px; transition: all .15s; }
        .answer-wrap {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 24px;
  padding: 32px;
  margin-top: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}
  .tab.on {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  color: #111827;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
        .dot { width: 8px; height: 8px; border-radius: 50%; animation: bop .75s ease infinite; }
        .dot:nth-child(2) { animation-delay: .15s; }
        .dot:nth-child(3) { animation-delay: .3s; }
        @keyframes bop { 0%, 80%, 100% { transform: scale(.65); opacity: .4 } 40% { transform: scale(1); opacity: 1 } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .send { width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all .2s; font-weight: 700; }
        .send:active { transform: scale(.92); }
        .hero-word { display: inline-block; transition: opacity .32s ease, transform .32s ease; }
        .hero-word.out { opacity: 0; transform: translateY(14px); }
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
      />

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 32px 64px", overflowY: "auto" }}>
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{
            position: "fixed", left: 16, top: 16, background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 18, color: "#6b7280", zIndex: 50, boxShadow: "0 2px 8px rgba(0,0,0,.08)", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40
          }}>☰</button>
        )}

        {/* Hero */}
        {!answer && (
          <div
            style={{
              textAlign: "center",
              marginBottom: 50,
              position: "relative",
              padding: "30px 20px",
            }}
          >
            {/* Glow Effect */}
            <div
              style={{
                position: "absolute",
                top: "-50px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "280px",
                height: "280px",
                background: `${accent}30`,
                filter: "blur(100px)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />

            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${accent}40`,
                color: accent,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 20,
                backdropFilter: "blur(12px)",
                position: "relative",
                zIndex: 2,
              }}
            >
              🚀 AI Learning Platform
            </div>

            {/* Main Heading */}
            <h1
              style={{
                fontSize: "clamp(30px,4vw,46px)",
                fontWeight: 800,
                lineHeight: 1.1,
                color: "#ffffff",
                letterSpacing: "-1px",
                marginBottom: 18,
                position: "relative",
                zIndex: 2,
              }}
            >
              Learn{" "}
              <span
                className={`hero-word${animating ? " out" : ""}`}
                style={{
                  color: accent,
                  textShadow: `0 0 20px ${accent}`,
                }}
              >
                {subject.name}
              </span>{" "}
              with Intellia AI
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 18,
                color: "#94a3b8",
                maxWidth: 700,
                margin: "0 auto",
                lineHeight: 1.8,
                position: "relative",
                zIndex: 2,
              }}
            >
              Welcome back <strong style={{ color: "#fff" }}>{user.name}</strong>.
              Get visual explanations, AI-generated diagrams, quizzes, follow-up
              questions, and interactive learning experiences powered by Intellia AI.
            </p>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginTop: 28,
                flexWrap: "wrap",
                position: "relative",
                zIndex: 2,
              }}
            >
              <div style={{ padding: "10px 18px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                🤖 AI Tutor
              </div>

              <div style={{ padding: "10px 18px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                📊 Smart Diagrams
              </div>

              <div style={{ padding: "10px 18px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                🧠 Interactive Quiz
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 2, background: "rgba(255, 255, 255, 0.44)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "6px", marginBottom: 28
        }}>
          {subject.tabs.map((t, i) => (
            <button
              key={t} className={`tab${activeTab === i ? " on" : ""}`} onClick={() => setActiveTab(i)} title={`Switch to ${t}`}> {t} </button>))}</div>

        {/* Input Box */}
        <div style={{
          width: "100%", maxWidth: 860, border: "1.5px solid #e5e7eb", borderRadius: 18, padding: "20px 24px", background: "rgb(236, 225, 225)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)", boxShadow: "0 1px 3px rgba(0,0,0,.05)", marginBottom: 12
        }}>
          <textarea ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSolve(); }} placeholder={`Ask anything about ${subject.name}...`} style={{ width: "100%", minHeight: 84, border: "none", outline: "none", resize: "none", fontSize: 15, color: "#111", background: "transparent", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><button title="Attach" style={{ background: "none", border: "1.5px solid #e5e7eb", cursor: "pointer", color: "#9ca3af", fontSize: 15, borderRadius: 8, padding: "6px 10px", transition: "all .15s" }}>📎</button>
              <span style={{ fontSize: 12, color: "#d1d5db" }}>⌘+Enter</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: subject.light, border: `1.5px solid ${accent}22`, borderRadius: 9, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, color: accent }}>
                {subject.emoji} {subject.tabs[activeTab]}
              </div>
              {credits <= 10 && credits > 0 && (
                <div style={{ fontSize: 11.5, color: "#d97706", fontWeight: 600, background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "4px 8px" }}>
                  ⚡ {credits} left
                </div>
              )}
              <button
                className="send"
                onClick={credits <= 0 ? () => setShowNoCredits(true) : handleSolve}
                disabled={loading || !inputValue.trim()}
                title={
                  credits <= 0
                    ? "No credits left"
                    : "Send (⌘+Enter)"
                }
                style={{
                  background:
                    credits <= 0
                      ? "#e5e7eb"
                      : inputValue.trim() && !loading
                        ? accent
                        : "#e5e7eb",
                  color:
                    credits <= 0
                      ? "#9ca3af"
                      : inputValue.trim() && !loading
                        ? "#fff"
                        : "#d1d5db",
                  opacity: loading || !inputValue.trim() ? 0.6 : 1,
                  cursor: credits <= 0 ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "⏳" : credits <= 0 ? "🚫" : "↑"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ width: "100%", maxWidth: 860, background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 12, padding: "14px 18px", color: "#DC2626", fontSize: 14, fontWeight: 500, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#DC2626", fontSize: 18 }}>
              ✕
            </button>
          </div>
        )}

        {/* Loading dots */}
        {loading && (
          <div style={{ width: "100%", maxWidth: 860, display: "flex", alignItems: "center", gap: 8, padding: "20px 0" }}>
            <div className="dot" style={{ background: accent }} />
            <div className="dot" style={{ background: accent }} />
            <div className="dot" style={{ background: accent }} />
            <span style={{ fontSize: 14, color: "#9ca3af", marginLeft: 6, fontWeight: 500 }}>Intellia is thinking…</span>
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div style={{ width: "100%", maxWidth: 860 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingLeft: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${accent},#6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 }}>ia</div>
              <span style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>
                {answerLabel}
              </span>
              <button onClick={() => { setAnswer(""); setCurrentQuestion(""); }} style={{ marginLeft: "auto", background: "none", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, color: "#9ca3af", fontFamily: "inherit", fontWeight: 600, transition: "all .15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#6b7280"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#9ca3af"; }}>Clear</button>
            </div>
            <div className="answer-wrap">
              <RichAnswer text={answer} accent={accent} />
              {quizData.length > 0 && (
                <div
                  style={{
                    marginTop: 32, paddingTop: 24, borderTop: `1px solid ${accent}22`,
                  }}
                >

                  <DiagramVisualizer
                    type={diagramType}
                    subject={subject.name}
                    accent={accent}
                  />
                  <AdvancedDiagramRenderer
                    topic={currentQuestion}
                    subject={subject.name}
                    accent={accent}
                  />
                  {/* New Professional Info Table/List */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                    <p style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Key Elements</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: 12, background: "#fff", padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}>• Structural Analysis</span>
                      <span style={{ fontSize: 12, background: "#fff", padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}>• Context: {subject.name}</span>
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
            <h2
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: accent,
                marginBottom: 24,
                letterSpacing: "-0.5px",
              }}
            >
              Explore Learning Modules
            </h2>
            <div
              style={{
                display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20,
              }}
            >

              {subject.demos.map((card, i) => (
                <div
                  key={i}
                  onClick={() => handleDemo(card)}
                  style={{
                    cursor: "pointer",
                    borderRadius: "24px",
                    overflow: "hidden",
                    background: "rgb(240, 231, 231)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                    transition: "all 0.45s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "perspective(1000px) rotateX(8deg) rotateY(-8deg) translateY(-12px)";
                    e.currentTarget.style.boxShadow =
                      "0 35px 80px rgba(99,102,241,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow =
                      "0 20px 50px rgba(0,0,0,0.15)";
                  }}
                >
                  <div
                    style={{
                      height: 140,
                      background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 64,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ padding: "18px 20px" }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 6, lineHeight: 1.4 }}>{card.title}</p>
                    <p style={{ fontSize: 13.5, color: "#6b7280", marginBottom: 14, lineHeight: 1.5 }}>{card.desc}</p>
                    <button
                      style={{
                        background:
                          "linear-gradient(135deg,#4f46e5,#7c3aed,#06b6d4)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        padding: "10px 18px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 10px 25px rgba(79,70,229,.35)",
                      }}
                    >
                      ✨ Explore
                    </button>                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

     {/* Right Panel - Quiz & Follow-up */}
{(answer || currentQuestion) && !loading && (
  <aside
    style={{
      width: 360,
      background: "rgba(15,23,42,0.75)",
      backdropFilter: "blur(25px)",
      borderLeft: "1px solid rgba(255, 255, 255, 0.98)",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      maxHeight: "100vh",
      overflowY: "auto",
      boxShadow: "-10px 0 40px rgba(0,0,0,0.15)",
    }}
  >
    {/* Header */}
    <div
      style={{
        padding: "24px 20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <h3
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "#fff",
          marginBottom: 6,
        }}
      >
        Learning Assistant
      </h3>

      <p
        style={{
          fontSize: 13,
          color: "#94a3b8",
        }}
      >
        Quiz, follow-ups and smart insights
      </p>
    </div>

    {/* Tabs */}
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "16px",
      }}
    >
      {["Follow-up", "Quiz"].map((t) => (
        <button
          key={t}
          onClick={() => {
            setActivePanel(t);

            if (t === "Quiz") {
              setQuizAnswers({});
              setQuizScore(null);
            }
          }}
          style={{
            flex: 1,
            border: "none",
            cursor: "pointer",
            borderRadius: 12,
            padding: "12px 18px",
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: activePanel === t ? 700 : 600,
            fontSize: 13,
            color: activePanel === t ? "#fff" : "#94a3b8",
            background:
              activePanel === t
                ? `linear-gradient(135deg, ${accent}, #6366f1)`
                : "rgba(255, 255, 255, 0.95)",
            boxShadow:
              activePanel === t
                ? "0 10px 25px rgba(99,102,241,0.35)"
                : "none",
            transition: "all .3s ease",
          }}
        >
          {t}
        </button>
      ))}
    </div>

    {/* Content */}
    <div
      style={{
        flex: 1,
        padding: "18px 14px",
        overflowY: "auto",
      }}
    >
      {activePanel === "Follow-up" && (
        <FollowUpPanel
          questions={followUpQuestions}
          accent={accent}
          onSelect={(q) => setInputValue(q)}
        />
      )}

      {activePanel === "Quiz" && (
        <QuizPanel
          quiz={quizData}
          answers={quizAnswers}
          score={quizScore}
          accent={accent}
          onAnswer={handleQuizAnswer}
          onSubmit={submitQuiz}
          onRetake={() => {
            setQuizScore(null);
            setQuizAnswers({});
          }}
        />
      )}
    </div>
  </aside>
)}

      {showNoCredits && (<div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }} onClick={() => setShowNoCredits(false)}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", maxWidth: 420, width: "90%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.2)", animation: "fadeUp .3s ease" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 10, fontFamily: "'DM Serif Display',serif" }}>You're out of credits!</h2>
          <p style={{ fontSize: 14.5, color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>You've used all <strong>100 daily credits</strong>. Your credits will automatically reset in:</p>
          <div style={{ background: "linear-gradient(135deg,#eef2ff,#f5f3ff)", border: "2px solid #c7d2fe", borderRadius: 16, padding: "20px 24px", marginBottom: 28, fontFamily: "'DM Mono',monospace,monospace" }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: "#4f46e5", letterSpacing: "4px" }}>{timeLeft || "24:00:00"}</div>
            <div style={{ fontSize: 12, color: "#818cf8", marginTop: 6, fontWeight: 600 }}>HH : MM : SS</div>
          </div>
          <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ width: `${Math.round(((DAILY_CREDITS - credits) / DAILY_CREDITS) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 99 }} />
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 24, }}>{DAILY_CREDITS - credits} / {DAILY_CREDITS} credits used today</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowNoCredits(false)}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderRadius: 14,
                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(99,102,241,.35)",
                transition: "all .3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-3px) scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0) scale(1)";
              }}
            >
              ✨ Continue Learning
            </button>
            <button onClick={() => setShowNoCredits(false)}
              style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#fff", boxShadow: "0 4px 12px rgba(79,70,229,.35)", }}
            >⭐ Upgrade Plan
            </button>
          </div>
          <p style={{ fontSize: 11.5, color: "#d1d5db", marginTop: 14 }}> Free plan: 100 messages/day · Resets every 24 hours</p>
        </div>
      </div>
      )}
    </div>
  );
}