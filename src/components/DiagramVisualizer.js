"use client";

export default function DiagramVisualizer({ type, subject, accent }) {
  if (type.includes("Graph") || type.includes("Plot")) {
    return <QuadraticVisualization accent={accent} />;
  } else if (type.includes("Molecule")) {
    return <MoleculeVisualization accent={accent} />;
  } else if (type.includes("Cycle")) {
    return <CycleVisualization accent={accent} />;
  } else if (type.includes("Cell")) {
    return <CellVisualization accent={accent} />;
  } else if (type.includes("DNA")) {
    return <DNAVisualization accent={accent} />;
  } else if (type.includes("Motion")) {
    return <MotionVisualization accent={accent} />;
  } else if (type.includes("Force")) {
    return <ForceVisualization accent={accent} />;
  }

  return <DefaultVisualization accent={accent} />;
}

// ✅ MATHEMATICS - QUADRATIC FUNCTION WITH FORMULA
function QuadraticVisualization({ accent }) {
  // Example: f(x) = x² - 4x + 3
  // a=1, b=-4, c=3
  // vertex: h = -b/2a = 4/2 = 2, k = 4-8+3 = -1
  
  const a = 1, b = -4, c = 3;
  const h = -b / (2 * a); // vertex x
  const k = a * h * h + b * h + c; // vertex y

  // Generate points for parabola
  const points = [];
  for (let x = -1; x <= 5; x += 0.1) {
    const y = a * x * x + b * x + c;
    points.push({ x, y });
  }

  // Convert to SVG coordinates (scale and flip)
  const scale = 40; // pixels per unit
  const centerX = 350;
  const centerY = 200;

  const pathD = points
    .map((p, i) => {
      const sx = centerX + p.x * scale;
      const sy = centerY - p.y * scale;
      return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
    })
    .join(" ");

  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1.5px solid ${accent}22`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        📈 Quadratic Function
      </div>

      {/* Formula Box */}
      <div
        style={{
          background: `${accent}08`,
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          padding: "12px 16px",
          marginBottom: 16,
          fontSize: 13,
          fontFamily: "monospace",
          color: accent,
          fontWeight: 600,
        }}
      >
        <div>f(x) = x² - 4x + 3</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
          Vertex: ({h.toFixed(1)}, {k.toFixed(1)}) | Opens: {a > 0 ? "Upward ↑" : "Downward ↓"}
        </div>
      </div>

      {/* Graph */}
      <svg
        width="100%"
        height="300"
        viewBox="0 0 700 300"
        style={{
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {/* Grid */}
        {[...Array(11)].map((_, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={i * 70}
              y1="0"
              x2={i * 70}
              y2="300"
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="0"
              y1={i * 30}
              x2="700"
              y2={i * 30}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.5"
            />
          </g>
        ))}

        {/* Axes */}
        <line x1="50" y1="200" x2="650" y2="200" stroke={accent} strokeWidth="2" />
        <line x1="350" y1="250" x2="350" y2="50" stroke={accent} strokeWidth="2" />

        {/* Arrow heads */}
        <polygon points="650,200 640,195 640,205" fill={accent} />
        <polygon points="350,50 345,60 355,60" fill={accent} />

        {/* Axis labels */}
        <text x="670" y="205" fontSize="12" fill={accent} fontWeight="600">
          x
        </text>
        <text x="330" y="40" fontSize="12" fill={accent} fontWeight="600">
          y
        </text>

        {/* Parabola curve */}
        <path d={pathD} stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Vertex point */}
        <circle cx={centerX + h * scale} cy={centerY - k * scale} r="6" fill={accent} />
        <text
          x={centerX + h * scale}
          y={centerY - k * scale - 15}
          fontSize="11"
          fill={accent}
          fontWeight="700"
          textAnchor="middle"
        >
          Vertex ({h.toFixed(1)}, {k.toFixed(1)})
        </text>

        {/* Roots (x-intercepts) */}
        {[1, 3].map((root) => (
          <g key={`root-${root}`}>
            <circle cx={centerX + root * scale} cy={centerY} r="4" fill="#ef4444" />
            <text
              x={centerX + root * scale}
              y={centerY + 20}
              fontSize="10"
              fill="#ef4444"
              textAnchor="middle"
              fontWeight="600"
            >
              x={root}
            </text>
          </g>
        ))}

        {/* Y-intercept */}
        <circle cx={centerX} cy={centerY - c * scale} r="4" fill="#4f46e5" />
        <text
          x={centerX - 30}
          y={centerY - c * scale}
          fontSize="10"
          fill="#4f46e5"
          textAnchor="middle"
          fontWeight="600"
        >
          y-int: (0, {c})
        </text>
      </svg>

      {/* Key Points */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          style={{
            background: `${accent}08`,
            border: `1px solid ${accent}22`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 700, color: accent }}>Vertex Form</div>
          <div style={{ fontSize: 11, marginTop: 4, color: "#666", fontFamily: "monospace" }}>
            f(x) = (x - {h})²{k > 0 ? " + " : " "}{Math.abs(k)}
          </div>
        </div>
        <div
          style={{
            background: `${accent}08`,
            border: `1px solid ${accent}22`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 700, color: accent }}>Properties</div>
          <div style={{ fontSize: 11, marginTop: 4, color: "#666" }}>
            Opens: {a > 0 ? "↑" : "↓"} | Roots: 1, 3 | Y-int: {c}
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ CHEMISTRY - Molecule Structure
function MoleculeVisualization({ accent }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1.5px solid ${accent}22`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        🧪 Molecule Structure
      </div>
      <svg
        width="100%"
        height="300"
        viewBox="0 0 700 300"
        style={{
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {/* Central Carbon */}
        <circle cx="350" cy="150" r="20" fill={accent} />
        <text
          x="350"
          y="157"
          fontSize="14"
          fontWeight="bold"
          fill="#fff"
          textAnchor="middle"
        >
          C
        </text>

        {/* Bonds to Hydrogen */}
        {/* Top */}
        <line x1="350" y1="130" x2="350" y2="80" stroke={accent} strokeWidth="3" />
        <circle cx="350" cy="60" r="15" fill={accent} />
        <text
          x="350"
          y="67"
          fontSize="12"
          fontWeight="bold"
          fill="#fff"
          textAnchor="middle"
        >
          H
        </text>

        {/* Right */}
        <line x1="370" y1="150" x2="420" y2="150" stroke={accent} strokeWidth="3" />
        <circle cx="440" cy="150" r="15" fill={accent} />
        <text
          x="440"
          y="157"
          fontSize="12"
          fontWeight="bold"
          fill="#fff"
          textAnchor="middle"
        >
          H
        </text>

        {/* Bottom */}
        <line x1="350" y1="170" x2="350" y2="220" stroke={accent} strokeWidth="3" />
        <circle cx="350" cy="240" r="15" fill={accent} />
        <text
          x="350"
          y="247"
          fontSize="12"
          fontWeight="bold"
          fill="#fff"
          textAnchor="middle"
        >
          H
        </text>

        {/* Left */}
        <line x1="330" y1="150" x2="280" y2="150" stroke={accent} strokeWidth="3" />
        <circle cx="260" cy="150" r="15" fill={accent} />
        <text
          x="260"
          y="157"
          fontSize="12"
          fontWeight="bold"
          fill="#fff"
          textAnchor="middle"
        >
          H
        </text>

        {/* Label and Formula */}
        <text
          x="350"
          y="290"
          fontSize="14"
          fontWeight="bold"
          fill={accent}
          textAnchor="middle"
        >
          Methane (CH₄)
        </text>
      </svg>
    </div>
  );
}

// ✅ BIOLOGY - Cycle Process
function CycleVisualization({ accent }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1.5px solid ${accent}22`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        🔄 Cycle Process
      </div>
      <svg
        width="100%"
        height="300"
        viewBox="0 0 700 300"
        style={{
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {/* Defs for markers */}
        <defs>
          <marker
            id={`arrowhead-${accent}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill={accent} />
          </marker>
        </defs>

        {/* Circle */}
        <circle cx="350" cy="150" r="100" fill="none" stroke={accent} strokeWidth="2" />

        {/* 4 stages */}
        {[
          { angle: 0, label: "Stage 1", color: "#4F46E5" },
          { angle: 90, label: "Stage 2", color: "#059669" },
          { angle: 180, label: "Stage 3", color: "#D97706" },
          { angle: 270, label: "Stage 4", color: "#7C3AED" },
        ].map((stage, i) => {
          const rad = (stage.angle * Math.PI) / 180;
          const x = 350 + 100 * Math.cos(rad);
          const y = 150 + 100 * Math.sin(rad);

          const nextRad = ((stage.angle + 90) * Math.PI) / 180;
          const nextX = 350 + 100 * Math.cos(nextRad);
          const nextY = 150 + 100 * Math.sin(nextRad);

          return (
            <g key={`stage-${i}`}>
              <circle cx={x} cy={y} r="20" fill={stage.color} />
              <text
                x={x}
                y={y + 5}
                fontSize="12"
                fontWeight="bold"
                fill="#fff"
                textAnchor="middle"
              >
                {i + 1}
              </text>

              {/* Arrow to next stage */}
              <path
                d={`M ${x * 0.8 + 350 * 0.2} ${y * 0.8 + 150 * 0.2} Q ${(x + nextX) / 2} ${
                  (y + nextY) / 2 - 20
                } ${nextX * 0.8 + 350 * 0.2} ${nextY * 0.8 + 150 * 0.2}`}
                stroke={accent}
                strokeWidth="2"
                fill="none"
                markerEnd={`url(#arrowhead-${accent})`}
              />

              <text
                x={x}
                y={y + 40}
                fontSize="11"
                fill={accent}
                textAnchor="middle"
                fontWeight="600"
              >
                {stage.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ✅ BIOLOGY - Cell
function CellVisualization({ accent }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1.5px solid ${accent}22`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        🧬 Cell Structure
      </div>
      <svg
        width="100%"
        height="300"
        viewBox="0 0 700 300"
        style={{
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {/* Cell membrane */}
        <ellipse cx="350" cy="150" rx="120" ry="100" fill="none" stroke={accent} strokeWidth="2" />

        {/* Nucleus */}
        <circle cx="350" cy="150" r="50" fill={`${accent}20`} stroke={accent} strokeWidth="2" />
        <circle cx="350" cy="150" r="8" fill={accent} />
        <text
          x="350"
          y="200"
          fontSize="11"
          fill={accent}
          textAnchor="middle"
          fontWeight="600"
        >
          Nucleus
        </text>

        {/* Mitochondria */}
        <ellipse cx="280" cy="100" rx="20" ry="30" fill={`${accent}30`} stroke={accent} strokeWidth="1.5" />
        <text
          x="280"
          y="145"
          fontSize="10"
          fill={accent}
          textAnchor="middle"
          fontWeight="600"
        >
          Mitochondria
        </text>

        {/* Ribosome */}
        <circle cx="420" cy="100" r="12" fill={`${accent}30`} stroke={accent} strokeWidth="1.5" />
        <text
          x="420"
          y="145"
          fontSize="10"
          fill={accent}
          textAnchor="middle"
          fontWeight="600"
        >
          Ribosome
        </text>
      </svg>
    </div>
  );
}

// ✅ BIOLOGY - DNA
function DNAVisualization({ accent }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1.5px solid ${accent}22`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        🧬 DNA Double Helix
      </div>
      <svg
        width="100%"
        height="300"
        viewBox="0 0 700 300"
        style={{
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {/* Left strand */}
        <path
          d="M 250 50 Q 270 100 250 150 Q 230 200 250 250"
          stroke={accent}
          strokeWidth="3"
          fill="none"
        />

        {/* Right strand */}
        <path
          d="M 450 50 Q 430 100 450 150 Q 470 200 450 250"
          stroke={accent}
          strokeWidth="3"
          fill="none"
        />

        {/* Base pairs */}
        {[50, 100, 150, 200, 250].map((y) => (
          <g key={`bp-${y}`}>
            <line x1="250" y1={y} x2="450" y2={y} stroke={accent} strokeWidth="2" opacity="0.6" />
            <circle cx="250" cy={y} r="5" fill={accent} />
            <circle cx="450" cy={y} r="5" fill={accent} />
          </g>
        ))}

        <text
          x="350"
          y="290"
          fontSize="12"
          fontWeight="bold"
          fill={accent}
          textAnchor="middle"
        >
          DNA Structure
        </text>
      </svg>
    </div>
  );
}

// ✅ PHYSICS - Motion
function MotionVisualization({ accent }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1.5px solid ${accent}22`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        🚀 Motion Diagram
      </div>
      <svg
        width="100%"
        height="300"
        viewBox="0 0 700 300"
        style={{
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {/* Ground line */}
        <line x1="50" y1="250" x2="650" y2="250" stroke={accent} strokeWidth="2" />

        {/* Projectile path */}
        <path
          d="M 100 250 Q 350 100 600 250"
          stroke={accent}
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
        />

        {/* Position markers */}
        {[100, 200, 350, 500, 600].map((x) => {
          const y = 250 - Math.sin(((x - 100) / 500) * Math.PI) * 150;
          return (
            <g key={`pos-${x}`}>
              <circle cx={x} cy={y} r="8" fill={accent} />
              {/* Velocity vector */}
              <line x1={x} y1={y} x2={x + 30} y2={y - 20} stroke={accent} strokeWidth="2" />
              <polygon
                points={`${x + 30},${y - 20} ${x + 25},${y - 15} ${x + 28},${y - 23}`}
                fill={accent}
              />
            </g>
          );
        })}

        <text
          x="350"
          y="290"
          fontSize="12"
          fontWeight="bold"
          fill={accent}
          textAnchor="middle"
        >
          Projectile Motion
        </text>
      </svg>
    </div>
  );
}

// ✅ PHYSICS - Force Vectors
function ForceVisualization({ accent }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1.5px solid ${accent}22`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        ⚡ Force Vectors
      </div>
      <svg
        width="100%"
        height="300"
        viewBox="0 0 700 300"
        style={{
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {/* Object */}
        <rect x="320" y="120" width="60" height="60" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
        <text x="350" y="155" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">
          m
        </text>

        {/* Force 1 - Up */}
        <line x1="350" y1="120" x2="350" y2="40" stroke="#4F46E5" strokeWidth="3" />
        <polygon points="350,40 345,50 355,50" fill="#4F46E5" />
        <text x="330" y="35" fontSize="11" fill="#4F46E5" fontWeight="600">
          F₁
        </text>

        {/* Force 2 - Right */}
        <line x1="380" y1="150" x2="480" y2="150" stroke="#059669" strokeWidth="3" />
        <polygon points="480,150 470,145 470,155" fill="#059669" />
        <text x="500" y="145" fontSize="11" fill="#059669" fontWeight="600">
          F₂
        </text>

        {/* Force 3 - Down-Left */}
        <line x1="320" y1="180" x2="240" y2="240" stroke="#D97706" strokeWidth="3" />
        <polygon points="240,240 248,230 238,235" fill="#D97706" />
        <text x="210" y="255" fontSize="11" fill="#D97706" fontWeight="600">
          F₃
        </text>

        <text
          x="350"
          y="290"
          fontSize="12"
          fontWeight="bold"
          fill={accent}
          textAnchor="middle"
        >
          Force Equilibrium
        </text>
      </svg>
    </div>
  );
}

// ✅ DEFAULT
function DefaultVisualization({ accent }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1.5px solid ${accent}22`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        📊 Visualization
      </div>
      <svg
        width="100%"
        height="300"
        viewBox="0 0 700 300"
        style={{
          border: `1px solid ${accent}22`,
          borderRadius: 10,
          background: "#fff",
        }}
      >
        {/* Boxes */}
        <rect x="100" y="80" width="80" height="60" fill="none" stroke={accent} strokeWidth="2" />
        <text x="140" y="115" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">
          Input
        </text>

        <rect x="310" y="80" width="80" height="60" fill="none" stroke={accent} strokeWidth="2" />
        <text x="350" y="115" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">
          Process
        </text>

        <rect x="520" y="80" width="80" height="60" fill="none" stroke={accent} strokeWidth="2" />
        <text x="560" y="115" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">
          Output
        </text>

        {/* Arrows */}
        <line x1="180" y1="110" x2="310" y2="110" stroke={accent} strokeWidth="2" />
        <polygon points="310,110 300,105 300,115" fill={accent} />

        <line x1="390" y1="110" x2="520" y2="110" stroke={accent} strokeWidth="2" />
        <polygon points="520,110 510,105 510,115" fill={accent} />

        <text
          x="350"
          y="290"
          fontSize="12"
          fontWeight="bold"
          fill={accent}
          textAnchor="middle"
        >
          Process Flow
        </text>
      </svg>
    </div>
  );
}