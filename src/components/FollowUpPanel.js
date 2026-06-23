"use client";

export default function FollowUpPanel({ questions, accent, onSelect }) {
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
        ❓ Follow-up Questions
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            style={{
              textAlign: "left",
              background: "#f9fafb",
              border: "1.5px solid #e5e7eb",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: "#1f2937",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
              lineHeight: 1.5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = accent;
              e.currentTarget.style.background = `${accent}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.background = "#f9fafb";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}