"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInUser } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State to rotate through different active subjects automatically on the screen
  const [activeSubjectIdx, setActiveSubjectIdx] = useState(0);

  const subjects = [
    { name: "Quantum Physics", icon: "⚛️", color: "#6366f1", bgGlow: "rgba(99, 102, 241, 0.25)", desc: "Electromagnetic induction, mechanics, and light wave simulations." },
    { name: "Molecular Biology", icon: "🧬", color: "#10b981", bgGlow: "rgba(16, 185, 129, 0.25)", desc: "DNA sequencing models, cellular architecture, and genetics." },
    { name: "Organic Chemistry", icon: "🧪", color: "#8a1818", bgGlow: "rgba(245, 158, 11, 0.25)", desc: "Molecular structures, chemical bonds, and interactive reaction labs." },
    { name: "Advanced Mathematics", icon: "📐", color: "#ec4899", bgGlow: "rgba(236, 72, 153, 0.25)", desc: "Calculus spaces, matrix geometry, and dimensional vector graphing." },
    { name: "AI & Neural Systems", icon: "🧠", color: "#06b6d4", bgGlow: "rgba(6, 182, 212, 0.25)", desc: "Deep learning models, cognitive networks, and natural language logic." }
  ];

  // Rotate through the subjects seamlessly every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSubjectIdx((prev) => (prev + 1) % subjects.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [subjects.length]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await signInUser(email, password);

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0],
          email: user.email,
          grade: user.user_metadata?.grade || "",
          subjects: user.user_metadata?.subjects || [],
        })
      );

      router.push("/chat");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const currentSubject = subjects[activeSubjectIdx];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#7c7c8b",
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(130, 128, 160, 0.14) 0%, transparent 45%),
          radial-gradient(circle at 90% 80%, rgba(97, 132, 138, 0.74) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(119, 95, 158, 0.05) 0%, transparent 50%)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        
        fontFamily: "'DM Sans', sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Dynamic Native Style Injection for Dashboard-accurate High Fidelity Graphics */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes dynamicOrbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
          @keyframes floating3D {
  0%, 100% { transform: translateY(0) rotateY(0deg); }
  50% { transform: translateY(-8px) rotateY(5deg); }
}

.logo-3d-float {
  animation: floating3D 4s ease-in-out infinite;
  perspective: 1000px;
  display: inline-flex;
}
        @keyframes float3D {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
          50% { transform: translateY(-12px) scale(1.03) rotate(2deg); }
        }
        @keyframes nodePulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        .glass-panel-main {
          background: rgba(10, 14, 26, 0.8);
          backdrop-filter: blur(35px);
          -webkit-backdrop-filter: blur(35px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.7);
        }
        .form-input-field {
          background: rgba(6, 9, 18, 0.75) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .form-input-field:focus {
          border-color: ${currentSubject.color} !important;
          box-shadow: 0 0 20px ${currentSubject.bgGlow} !important;
          background: rgba(12, 18, 36, 0.9) !important;
        }
        .action-button-core {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%) !important;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3) !important;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .action-button-core:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px ${currentSubject.bgGlow} !important;
          filter: brightness(1.15);
        }
        .matrix-subject-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.3s ease;
        }
        .matrix-subject-item.active {
          background: rgba(255, 255, 255, 0.05);
          border-color: ${currentSubject.color}40;
        }
          @media (max-width: 1024px) {
  .glass-panel-main {
    width: 95% !important;
  }
}

@media (max-width: 768px) {
  .glass-panel-main {
    flex-direction: column !important;
    width: 95% !important;
    margin: 20px auto !important;
  }
}

