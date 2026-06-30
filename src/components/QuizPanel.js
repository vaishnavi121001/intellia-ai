"use client";

import { useEffect, useRef } from "react";

// ─── KaTeX renderer component ────────────────────────────────────────────────
// Splits text on \(...\) and \[...\] delimiters and renders each part.
// Falls back to plain text if katex is not loaded yet.
function MathText({ text, style }) {
  if (!text) return null;

  // Split into segments: plain text vs inline math \(...\) vs display math \[...\]
  const segments = [];
  const regex = /\\\[(.+?)\\\]|\\\((.+?)\\\)/gs;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      segments.push({ type: "display", value: match[1] });
    } else {
      segments.push({ type: "inline", value: match[2] });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <span style={style}>
      {segments.map((seg, i) => {
        if (seg.type === "text") return <span key={i}>{seg.value}</span>;
        return (
          <KaTeXSpan
            key={i}
            latex={seg.value}
            displayMode={seg.type === "display"}
          />
        );
      })}
    </span>
  );
}

function KaTeXSpan({ latex, displayMode }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const render = () => {
      if (typeof window !== "undefined" && window.katex) {
        try {
          window.katex.render(latex, ref.current, {
            throwOnError: false,
            displayMode,
          });
        } catch (e) {
          if (ref.current) ref.current.textContent = latex;
        }
      } else {
        // KaTeX not loaded yet — show raw latex, retry after a tick
        if (ref.current) ref.current.textContent = latex;
        const timer = setTimeout(render, 200);
        return () => clearTimeout(timer);
      }
    };

    render();
  }, [latex, displayMode]);

  return (
    <span
      ref={ref}
      style={{ display: displayMode ? "block" : "inline" }}
    />
  );
}

// ─── KaTeX CSS loader (idempotent) ────────────────────────────────────────────
function useKaTeX() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load CSS
    if (!document.querySelector('link[data-katex-css]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
      link.setAttribute("data-katex-css", "true");
      document.head.appendChild(link);
    }

    // Load JS
    if (!window.katex && !document.querySelector('script[data-katex-js]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
      script.setAttribute("data-katex-js", "true");
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QuizPanel({
  quiz,
  answers,
  score,
  accent,
  onAnswer,
  onSubmit,
  onRetake,
}) {
  useKaTeX();

  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: "#bbb",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        📝 Quiz
      </div>

      {score ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {score.correct === score.total
              ? "🎉"
              : score.correct >= score.total / 2
              ? "✨"
              : "📚"}
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#111",
              marginBottom: 6,
            }}
          >
            Score: {score.correct}/{score.total}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              marginBottom: 16,
            }}
          >
            {score.correct === score.total
              ? "Perfect! You mastered this!"
              : score.correct >= score.total / 2
              ? "Great effort! Keep it up!"
              : "Good try! Review and retry!"}
          </p>
          <button
            onClick={onRetake}
            style={{
              background: accent,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Retake Quiz
          </button>
        </div>
      ) : (
        <div>
          {quiz.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#9ca3af",
              }}
            >
              <p>Loading quiz...</p>
            </div>
          ) : (
            <>
              {quiz.map((q, qIdx) => (
                <div key={qIdx} style={{ marginBottom: 18 }}>
                  {/* ── Question text with KaTeX ── */}
                  <p
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#ddd4d4",
                      marginBottom: 10,
                    }}
                  >
                    {qIdx + 1}.{" "}
                    <MathText text={q.q} />
                  </p>

                  <div>
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        onClick={() => onAnswer(qIdx, oIdx)}
                        style={{
                          padding: "14px 16px",
                          marginBottom: "10px",
                          border: `1.5px solid ${
                            answers[qIdx] === oIdx ? accent : "#e5e7eb"
                          }`,
                          borderRadius: "10px",
                          background:
                            answers[qIdx] === oIdx ? `${accent}10` : "#fff",
                          cursor: "pointer",
                          fontSize: "14px",
                          transition: "all .2s",
                        }}
                        onMouseEnter={(e) => {
                          if (answers[qIdx] !== oIdx) {
                            e.currentTarget.style.borderColor = "#d1d5db";
                            e.currentTarget.style.background = "#f9fafb";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (answers[qIdx] !== oIdx) {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.background = "#fff";
                          }
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              border: `2px solid ${
                                answers[qIdx] === oIdx ? accent : "#d1d5db"
                              }`,
                              background:
                                answers[qIdx] === oIdx ? accent : "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {answers[qIdx] === oIdx && "✓"}
                          </div>

                          {/* ── Option text with KaTeX ── */}
                          <MathText
                            text={opt}
                            style={{ fontSize: 13, color: "#1f2937" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={onSubmit}
                disabled={Object.keys(answers).length !== quiz.length}
                style={{
                  width: "100%",
                  padding: "12px",
                  background:
                    Object.keys(answers).length === quiz.length
                      ? accent
                      : "#e5e7eb",
                  color: "#272121",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor:
                    Object.keys(answers).length === quiz.length
                      ? "pointer"
                      : "not-allowed",
                  fontFamily: "inherit",
                  marginTop: 12,
                }}
              >
                Submit Quiz
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}