@media (max-width: 480px) {
  .glass-panel-main {
    border-radius: 20px !important;
  }
}
      `}} />

      {/* Cybernetic Particle Mesh Nodes */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
        <div style={{ position: "absolute", width: "6px", height: "6px", background: "#6366f1", borderRadius: "50%", top: "15%", left: "25%", animation: "nodePulse 3s infinite ease-in-out" }} />
        <div style={{ position: "absolute", width: "8px", height: "8px", background: "#06b6d4", borderRadius: "50%", bottom: "20%", left: "40%", animation: "nodePulse 4s infinite ease-in-out" }} />
        <div style={{ position: "absolute", width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", top: "35%", right: "20%", animation: "nodePulse 2.5s infinite ease-in-out" }} />
      </div>

      {/* Main Structural Layout Box Frame */}
      <div
        className="glass-panel-main"
        style={{
  width: "95%",
  maxWidth: "1160px",
  minHeight: "clamp(550px,80vh,750px)",
  borderRadius: "32px",
  display: "flex",
  flexWrap: "wrap",
  overflow: "hidden",
  zIndex: 2,
}}
      >
        {/* LEFT CANVAS LAYOUT: Multidisciplinary 3D Hub Projection */}
        <div
          style={{
            flex: "1 1 500px",
            
background: "rgba(18, 23, 24, 0.4)",
            padding: "clamp(20px,4vw,50px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
{/* Top Brand Logo Panel */}
<div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
  <div className="logo-3d-float" style={{ 
    background: "rgb(243, 236, 236)", 
    padding: "10px 16px", 
    borderRadius: "12px", 
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    width: "fit-content"
  }}>
    <img 
      src="/Intellia-ai.png" 
      alt="Intellia AI Logo" 
      style={{ height: "25px" }} 
    />
  </div>
  <p style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>
    Your Cross-Subject Learning Companion
  </p>
</div>

          {/* Core Visualizer Viewport: Interactive Dynamic 3D Subject Projector */}
          <div style={{ margin: "30px 0", position: "relative" }}>

            {/* Background 3D Energy Rings */}
            <div style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              border: `2px dashed ${currentSubject.color}`,
              opacity: 0.15,
              borderRadius: "50%",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              animation: "dynamicOrbit 20s linear infinite"
            }} />

            <div style={{ position: "relative", width: "fit-content", margin: "0 auto 35px auto" }}>
              {/* Floating Hologram Base Ring */}
              <div style={{
                position: "absolute",
                width: "170px",
                height: "170px",
                background: `radial-gradient(circle, ${currentSubject.bgGlow} 0%, transparent 70%)`,
                borderRadius: "50%",
                top: "-10px",
                left: "-10px",
              }} />

              {/* Dynamic Core Subject Container Icon */}
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "28px",
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.3) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "76px",
                  border: `1px solid ${currentSubject.color}60`,
                  boxShadow: `0 0 40px ${currentSubject.bgGlow}, inset 0 0 15px rgba(255,255,255,0.05)`,
                  animation: "float3D 5s ease-in-out infinite",
                  transition: "all 0.5s ease",
                }}
              >
                {currentSubject.icon}
              </div>

              <div style={{
                position: "absolute",
                bottom: "-6px",
                right: "-6px",
                background: currentSubject.color,
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "900",
                padding: "4px 10px",
                borderRadius: "8px",
                boxShadow: `0 0 15px ${currentSubject.color}`,
                transition: "all 0.5s ease"
              }}>
                AI TUTOR ACTIVE
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#ffffff", marginBottom: "12px", letterSpacing: "-0.5px" }}>
                Explore <span style={{ color: currentSubject.color, transition: "color 0.5s ease" }}>{currentSubject.name}</span>
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "14.5px", lineHeight: "1.6", maxWidth: "420px", margin: "0 auto", height: "48px", transition: "all 0.5s" }}>
                {currentSubject.desc}
              </p>
            </div>
          </div>

          {/* Bottom Live System Matrix Feeds (Lists out all supported curriculum targets) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#6366f1", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "4px" }}>
              Synchronized Learning Modules
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {subjects.map((sub, i) => {
                const isActive = i === activeSubjectIdx;
                return (
                  <div
                    key={i}
                    className={`matrix-subject-item ${isActive ? "active" : ""}`}
                    style={{
                      borderRadius: "14px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      opacity: isActive ? 1 : 0.45,
                      transform: isActive ? "scale(1.02)" : "scale(1)"
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{sub.icon}</span>
                    <span style={{ color: "#ffffff", fontSize: "12.5px", fontWeight: "600" }}>{sub.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT CANVAS LAYOUT: Gateway Form Entry Access Box */}
        <div
          style={{
            flex: 1,
            padding: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "rgba(5, 7, 16, 0.4)",
          }}
        >
          <form onSubmit={handleSignIn} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>

            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.25)",
                color: "#22d3ee",
                fontSize: "11px",
                fontWeight: "700",
                marginBottom: "16px",
                letterSpacing: "0.5px"
              }}>
                🔥 12 Day Active Streak Verified
              </div>

              <h3 style={{ fontSize: "34px", fontWeight: "900", color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
                Welcome back
              </h3>
              <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0 }}>
                Sign in to sync your multi-subject dashboards and metrics.
              </p>
            </div>

            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "12px",
                padding: "14px",
                color: "#f87171",
                fontSize: "13px",
                fontWeight: "500"
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Input fields panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "11px", color: "#94a3b8", letterSpacing: "0.5px" }}>
                  STUDENT ID / NETWORK EMAIL
                </label>
                <input
                  type="email"
                  className="form-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vaishnavi@student.com"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ fontWeight: "700", fontSize: "11px", color: "#94a3b8", letterSpacing: "0.5px" }}>SECURITY PASSPHRASE</label>
                  <a href="#" style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none", fontWeight: "600" }}>Forgot Keys?</a>
                </div>
                <input
                  type="password"
                  className="form-input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            {/* Account preservation checkbox */}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#64748b" }}>
              <input type="checkbox" style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#4f46e5" }} />
              <span>Remember account matrix instance</span>
            </label>

            {/* Portal verification entry submit trigger */}
            <button
              type="submit"
              disabled={loading}
              className="action-button-core"
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "14px",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Establishing System Synapses..." : "Launch Universal Learning Hub"}
            </button>

            {/* Micro Quick-Metric Tags */}
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", marginTop: "10px" }}>
              {["Mechanics", "DNA Models", "Calculus Space", "Organic Labs"].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    color: "#475569",
                    fontSize: "11px",
                    fontWeight: "600"
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Platform Account Navigation link */}
            <div style={{ textAlign: "center", fontSize: "13.5px", color: "#64748b", marginTop: "5px" }}>
              New identity node?{" "}
              <a href="/auth/signup" style={{ color: "#818cf8", fontWeight: "700", textDecoration: "none" }}>
                Create Platform ID
              </a>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}