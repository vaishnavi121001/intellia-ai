"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

function katexHTML(expr) {
  try {
    return katex.renderToString(expr, { throwOnError: false, output: "html" });
  } catch {
    return expr;
  }
}

// ─── Math-expression fallback parser ───────────────────────────────────────
// The LLM now supplies exact coefficients via the `data` prop. This regex
// parser is ONLY a safety net for when that's missing (e.g. an older cached
// response) — it reads the raw question text instead.
function parseCoefficient(raw, defaultVal = 1) {
  if (raw === undefined) return null;
  const s = raw.replace(/\s+/g, "");
  if (s === "" || s === "+") return defaultVal;
  if (s === "-") return -defaultVal;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function parseMathExpression(text) {
  if (!text) return null;
  const normalized = text.replace(/²/g, "^2");

  const quadRegex = /([+-]?\s*\d*\.?\d*)\s*x\s*\^2\s*([+-]\s*\d*\.?\d*)\s*x\b(?:\s*([+-]\s*\d+\.?\d*))?/i;
  const qm = normalized.match(quadRegex);
  if (qm) {
    const a = parseCoefficient(qm[1], 1);
    const b = parseCoefficient(qm[2], 1);
    const c = qm[3] !== undefined ? parseFloat(qm[3].replace(/\s+/g, "")) : 0;
    if (a !== null && b !== null && a !== 0) return { kind: "quadratic", a, b, c: isNaN(c) ? 0 : c };
  }

  const linGraphRegex = /(?:y|f\(x\))\s*=\s*([+-]?\s*\d*\.?\d*)\s*x\s*([+-]\s*\d+\.?\d*)?/i;
  const lgm = normalized.match(linGraphRegex);
  if (lgm) {
    const m = parseCoefficient(lgm[1], 1);
    const c = lgm[2] !== undefined ? parseFloat(lgm[2].replace(/\s+/g, "")) : 0;
    if (m !== null) return { kind: "linear", m, c: isNaN(c) ? 0 : c };
  }

  const solveRegex = /([+-]?\s*\d*\.?\d*)\s*x\s*([+-]\s*\d+\.?\d*)?\s*=\s*([+-]?\s*\d+\.?\d*)/i;
  const sm = normalized.match(solveRegex);
  if (sm) {
    const a = parseCoefficient(sm[1], 1);
    const b = sm[2] !== undefined ? parseFloat(sm[2].replace(/\s+/g, "")) : 0;
    const rhs = parseFloat(sm[3].replace(/\s+/g, ""));
    if (a !== null && a !== 0 && !isNaN(rhs)) return { kind: "linear_solve", a, b: isNaN(b) ? 0 : b, rhs };
  }

  return null;
}

function solveQuadraticRoots(a, b, c) {
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  if (disc === 0) return [-b / (2 * a)];
  const sqrtDisc = Math.sqrt(disc);
  return [(-b - sqrtDisc) / (2 * a), (-b + sqrtDisc) / (2 * a)].sort((x, y) => x - y);
}

// Normalize the LLM's `data` shape (kind/a/b/c or m/c or a/b/rhs) into the
// same internal shape the parser produces, so both sources feed one path.
function resolveMathData(data, question) {
  if (data && data.kind) return data;
  const parsed = parseMathExpression(question || "");
  return parsed;
}

// ─── Shared premium card shell ─────────────────────────────────────────────
function DiagramCard({ accent, label, children }) {
  const [icon, ...rest] = (label || "").split(" ");
  const text = rest.join(" ");
  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.transform = `perspective(1000px) rotateX(${py * -5}deg) rotateY(${px * 5}deg) translateY(-4px)`;
      }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"; }}
      style={{
        background: `linear-gradient(160deg, ${accent}12 0%, #ffffff 55%)`,
        border: `1.5px solid ${accent}30`,
        borderRadius: 18,
        padding: "22px",
        boxShadow: `0 20px 40px ${accent}18, 0 4px 14px rgba(0,0,0,0.08)`,
        transition: "transform .25s ease, box-shadow .25s ease",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 8px 18px ${accent}55` }}>
          {icon}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#1e293b", letterSpacing: ".01em", textTransform: "uppercase" }}>{text}</div>
      </div>
      {children}
    </div>
  );
}

const bd = (a) => ({ border: `1px solid ${a}22`, borderRadius: 10, background: "#fff" });

// ─── Main entry point ───────────────────────────────────────────────────────
export default function DiagramVisualizer({ type, subject, accent, question, title, data }) {
  switch (type) {
    case "math_graph": return <DynamicMathVisualization accent={accent} question={question} data={data} />;
    case "geometry_diagram": return <GeometryVisualization accent={accent} />;

    // Chemistry
    case "molecule_structure": return <MoleculeVisualization accent={accent} />;
    case "bohr_model": return <BohrModelVisualization accent={accent} />;
    case "orbital": return <BohrModelVisualization accent={accent} label="⚛️ Electron Orbitals" />;
    case "ionic_bond": return <IonicBondVisualization accent={accent} />;
    case "covalent_bond": return <CovalentBondVisualization accent={accent} />;
    case "vsepr_theory": return <VSEPRVisualization accent={accent} />;
    case "ph_scale": return <PHScaleVisualization accent={accent} />;
    case "benzene_structure": return <BenzeneVisualization accent={accent} />;
    case "periodic_table": return <PeriodicTableVisualization accent={accent} />;
    case "electrolysis": return <ElectrolysisVisualization accent={accent} />;

    // Biology
    case "cell_cycle": return <CycleVisualization accent={accent} />;
    case "mitosis": return <MitosisVisualization accent={accent} />;
    case "meiosis": return <MeiosisVisualization accent={accent} />;
    case "plant_cell": return <PlantCellVisualization accent={accent} />;
    case "animal_cell": return <CellVisualization accent={accent} />;
    case "dna_structure": return <DNAVisualization accent={accent} />;
    case "photosynthesis": return <PhotosynthesisVisualization accent={accent} />;
    case "food_chain": return <FoodChainVisualization accent={accent} />;
    case "punnett_square": return <PunnettSquareVisualization accent={accent} />;
    case "nervous_system": return <NervousSystemVisualization accent={accent} />;
    case "heart": return <HeartVisualization accent={accent} />;
    case "brain": return <BrainVisualization accent={accent} />;
    case "digestive_system": return <DigestiveSystemVisualization accent={accent} />;
    case "respiratory_system": return <RespiratorySystemVisualization accent={accent} />;
    case "circulatory_system": return <CirculatorySystemVisualization accent={accent} />;
    case "kidney": return <KidneyVisualization accent={accent} />;
    case "eye": return <EyeVisualization accent={accent} />;
    case "ear": return <EarVisualization accent={accent} />;
    case "human_skeleton": return <SkeletonVisualization accent={accent} />;
    case "muscle": return <MuscleVisualization accent={accent} />;

    // Physics
    case "motion_diagram": return <MotionVisualization accent={accent} />;
    case "force_diagram": return <ForceVisualization accent={accent} />;
    case "collision": return <CollisionVisualization accent={accent} />;
    case "energy_transfer": return <EnergyTransferVisualization accent={accent} />;
    case "wave": return <WaveVisualization accent={accent} />;
    case "interference": return <InterferenceVisualization accent={accent} />;
    case "diffraction": return <DiffractionVisualization accent={accent} />;
    case "electric_field": return <ElectricFieldVisualization accent={accent} />;
    case "circuit_diagram": return <CircuitVisualization accent={accent} />;
    case "ray_diagram": return <RayDiagramVisualization accent={accent} />;
    case "lens": return <RayDiagramVisualization accent={accent} label="🔍 Lens Diagram" />;
    case "mirror": return <MirrorVisualization accent={accent} />;

    // AI / CS
    case "neural_network": return <NeuralNetworkVisualization accent={accent} />;
    case "cnn": return <CNNVisualization accent={accent} />;
    case "rnn": return <RNNVisualization accent={accent} />;
    case "attention": return <AttentionVisualization accent={accent} />;
    case "gradient_descent": return <GradientDescentVisualization accent={accent} />;
    case "algorithm_flow": return <AlgorithmFlowVisualization accent={accent} />;
    case "osi_model": return <OSIModelVisualization accent={accent} />;
    case "tcp_ip": return <TCPIPVisualization accent={accent} />;
    case "router": return <RouterVisualization accent={accent} />;
    case "switch": return <SwitchVisualization accent={accent} />;
    case "dns": return <DNSVisualization accent={accent} />;
    case "http": return <HTTPVisualization accent={accent} />;
    case "compiler": return <CompilerVisualization accent={accent} />;
    case "linked_list": return <LinkedListVisualization accent={accent} data={data} />;
    case "stack": return <StackVisualization accent={accent} data={data} />;
    case "queue": return <QueueVisualization accent={accent} data={data} />;
    case "binary_tree": return <BinaryTreeVisualization accent={accent} data={data} />;
    case "bst": return <BinaryTreeVisualization accent={accent} data={data} label="🌳 Binary Search Tree" />;
    case "hash_table": return <HashTableVisualization accent={accent} />;

    default: return <DefaultVisualization accent={accent} />;
  }
}

// ══════════════════════════ MATHEMATICS ═══════════════════════════════════

function DynamicMathVisualization({ accent, question, data }) {
  const parsed = resolveMathData(data, question);

  if (parsed?.kind === "linear_solve") {
    const { a, b, rhs } = parsed;
    const x = (rhs - b) / a;
    const eq = `${a !== 1 ? a : ""}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${rhs}`;
    return (
      <DiagramCard accent={accent} label="🔢 Solving for x">
        <div style={{ background: `${accent}0d`, border: `1px solid ${accent}25`, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
          <div dangerouslySetInnerHTML={{ __html: katexHTML(eq) }} />
          <div style={{ marginTop: 10, fontSize: 14, color: "#334155" }} dangerouslySetInnerHTML={{ __html: katexHTML(`x = \\frac{${rhs} ${b >= 0 ? "-" : "+"} ${Math.abs(b)}}{${a}} = ${Number.isInteger(x) ? x : x.toFixed(2)}`) }} />
        </div>
        <svg width="100%" height="140" viewBox="0 0 700 140" style={bd(accent)}>
          <line x1="40" y1="70" x2="660" y2="70" stroke={accent} strokeWidth="2" />
          {[...Array(11)].map((_, i) => {
            const tickVal = Math.round(x) - 5 + i, tx = 40 + i * 62;
            return (<g key={i}><line x1={tx} y1="62" x2={tx} y2="78" stroke={accent} strokeWidth="1.5" /><text x={tx} y="98" fontSize="11" fill="#64748b" textAnchor="middle">{tickVal}</text></g>);
          })}
          <circle cx={40 + 5 * 62} cy="70" r="8" fill="#ef4444" />
          <text x={40 + 5 * 62} y="45" fontSize="13" fontWeight="700" fill="#ef4444" textAnchor="middle">x = {Number.isInteger(x) ? x : x.toFixed(2)}</text>
        </svg>
      </DiagramCard>
    );
  }

  const isExample = !parsed;
  const a = parsed?.kind === "quadratic" ? parsed.a : 1;
  const b = parsed?.kind === "quadratic" ? parsed.b : -4;
  const c = parsed?.kind === "quadratic" ? parsed.c : 3;
  const isLinear = parsed?.kind === "linear";
  const m = isLinear ? parsed.m : null;
  const lc = isLinear ? parsed.c : null;

  const h = -b / (2 * a);
  const k = a * h * h + b * h + c;
  const roots = solveQuadraticRoots(a, b, c);

  const points = [];
  if (isLinear) { for (let x = -5; x <= 5; x += 0.5) points.push({ x, y: m * x + lc }); }
  else { for (let x = h - 5; x <= h + 5; x += 0.1) points.push({ x, y: a * x * x + b * x + c }); }

  const scale = 40, centerX = 350, centerY = 200;
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${centerX + p.x * scale} ${centerY - p.y * scale}`).join(" ");

  return (
    <DiagramCard accent={accent} label={isLinear ? "📈 Linear Function" : "📈 Quadratic Function"}>
      <div style={{ background: `${accent}0d`, border: `1px solid ${accent}25`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, fontSize: 15, color: accent }}>
        <div dangerouslySetInnerHTML={{ __html: katexHTML(isLinear ? `y = ${m}x ${lc >= 0 ? "+" : "-"} ${Math.abs(lc)}` : `f(x) = ${a !== 1 ? a : ""}x^2 ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x ${c >= 0 ? "+" : "-"} ${Math.abs(c)}`) }} />
        {isExample && <span style={{ fontStyle: "italic", fontWeight: 400, color: "#999", fontSize: 12 }}>(example — no equation found)</span>}
        {!isLinear && <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Vertex: ({h.toFixed(1)}, {k.toFixed(1)}) | Opens: {a > 0 ? "Upward ↑" : "Downward ↓"}</div>}
        {isLinear && <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Slope: {m} | Y-intercept: {lc}</div>}
      </div>
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        {[...Array(11)].map((_, i) => (<g key={i}><line x1={i * 70} y1="0" x2={i * 70} y2="300" stroke="#e5e7eb" strokeWidth="1" opacity="0.5" /><line x1="0" y1={i * 30} x2="700" y2={i * 30} stroke="#e5e7eb" strokeWidth="1" opacity="0.5" /></g>))}
        <line x1="50" y1="200" x2="650" y2="200" stroke={accent} strokeWidth="2" />
        <line x1="350" y1="250" x2="350" y2="50" stroke={accent} strokeWidth="2" />
        <polygon points="650,200 640,195 640,205" fill={accent} /><polygon points="350,50 345,60 355,60" fill={accent} />
        <text x="670" y="205" fontSize="12" fill={accent} fontWeight="600">x</text><text x="330" y="40" fontSize="12" fill={accent} fontWeight="600">y</text>
        <path d={pathD} stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
        {!isLinear && (<>
          <circle cx={centerX + h * scale} cy={centerY - k * scale} r="6" fill={accent} />
          <text x={centerX + h * scale} y={centerY - k * scale - 15} fontSize="11" fill={accent} fontWeight="700" textAnchor="middle">Vertex ({h.toFixed(1)}, {k.toFixed(1)})</text>
          {roots.map((root) => (<g key={root}><circle cx={centerX + root * scale} cy={centerY} r="4" fill="#ef4444" /><text x={centerX + root * scale} y={centerY + 20} fontSize="10" fill="#ef4444" textAnchor="middle" fontWeight="600">x={root.toFixed(2)}</text></g>))}
        </>)}
        <circle cx={centerX} cy={centerY - (isLinear ? lc : c) * scale} r="4" fill="#4f46e5" />
        <text x={centerX - 30} y={centerY - (isLinear ? lc : c) * scale} fontSize="10" fill="#4f46e5" textAnchor="middle" fontWeight="600">y-int: (0, {isLinear ? lc : c})</text>
      </svg>
    </DiagramCard>
  );
}

function GeometryVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="📐 Geometry Diagram">
      <div style={{ background: `${accent}0d`, border: `1px solid ${accent}25`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, fontSize: 16, color: accent }}>
        <div dangerouslySetInnerHTML={{ __html: katexHTML("a^2 + b^2 = c^2") }} />
        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Right-angled triangle: base, height and hypotenuse</div>
      </div>
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <polygon points="150,250 500,250 500,80" fill={`${accent}10`} stroke={accent} strokeWidth="3" />
        <rect x="475" y="225" width="25" height="25" fill="none" stroke={accent} strokeWidth="2" />
        <text x="325" y="275" fontSize="14" fill={accent} textAnchor="middle" fontWeight="700">base (b)</text>
        <text x="525" y="170" fontSize="14" fill={accent} fontWeight="700">height (a)</text>
        <text x="290" y="155" fontSize="14" fill={accent} fontWeight="700">hypotenuse (c)</text>
      </svg>
    </DiagramCard>
  );
}

// ══════════════════════════ CHEMISTRY ══════════════════════════════════════

function MoleculeVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🧪 Molecule Structure">
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <circle cx="350" cy="150" r="20" fill={accent} /><text x="350" y="157" fontSize="14" fontWeight="bold" fill="#fff" textAnchor="middle">C</text>
        <line x1="350" y1="130" x2="350" y2="80" stroke={accent} strokeWidth="3" /><circle cx="350" cy="60" r="15" fill={accent} /><text x="350" y="67" fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">H</text>
        <line x1="370" y1="150" x2="420" y2="150" stroke={accent} strokeWidth="3" /><circle cx="440" cy="150" r="15" fill={accent} /><text x="440" y="157" fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">H</text>
        <line x1="350" y1="170" x2="350" y2="220" stroke={accent} strokeWidth="3" /><circle cx="350" cy="240" r="15" fill={accent} /><text x="350" y="247" fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">H</text>
        <line x1="330" y1="150" x2="280" y2="150" stroke={accent} strokeWidth="3" /><circle cx="260" cy="150" r="15" fill={accent} /><text x="260" y="157" fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">H</text>
        <text x="350" y="290" fontSize="14" fontWeight="bold" fill={accent} textAnchor="middle">Methane (CH₄)</text>
      </svg>
    </DiagramCard>
  );
}

function BohrModelVisualization({ accent, label }) {
  return (
    <DiagramCard accent={accent} label={label || "⚛️ Bohr Model"}>
      <svg width="100%" height="300" viewBox="0 0 300 300" style={bd(accent)}>
        <circle cx="150" cy="150" r="16" fill={accent} /><text x="150" y="155" fontSize="11" fill="#fff" textAnchor="middle" fontWeight="700">+</text>
        {[45, 80, 115].map((r) => (<circle key={r} cx="150" cy="150" r={r} fill="none" stroke={accent} strokeWidth="1.5" opacity="0.5" />))}
        {[{ r: 45, ang: 30, c: "#ef4444" }, { r: 45, ang: 210, c: "#ef4444" }, { r: 80, ang: 100, c: "#3b82f6" }, { r: 80, ang: 280, c: "#3b82f6" }, { r: 115, ang: 60, c: "#22c55e" }].map((e, i) => {
          const rad = (e.ang * Math.PI) / 180;
          return <circle key={i} cx={150 + e.r * Math.cos(rad)} cy={150 + e.r * Math.sin(rad)} r="6" fill={e.c} />;
        })}
        <text x="150" y="280" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">Nucleus + Electron Shells</text>
      </svg>
    </DiagramCard>
  );
}

function IonicBondVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🧂 Ionic Bond">
      <svg width="100%" height="250" viewBox="0 0 400 250" style={bd(accent)}>
        <circle cx="80" cy="125" r="30" fill="none" stroke={accent} strokeWidth="2" /><circle cx="80" cy="125" r="5" fill={accent} /><text x="80" y="130" fontSize="14" fill="#111" fontWeight="700" textAnchor="middle">Na⁺</text>
        <circle cx="320" cy="125" r="30" fill="none" stroke={accent} strokeWidth="2" /><circle cx="320" cy="125" r="5" fill={accent} /><text x="320" y="130" fontSize="14" fill="#111" fontWeight="700" textAnchor="middle">Cl⁻</text>
        <line x1="115" y1="125" x2="285" y2="125" stroke={accent} strokeWidth="2" /><polygon points="285,125 275,120 275,130" fill={accent} />
        <text x="200" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">Electron transfers Na → Cl</text>
      </svg>
    </DiagramCard>
  );
}

function CovalentBondVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🔗 Covalent Bond">
      <svg width="100%" height="250" viewBox="0 0 400 250" style={bd(accent)}>
        <circle cx="100" cy="125" r="25" fill="none" stroke={accent} strokeWidth="2" /><circle cx="100" cy="125" r="5" fill={accent} />
        <circle cx="300" cy="125" r="25" fill="none" stroke={accent} strokeWidth="2" /><circle cx="300" cy="125" r="5" fill={accent} />
        <circle cx="165" cy="115" r="3" fill="#ef4444" /><circle cx="165" cy="135" r="3" fill="#ef4444" />
        <line x1="130" y1="125" x2="270" y2="125" stroke={accent} strokeWidth="3" />
        <text x="200" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">Shared electron pair</text>
      </svg>
    </DiagramCard>
  );
}

function VSEPRVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🔺 VSEPR Geometry">
      <svg width="100%" height="250" viewBox="0 0 250 250" style={bd(accent)}>
        <circle cx="125" cy="125" r="15" fill={accent} />
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180, x = 125 + 65 * Math.cos(rad), y = 125 + 65 * Math.sin(rad);
          return (<g key={angle}><line x1="125" y1="125" x2={x} y2={y} stroke={accent} strokeWidth="2" /><circle cx={x} cy={y} r="10" fill="#fff" stroke={accent} strokeWidth="2" /></g>);
        })}
        <text x="125" y="230" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">Tetrahedral Geometry</text>
      </svg>
    </DiagramCard>
  );
}

function PHScaleVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🧫 pH Scale">
      <svg width="100%" height="230" viewBox="0 0 400 230" style={bd(accent)}>
        {[...Array(15)].map((_, i) => (<rect key={i} x={20 + i * 24} y="80" width="22" height="80" rx="4" fill={i < 7 ? `rgba(239,68,68,${0.9 - i * 0.08})` : i === 7 ? "#94a3b8" : `rgba(59,130,246,${0.2 + (i - 7) * 0.1})`} />))}
        <text x="40" y="60" fontSize="11" fill="#ef4444" fontWeight="700">Acidic</text><text x="180" y="60" fontSize="11" fill="#64748b" fontWeight="700">Neutral (7)</text><text x="320" y="60" fontSize="11" fill="#3b82f6" fontWeight="700">Basic</text>
      </svg>
    </DiagramCard>
  );
}

function BenzeneVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="⬡ Benzene Ring">
      <svg width="100%" height="250" viewBox="0 0 250 250" style={bd(accent)}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180, next = ((angle + 60) * Math.PI) / 180;
          return <line key={i} x1={125 + 50 * Math.cos(rad)} y1={125 + 50 * Math.sin(rad)} x2={125 + 50 * Math.cos(next)} y2={125 + 50 * Math.sin(next)} stroke={accent} strokeWidth="3" />;
        })}
        <circle cx="125" cy="125" r="30" fill="none" stroke={accent} strokeWidth="2" opacity="0.5" />
        <text x="125" y="225" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">Benzene (C₆H₆)</text>
      </svg>
    </DiagramCard>
  );
}

function PeriodicTableVisualization({ accent }) {
  const groups = [{ label: "H", color: "#f59e0b" }, { label: "He", color: "#a855f7" }, { label: "Li", color: "#ef4444" }, { label: "Be", color: "#f97316" }, { label: "B", color: "#22c55e" }, { label: "C", color: "#22c55e" }, { label: "N", color: "#22c55e" }, { label: "O", color: "#22c55e" }, { label: "F", color: "#3b82f6" }, { label: "Ne", color: "#a855f7" }, { label: "Na", color: "#ef4444" }, { label: "Mg", color: "#f97316" }, { label: "Al", color: "#94a3b8" }, { label: "Si", color: "#22c55e" }, { label: "P", color: "#22c55e" }, { label: "S", color: "#22c55e" }, { label: "Cl", color: "#3b82f6" }, { label: "Ar", color: "#a855f7" }];
  return (
    <DiagramCard accent={accent} label="🧬 Periodic Table (excerpt)">
      <svg width="100%" height="180" viewBox="0 0 700 180" style={bd(accent)}>
        {groups.map((el, i) => {
          const col = i < 2 ? (i === 0 ? 0 : 17) : i - 2, row = i < 2 ? 0 : i < 10 ? 1 : 2;
          const x = 20 + col * 38, y = 20 + row * 52;
          return (<g key={el.label}><rect x={x} y={y} width="32" height="44" rx="6" fill={el.color} opacity="0.85" /><text x={x + 16} y={y + 28} fontSize="13" fontWeight="700" fill="#fff" textAnchor="middle">{el.label}</text></g>);
        })}
      </svg>
    </DiagramCard>
  );
}

function ElectrolysisVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🔋 Electrolysis">
      <svg width="100%" height="260" viewBox="0 0 400 260" style={bd(accent)}>
        <rect x="60" y="40" width="280" height="160" rx="8" fill="#dbeafe" stroke={accent} strokeWidth="2" />
        <line x1="150" y1="10" x2="150" y2="50" stroke="#334155" strokeWidth="4" /><line x1="250" y1="10" x2="250" y2="50" stroke="#334155" strokeWidth="4" />
        <text x="150" y="0" fontSize="11" fill="#334155" fontWeight="700" textAnchor="middle">Cathode (-)</text><text x="250" y="0" fontSize="11" fill="#334155" fontWeight="700" textAnchor="middle">Anode (+)</text>
        {[145, 150, 155].map((x, i) => (<circle key={i} cx={x} cy={60 + i * 15} r="3" fill="#3b82f6" />))}
        {[245, 250, 255].map((x, i) => (<circle key={i} cx={x} cy={60 + i * 15} r="3" fill="#f97316" />))}
        <text x="200" y="230" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">Ion migration under electric current</text>
      </svg>
    </DiagramCard>
  );
}

// ══════════════════════════ BIOLOGY ════════════════════════════════════════

function CycleVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🔄 Cycle Process">
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <defs><marker id={`ah-${accent}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill={accent} /></marker></defs>
        <circle cx="350" cy="150" r="100" fill="none" stroke={accent} strokeWidth="2" />
        {[{ angle: 0, label: "Stage 1", color: "#4F46E5" }, { angle: 90, label: "Stage 2", color: "#059669" }, { angle: 180, label: "Stage 3", color: "#D97706" }, { angle: 270, label: "Stage 4", color: "#7C3AED" }].map((stage, i) => {
          const rad = (stage.angle * Math.PI) / 180, x = 350 + 100 * Math.cos(rad), y = 150 + 100 * Math.sin(rad);
          const nextRad = ((stage.angle + 90) * Math.PI) / 180, nx = 350 + 100 * Math.cos(nextRad), ny = 150 + 100 * Math.sin(nextRad);
          return (<g key={i}><circle cx={x} cy={y} r="20" fill={stage.color} /><text x={x} y={y + 5} fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">{i + 1}</text><path d={`M ${x * 0.8 + 70} ${y * 0.8 + 30} Q ${(x + nx) / 2} ${(y + ny) / 2 - 20} ${nx * 0.8 + 70} ${ny * 0.8 + 30}`} stroke={accent} strokeWidth="2" fill="none" markerEnd={`url(#ah-${accent})`} /><text x={x} y={y + 40} fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">{stage.label}</text></g>);
        })}
      </svg>
    </DiagramCard>
  );
}

function MitosisVisualization({ accent }) {
  const stages = ["Prophase", "Metaphase", "Anaphase", "Telophase"];
  return (
    <DiagramCard accent={accent} label="🧬 Mitosis">
      <svg width="100%" height="200" viewBox="0 0 700 200" style={bd(accent)}>
        {stages.map((stage, i) => (<g key={stage}><ellipse cx={90 + i * 160} cy="90" rx="55" ry="65" fill="none" stroke={accent} strokeWidth="2" /><line x1={70 + i * 160} y1="70" x2={110 + i * 160} y2="110" stroke={accent} strokeWidth="2.5" /><line x1={110 + i * 160} y1="70" x2={70 + i * 160} y2="110" stroke={accent} strokeWidth="2.5" /><text x={90 + i * 160} y="175" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">{stage}</text></g>))}
      </svg>
    </DiagramCard>
  );
}

function MeiosisVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🧬 Meiosis">
      <svg width="100%" height="250" viewBox="0 0 400 250" style={bd(accent)}>
        <ellipse cx="100" cy="125" rx="45" ry="55" fill="none" stroke={accent} strokeWidth="2" />
        <ellipse cx="280" cy="80" rx="32" ry="42" fill="none" stroke={accent} strokeWidth="2" /><ellipse cx="280" cy="180" rx="32" ry="42" fill="none" stroke={accent} strokeWidth="2" />
        <line x1="145" y1="105" x2="245" y2="80" stroke={accent} strokeWidth="2" /><line x1="145" y1="145" x2="245" y2="180" stroke={accent} strokeWidth="2" />
        <text x="200" y="235" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">1 cell → 4 genetically unique daughter cells</text>
      </svg>
    </DiagramCard>
  );
}

function PlantCellVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🌱 Plant Cell">
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <rect x="130" y="40" width="440" height="220" rx="18" fill="none" stroke={accent} strokeWidth="3" />
        <circle cx="280" cy="150" r="45" fill={`${accent}20`} stroke={accent} strokeWidth="2" /><text x="280" y="205" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Nucleus</text>
        <ellipse cx="450" cy="150" rx="80" ry="65" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" /><text x="450" y="150" fontSize="11" fill="#3b82f6" textAnchor="middle" fontWeight="600">Vacuole</text>
        {[{ x: 190, y: 90 }, { x: 200, y: 210 }, { x: 500, y: 70 }].map((p, i) => (<ellipse key={i} cx={p.x} cy={p.y} rx="18" ry="11" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" />))}
        <text x="190" y="65" fontSize="10" fill="#16a34a" fontWeight="600">Chloroplast</text>
      </svg>
    </DiagramCard>
  );
}

function CellVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🧬 Animal Cell">
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <ellipse cx="350" cy="150" rx="120" ry="100" fill="none" stroke={accent} strokeWidth="2" />
        <circle cx="350" cy="150" r="50" fill={`${accent}20`} stroke={accent} strokeWidth="2" /><text x="350" y="200" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Nucleus</text>
        <ellipse cx="280" cy="100" rx="20" ry="30" fill={`${accent}30`} stroke={accent} strokeWidth="1.5" /><text x="280" y="145" fontSize="10" fill={accent} textAnchor="middle" fontWeight="600">Mitochondria</text>
      </svg>
    </DiagramCard>
  );
}

function DNAVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🧬 DNA Double Helix">
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <path d="M 250 50 Q 270 100 250 150 Q 230 200 250 250" stroke={accent} strokeWidth="3" fill="none" />
        <path d="M 450 50 Q 430 100 450 150 Q 470 200 450 250" stroke={accent} strokeWidth="3" fill="none" />
        {[50, 100, 150, 200, 250].map((y) => (<g key={y}><line x1="250" y1={y} x2="450" y2={y} stroke={accent} strokeWidth="2" opacity="0.6" /><circle cx="250" cy={y} r="5" fill={accent} /><circle cx="450" cy={y} r="5" fill={accent} /></g>))}
      </svg>
    </DiagramCard>
  );
}

function PhotosynthesisVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🌿 Photosynthesis">
      <svg width="100%" height="250" viewBox="0 0 400 250" style={bd(accent)}>
        <circle cx="350" cy="30" r="20" fill="#fbbf24" /><ellipse cx="80" cy="150" rx="40" ry="60" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
        <text x="200" y="60" fontSize="12" fill={accent} fontWeight="600">Light + CO₂ + H₂O</text>
        <line x1="250" y1="80" x2="120" y2="130" stroke={accent} strokeWidth="2" />
        <text x="200" y="220" fontSize="12" fill="#16a34a" fontWeight="700">Glucose + O₂</text>
      </svg>
    </DiagramCard>
  );
}

function FoodChainVisualization({ accent }) {
  const organisms = ["Sun", "Plant", "Herbivore", "Carnivore"];
  return (
    <DiagramCard accent={accent} label="🍃 Food Chain">
      <svg width="100%" height="180" viewBox="0 0 700 180" style={bd(accent)}>
        {organisms.map((org, i) => (<g key={org}><rect x={30 + i * 170} y="55" width="120" height="60" rx="10" fill={`${accent}12`} stroke={accent} strokeWidth="2" /><text x={90 + i * 170} y="90" fontSize="13" fill={accent} textAnchor="middle" fontWeight="700">{org}</text>{i < organisms.length - 1 && (<><line x1={150 + i * 170} y1="85" x2={198 + i * 170} y2="85" stroke={accent} strokeWidth="2" /><polygon points={`${198 + i * 170},85 ${188 + i * 170},80 ${188 + i * 170},90`} fill={accent} /></>)}</g>))}
      </svg>
    </DiagramCard>
  );
}

function PunnettSquareVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🧬 Punnett Square">
      <svg width="100%" height="250" viewBox="0 0 300 250" style={bd(accent)}>
        <line x1="80" y1="40" x2="80" y2="160" stroke={accent} strokeWidth="2" /><line x1="160" y1="40" x2="160" y2="160" stroke={accent} strokeWidth="2" />
        <line x1="40" y1="80" x2="200" y2="80" stroke={accent} strokeWidth="2" /><line x1="40" y1="120" x2="200" y2="120" stroke={accent} strokeWidth="2" />
        <text x="100" y="60" fontSize="13" fill={accent} textAnchor="middle" fontWeight="700">A</text><text x="140" y="60" fontSize="13" fill={accent} textAnchor="middle" fontWeight="700">a</text>
        <text x="50" y="100" fontSize="13" fill={accent} textAnchor="middle" fontWeight="700">A</text><text x="50" y="140" fontSize="13" fill={accent} textAnchor="middle" fontWeight="700">a</text>
        <text x="100" y="100" fontSize="12" textAnchor="middle">AA</text><text x="140" y="100" fontSize="12" textAnchor="middle">Aa</text><text x="100" y="140" fontSize="12" textAnchor="middle">Aa</text><text x="140" y="140" fontSize="12" textAnchor="middle">aa</text>
      </svg>
    </DiagramCard>
  );
}

function NervousSystemVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🧠 Nervous System">
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <circle cx="220" cy="150" r="45" fill={`${accent}20`} stroke={accent} strokeWidth="2" /><text x="220" y="155" fontSize="12" fontWeight="700" fill={accent} textAnchor="middle">Cell Body</text>
        {[-40, -20, 0, 20, 40].map((offset, i) => (<line key={i} x1={180} y1={150 + offset} x2={130} y2={150 + offset * 1.4} stroke={accent} strokeWidth="2" />))}
        <line x1="265" y1="150" x2="520" y2="150" stroke={accent} strokeWidth="3" />
        {[300, 350, 400, 450].map((x) => (<ellipse key={x} cx={x} cy="150" rx="18" ry="10" fill="#fff" stroke={accent} strokeWidth="1.5" />))}
        <text x="350" y="270" fontSize="13" fontWeight="700" fill={accent} textAnchor="middle">Dendrites → Cell Body → Axon → Synapse</text>
      </svg>
    </DiagramCard>
  );
}

function HeartVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="❤️ Human Heart">
      <svg width="100%" height="280" viewBox="0 0 400 280" style={bd(accent)}>
        <path d="M200 60 C150 10 60 40 60 110 C60 170 130 220 200 260 C270 220 340 170 340 110 C340 40 250 10 200 60 Z" fill="#fecaca" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="200" y1="60" x2="200" y2="230" stroke="#dc2626" strokeWidth="2" strokeDasharray="4,4" />
        <text x="130" y="110" fontSize="11" fill="#7f1d1d" fontWeight="700" textAnchor="middle">Left Atrium</text>
        <text x="270" y="110" fontSize="11" fill="#1e3a8a" fontWeight="700" textAnchor="middle">Right Atrium</text>
        <text x="130" y="180" fontSize="11" fill="#7f1d1d" fontWeight="700" textAnchor="middle">Left Ventricle</text>
        <text x="270" y="180" fontSize="11" fill="#1e3a8a" fontWeight="700" textAnchor="middle">Right Ventricle</text>
        <text x="200" y="270" fontSize="11" fill="#64748b" textAnchor="middle">Red = oxygenated · Blue = deoxygenated</text>
      </svg>
    </DiagramCard>
  );
}

function BrainVisualization({ accent }) {
  const lobes = [{ name: "Frontal", x: 140, y: 100, color: "#f59e0b" }, { name: "Parietal", x: 230, y: 80, color: "#3b82f6" }, { name: "Temporal", x: 170, y: 170, color: "#22c55e" }, { name: "Occipital", x: 290, y: 130, color: "#a855f7" }];
  return (
    <DiagramCard accent={accent} label="🧠 Human Brain">
      <svg width="100%" height="260" viewBox="0 0 400 260" style={bd(accent)}>
        <path d="M 60 140 Q 40 60 140 40 Q 260 20 320 100 Q 350 160 300 200 Q 220 240 140 220 Q 60 210 60 140 Z" fill={`${accent}10`} stroke={accent} strokeWidth="2.5" />
        {lobes.map((l) => (<circle key={l.name} cx={l.x} cy={l.y} r="26" fill={l.color} opacity="0.35" stroke={l.color} strokeWidth="2" />))}
        {lobes.map((l) => (<text key={l.name} x={l.x} y={l.y + 4} fontSize="10" fontWeight="700" fill="#1e293b" textAnchor="middle">{l.name}</text>))}
      </svg>
    </DiagramCard>
  );
}

function DigestiveSystemVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🍽️ Digestive System">
      <svg width="100%" height="300" viewBox="0 0 300 300" style={bd(accent)}>
        <line x1="150" y1="20" x2="150" y2="90" stroke={accent} strokeWidth="10" strokeLinecap="round" /><text x="175" y="55" fontSize="10" fill={accent} fontWeight="600">Esophagus</text>
        <ellipse cx="150" cy="130" rx="45" ry="35" fill="#fde68a" stroke="#d97706" strokeWidth="2" /><text x="150" y="135" fontSize="10" fontWeight="700" textAnchor="middle">Stomach</text>
        <path d="M 150 165 Q 90 190 120 220 Q 150 250 100 260" stroke="#f97316" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M 100 260 Q 200 280 230 200 Q 250 140 200 100" stroke="#7c3aed" strokeWidth="11" fill="none" strokeLinecap="round" />
      </svg>
    </DiagramCard>
  );
}

function RespiratorySystemVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🫁 Respiratory System">
      <svg width="100%" height="260" viewBox="0 0 300 260" style={bd(accent)}>
        <line x1="150" y1="10" x2="150" y2="80" stroke={accent} strokeWidth="10" strokeLinecap="round" /><text x="175" y="45" fontSize="10" fill={accent} fontWeight="600">Trachea</text>
        <path d="M 150 80 Q 100 100 90 140" stroke={accent} strokeWidth="7" fill="none" /><path d="M 150 80 Q 200 100 210 140" stroke={accent} strokeWidth="7" fill="none" />
        <ellipse cx="90" cy="180" rx="45" ry="65" fill="#fecdd3" stroke="#f43f5e" strokeWidth="2" /><ellipse cx="210" cy="180" rx="45" ry="65" fill="#fecdd3" stroke="#f43f5e" strokeWidth="2" />
        <text x="90" y="185" fontSize="11" fontWeight="700" fill="#9f1239" textAnchor="middle">Left Lung</text><text x="210" y="185" fontSize="11" fontWeight="700" fill="#9f1239" textAnchor="middle">Right Lung</text>
      </svg>
    </DiagramCard>
  );
}

function CirculatorySystemVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🩸 Circulatory System">
      <svg width="100%" height="260" viewBox="0 0 400 260" style={bd(accent)}>
        <path d="M200 50 C160 15 90 40 90 100 C90 150 150 190 200 220 C250 190 310 150 310 100 C310 40 240 15 200 50 Z" fill="#fecaca" stroke="#ef4444" strokeWidth="2" />
        <path d="M 90 100 Q 40 100 40 160 Q 40 210 100 230" stroke="#3b82f6" strokeWidth="6" fill="none" />
        <path d="M 310 100 Q 360 100 360 160 Q 360 210 300 230" stroke="#ef4444" strokeWidth="6" fill="none" />
        <text x="200" y="245" fontSize="11" fill="#64748b" textAnchor="middle">Heart pumps blood through arteries & veins</text>
      </svg>
    </DiagramCard>
  );
}

function KidneyVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🫘 Kidney">
      <svg width="100%" height="260" viewBox="0 0 300 260" style={bd(accent)}>
        <path d="M150 40 C100 40 70 90 80 140 C88 180 100 220 150 220 C200 220 212 180 220 140 C230 90 200 40 150 40 Z" fill="#fecaca" stroke="#b91c1c" strokeWidth="2" />
        <path d="M150 80 C130 90 125 130 150 150 C175 130 170 90 150 80 Z" fill="#fff" stroke="#b91c1c" strokeWidth="1.5" />
        <line x1="150" y1="150" x2="150" y2="230" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <text x="150" y="250" fontSize="10" fill={accent} textAnchor="middle" fontWeight="600">Ureter</text>
      </svg>
    </DiagramCard>
  );
}

function EyeVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="👁️ Human Eye">
      <svg width="100%" height="220" viewBox="0 0 400 220" style={bd(accent)}>
        <ellipse cx="200" cy="110" rx="150" ry="80" fill="#f8fafc" stroke={accent} strokeWidth="2.5" />
        <circle cx="200" cy="110" r="45" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" /><circle cx="200" cy="110" r="20" fill="#1e293b" />
        <text x="200" y="200" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Cornea · Iris · Pupil · Retina</text>
      </svg>
    </DiagramCard>
  );
}

function EarVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="👂 Human Ear">
      <svg width="100%" height="220" viewBox="0 0 400 220" style={bd(accent)}>
        <path d="M60 110 Q40 40 110 40 Q180 40 180 110 Q180 160 130 160" stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round" />
        <line x1="180" y1="110" x2="260" y2="110" stroke={accent} strokeWidth="6" />
        <circle cx="290" cy="110" r="20" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
        <path d="M310 95 Q340 90 340 110 Q340 130 310 125" stroke="#7c3aed" strokeWidth="5" fill="none" />
        <text x="200" y="190" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Outer → Middle → Inner Ear</text>
      </svg>
    </DiagramCard>
  );
}

function SkeletonVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🦴 Human Skeleton">
      <svg width="100%" height="300" viewBox="0 0 200 300" style={bd(accent)}>
        <circle cx="100" cy="30" r="22" fill="none" stroke={accent} strokeWidth="3" />
        <line x1="100" y1="52" x2="100" y2="180" stroke={accent} strokeWidth="4" />
        <line x1="60" y1="90" x2="140" y2="90" stroke={accent} strokeWidth="4" />
        <line x1="60" y1="90" x2="40" y2="160" stroke={accent} strokeWidth="3" /><line x1="140" y1="90" x2="160" y2="160" stroke={accent} strokeWidth="3" />
        <line x1="100" y1="180" x2="70" y2="280" stroke={accent} strokeWidth="4" /><line x1="100" y1="180" x2="130" y2="280" stroke={accent} strokeWidth="4" />
      </svg>
    </DiagramCard>
  );
}

function MuscleVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="💪 Muscle Contraction">
      <svg width="100%" height="200" viewBox="0 0 400 200" style={bd(accent)}>
        <ellipse cx="150" cy="100" rx="90" ry="30" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2" />
        <ellipse cx="280" cy="100" rx="55" ry="22" fill="#fca5a5" opacity="0.7" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4,3" />
        <text x="150" y="150" fontSize="11" fill="#7f1d1d" textAnchor="middle" fontWeight="600">Relaxed</text>
        <text x="280" y="150" fontSize="11" fill="#7f1d1d" textAnchor="middle" fontWeight="600">Contracted</text>
      </svg>
    </DiagramCard>
  );
}

// ══════════════════════════ PHYSICS ════════════════════════════════════════

function MotionVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🚀 Motion Diagram">
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <line x1="50" y1="250" x2="650" y2="250" stroke={accent} strokeWidth="2" />
        <path d="M 100 250 Q 350 100 600 250" stroke={accent} strokeWidth="2" fill="none" strokeDasharray="5,5" />
        {[100, 200, 350, 500, 600].map((x) => {
          const y = 250 - Math.sin(((x - 100) / 500) * Math.PI) * 150;
          return (<g key={x}><circle cx={x} cy={y} r="8" fill={accent} /><line x1={x} y1={y} x2={x + 30} y2={y - 20} stroke={accent} strokeWidth="2" /></g>);
        })}
        <text x="350" y="290" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">Projectile Motion</text>
      </svg>
    </DiagramCard>
  );
}

function ForceVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="⚡ Force Diagram">
      <svg width="100%" height="300" viewBox="0 0 700 300" style={bd(accent)}>
        <rect x="320" y="120" width="60" height="60" fill={`${accent}30`} stroke={accent} strokeWidth="2" /><text x="350" y="155" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">m</text>
        <line x1="350" y1="120" x2="350" y2="40" stroke="#4F46E5" strokeWidth="3" /><text x="330" y="35" fontSize="11" fill="#4F46E5" fontWeight="600">F₁</text>
        <line x1="380" y1="150" x2="480" y2="150" stroke="#059669" strokeWidth="3" /><text x="500" y="145" fontSize="11" fill="#059669" fontWeight="600">F₂</text>
        <text x="350" y="290" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">Force Equilibrium</text>
      </svg>
    </DiagramCard>
  );
}

function CollisionVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="💥 Collision">
      <svg width="100%" height="250" viewBox="0 0 400 250" style={bd(accent)}>
        <text x="100" y="30" fontSize="12" fill={accent} fontWeight="600">Before</text>
        <rect x="40" y="60" width="30" height="30" fill={`${accent}30`} stroke={accent} strokeWidth="2" /><rect x="230" y="60" width="30" height="30" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
        <line x1="100" y1="120" x2="280" y2="120" stroke={accent} strokeWidth="2" strokeDasharray="5,5" />
        <text x="100" y="160" fontSize="12" fill={accent} fontWeight="600">After</text>
        <rect x="110" y="190" width="30" height="30" fill={`${accent}30`} stroke={accent} strokeWidth="2" /><rect x="170" y="190" width="30" height="30" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
      </svg>
    </DiagramCard>
  );
}

function EnergyTransferVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🔋 Energy Transfer">
      <svg width="100%" height="200" viewBox="0 0 400 200" style={bd(accent)}>
        <rect x="50" y="60" width="80" height="80" fill="none" stroke="#4F46E5" strokeWidth="2" /><text x="90" y="105" fontSize="12" fill="#4F46E5" fontWeight="600">PE</text>
        <rect x="270" y="60" width="80" height="80" fill="none" stroke="#059669" strokeWidth="2" /><text x="310" y="105" fontSize="12" fill="#059669" fontWeight="600">KE</text>
        <text x="200" y="180" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">Energy Conservation</text>
      </svg>
    </DiagramCard>
  );
}

function WaveVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🌊 Wave Motion">
      <svg width="100%" height="200" viewBox="0 0 400 200" style={bd(accent)}>
        <path d="M 20 100 Q 40 60 60 100 T 100 100 T 140 100 T 180 100 T 220 100 T 260 100 T 300 100 T 340 100" stroke={accent} strokeWidth="3" fill="none" />
        <text x="200" y="160" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">Wavelength (λ) & Amplitude</text>
      </svg>
    </DiagramCard>
  );
}

function InterferenceVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="〰️ Wave Interference">
      <svg width="100%" height="220" viewBox="0 0 400 220" style={bd(accent)}>
        <circle cx="120" cy="110" r="8" fill={accent} /><circle cx="280" cy="110" r="8" fill={accent} />
        {[30, 55, 80].map((r, i) => (<circle key={i} cx="120" cy="110" r={r} fill="none" stroke={accent} strokeWidth="1" opacity="0.4" />))}
        {[30, 55, 80].map((r, i) => (<circle key={i} cx="280" cy="110" r={r} fill="none" stroke={accent} strokeWidth="1" opacity="0.4" />))}
        <text x="200" y="200" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Constructive & Destructive Interference</text>
      </svg>
    </DiagramCard>
  );
}

function DiffractionVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🌈 Diffraction">
      <svg width="100%" height="220" viewBox="0 0 400 220" style={bd(accent)}>
        <line x1="40" y1="20" x2="40" y2="90" stroke="#334155" strokeWidth="6" /><line x1="40" y1="110" x2="40" y2="200" stroke="#334155" strokeWidth="6" />
        {[0, 1, 2].map((i) => (<path key={i} d={`M 40 100 Q ${150 + i * 60} ${60 + i * 20} ${300} ${40 + i * 60}`} stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6" />))}
        <text x="200" y="200" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Wave bending around a slit/edge</text>
      </svg>
    </DiagramCard>
  );
}

function ElectricFieldVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="⚡ Electric Field">
      <svg width="100%" height="250" viewBox="0 0 300 250" style={bd(accent)}>
        <circle cx="150" cy="100" r="15" fill={accent} /><text x="150" y="105" fontSize="16" fill="#fff" fontWeight="700" textAnchor="middle">+</text>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return <line key={angle} x1={150 + 20 * Math.cos(rad)} y1={100 + 20 * Math.sin(rad)} x2={150 + 80 * Math.cos(rad)} y2={100 + 80 * Math.sin(rad)} stroke={accent} strokeWidth="1.5" />;
        })}
      </svg>
    </DiagramCard>
  );
}

function CircuitVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🔌 Circuit Diagram">
      <svg width="100%" height="220" viewBox="0 0 400 220" style={bd(accent)}>
        <line x1="50" y1="100" x2="50" y2="150" stroke={accent} strokeWidth="3" /><line x1="70" y1="100" x2="70" y2="150" stroke={accent} strokeWidth="3" />
        <line x1="70" y1="125" x2="200" y2="125" stroke={accent} strokeWidth="2" /><rect x="200" y="115" width="40" height="20" fill="none" stroke={accent} strokeWidth="2" />
        <line x1="240" y1="125" x2="350" y2="125" stroke={accent} strokeWidth="2" /><line x1="350" y1="125" x2="350" y2="150" stroke={accent} strokeWidth="2" /><line x1="350" y1="150" x2="50" y2="150" stroke={accent} strokeWidth="2" />
      </svg>
    </DiagramCard>
  );
}

function RayDiagramVisualization({ accent, label }) {
  return (
    <DiagramCard accent={accent} label={label || "🔍 Ray Diagram (Convex Lens)"}>
      <svg width="100%" height="260" viewBox="0 0 500 260" style={bd(accent)}>
        <line x1="20" y1="130" x2="480" y2="130" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
        <ellipse cx="250" cy="130" rx="18" ry="90" fill={`${accent}10`} stroke={accent} strokeWidth="2" />
        <line x1="110" y1="130" x2="110" y2="70" stroke="#ef4444" strokeWidth="3" />
        <line x1="110" y1="70" x2="250" y2="130" stroke="#3b82f6" strokeWidth="1.5" /><line x1="250" y1="130" x2="390" y2="185" stroke="#3b82f6" strokeWidth="1.5" />
        <line x1="390" y1="130" x2="390" y2="185" stroke="#16a34a" strokeWidth="3" />
        <text x="110" y="55" fontSize="11" fill="#ef4444" fontWeight="700" textAnchor="middle">Object</text><text x="390" y="200" fontSize="11" fill="#16a34a" fontWeight="700" textAnchor="middle">Image</text>
      </svg>
    </DiagramCard>
  );
}

function MirrorVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🪞 Mirror Reflection">
      <svg width="100%" height="220" viewBox="0 0 400 220" style={bd(accent)}>
        <path d="M 200 30 Q 260 110 200 190" fill="none" stroke={accent} strokeWidth="4" />
        <line x1="80" y1="110" x2="200" y2="60" stroke="#ef4444" strokeWidth="2" /><line x1="200" y1="60" x2="330" y2="110" stroke="#ef4444" strokeWidth="2" />
        <circle cx="80" cy="110" r="4" fill="#ef4444" />
        <text x="200" y="205" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Angle of incidence = Angle of reflection</text>
      </svg>
    </DiagramCard>
  );
}

// ══════════════════════════ AI / COMPUTER SCIENCE ══════════════════════════

function NeuralNetworkVisualization({ accent }) {
  const layers = [3, 4, 4, 2], layerX = [120, 280, 440, 600];
  return (
    <DiagramCard accent={accent} label="🤖 Neural Network">
      <svg width="100%" height="280" viewBox="0 0 700 280" style={bd(accent)}>
        {layers.map((count, li) => {
          if (li === layers.length - 1) return null;
          const nextCount = layers[li + 1];
          return [...Array(count)].map((_, ni) => [...Array(nextCount)].map((_, nj) => {
            const y1 = 150 - (count - 1) * 20 + ni * 40, y2 = 150 - (nextCount - 1) * 20 + nj * 40;
            return <line key={`${li}-${ni}-${nj}`} x1={layerX[li]} y1={y1} x2={layerX[li + 1]} y2={y2} stroke={accent} strokeWidth="1" opacity="0.25" />;
          }));
        })}
        {layers.map((count, li) => [...Array(count)].map((_, ni) => { const y = 150 - (count - 1) * 20 + ni * 40; return <circle key={`${li}-${ni}`} cx={layerX[li]} cy={y} r="12" fill={accent} />; }))}
        <text x="120" y="260" fontSize="12" fill={accent} fontWeight="600" textAnchor="middle">Input</text><text x="360" y="260" fontSize="12" fill={accent} fontWeight="600" textAnchor="middle">Hidden Layers</text><text x="600" y="260" fontSize="12" fill={accent} fontWeight="600" textAnchor="middle">Output</text>
      </svg>
    </DiagramCard>
  );
}

function CNNVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🖼️ CNN Architecture">
      <svg width="100%" height="220" viewBox="0 0 700 220" style={bd(accent)}>
        {[{ x: 30, w: 60, h: 120, c: "#94a3b8", label: "Input" }, { x: 140, w: 40, h: 100, c: accent, label: "Conv" }, { x: 220, w: 30, h: 80, c: "#f59e0b", label: "Pool" }, { x: 300, w: 40, h: 90, c: accent, label: "Conv" }, { x: 380, w: 25, h: 60, c: "#f59e0b", label: "Pool" }, { x: 460, w: 15, h: 130, c: "#22c55e", label: "FC" }, { x: 550, w: 15, h: 40, c: "#ef4444", label: "Output" }].map((b, i) => (<g key={i}><rect x={b.x} y={110 - b.h / 2} width={b.w} height={b.h} fill={b.c} opacity="0.75" rx="4" /><text x={b.x + b.w / 2} y="200" fontSize="10" fill="#334155" textAnchor="middle" fontWeight="600">{b.label}</text></g>))}
      </svg>
    </DiagramCard>
  );
}

function RNNVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🔁 Recurrent Neural Network">
      <svg width="100%" height="220" viewBox="0 0 700 220" style={bd(accent)}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={80 + i * 160} y="80" width="70" height="60" rx="10" fill={`${accent}20`} stroke={accent} strokeWidth="2" />
            <text x={115 + i * 160} y="115" fontSize="12" fontWeight="700" fill={accent} textAnchor="middle">t{i}</text>
            {i < 3 && (<><line x1={150 + i * 160} y1="110" x2={78 + (i + 1) * 160} y2="110" stroke={accent} strokeWidth="2" /><polygon points={`${78 + (i + 1) * 160},110 ${68 + (i + 1) * 160},105 ${68 + (i + 1) * 160},115`} fill={accent} /></>)}
          </g>
        ))}
        <text x="350" y="190" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Hidden state passed forward through time</text>
      </svg>
    </DiagramCard>
  );
}

function AttentionVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🎯 Attention Mechanism">
      <svg width="100%" height="220" viewBox="0 0 400 220" style={bd(accent)}>
        {["Query", "Key", "Value"].map((label, i) => (<g key={label}><rect x={50 + i * 110} y="30" width="85" height="40" rx="8" fill={`${accent}20`} stroke={accent} strokeWidth="2" /><text x={92 + i * 110} y="55" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">{label}</text></g>))}
        <rect x="150" y="150" width="100" height="40" rx="8" fill={`${accent}20`} stroke={accent} strokeWidth="2" /><text x="200" y="175" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">Attention Output</text>
      </svg>
    </DiagramCard>
  );
}

function GradientDescentVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="📉 Gradient Descent">
      <svg width="100%" height="260" viewBox="0 0 700 260" style={bd(accent)}>
        <path d="M 80 80 Q 250 40 350 150 Q 420 220 620 240" stroke={accent} strokeWidth="3" fill="none" />
        {[{ x: 120, y: 68 }, { x: 220, y: 55 }, { x: 320, y: 130 }, { x: 420, y: 200 }, { x: 550, y: 232 }].map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r="6" fill="#ef4444" />))}
        <circle cx="605" cy="238" r="9" fill="#22c55e" /><text x="605" y="255" fontSize="11" fill="#22c55e" fontWeight="700" textAnchor="middle">Minimum</text>
      </svg>
    </DiagramCard>
  );
}

function AlgorithmFlowVisualization({ accent }) {
  const steps = ["Start", "Input", "Process", "Decision", "Output", "End"];
  return (
    <DiagramCard accent={accent} label="🧭 Algorithm Flow">
      <svg width="100%" height="200" viewBox="0 0 700 200" style={bd(accent)}>
        {steps.map((step, i) => {
          const x = 60 + i * 115;
          return (<g key={step}><rect x={x} y="80" width="90" height="45" rx="10" fill={`${accent}12`} stroke={accent} strokeWidth="2" /><text x={x + 45} y="107" fontSize="11.5" fontWeight="700" fill={accent} textAnchor="middle">{step}</text>{i < steps.length - 1 && (<><line x1={x + 90} y1="102" x2={x + 113} y2="102" stroke={accent} strokeWidth="2" /><polygon points={`${x + 113},102 ${x + 105},97 ${x + 105},107`} fill={accent} /></>)}</g>);
        })}
      </svg>
    </DiagramCard>
  );
}

function OSIModelVisualization({ accent }) {
  const layers = [{ n: 7, name: "Application", c: "#ef4444" }, { n: 6, name: "Presentation", c: "#f97316" }, { n: 5, name: "Session", c: "#f59e0b" }, { n: 4, name: "Transport", c: "#22c55e" }, { n: 3, name: "Network", c: "#3b82f6" }, { n: 2, name: "Data Link", c: "#6366f1" }, { n: 1, name: "Physical", c: "#a855f7" }];
  return (
    <DiagramCard accent={accent} label="🌐 OSI Model">
      <svg width="100%" height="300" viewBox="0 0 400 300" style={bd(accent)}>
        {layers.map((l, i) => (<g key={l.n}><rect x="60" y={10 + i * 40} width="280" height="34" rx="6" fill={l.c} opacity="0.85" /><text x="80" y={10 + i * 40 + 22} fontSize="12" fontWeight="700" fill="#fff">{l.n}. {l.name}</text></g>))}
      </svg>
    </DiagramCard>
  );
}

function TCPIPVisualization({ accent }) {
  const layers = [{ name: "Application", c: "#ef4444" }, { name: "Transport", c: "#22c55e" }, { name: "Internet", c: "#3b82f6" }, { name: "Network Access", c: "#a855f7" }];
  return (
    <DiagramCard accent={accent} label="🌐 TCP/IP Model">
      <svg width="100%" height="200" viewBox="0 0 400 200" style={bd(accent)}>
        {layers.map((l, i) => (<g key={l.name}><rect x="60" y={10 + i * 44} width="280" height="36" rx="6" fill={l.c} opacity="0.85" /><text x="200" y={10 + i * 44 + 23} fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle">{l.name}</text></g>))}
      </svg>
    </DiagramCard>
  );
}

function RouterVisualization({ accent }) {
  const devices = [{ x: 100, y: 60 }, { x: 550, y: 60 }, { x: 100, y: 240 }, { x: 550, y: 240 }];
  return (
    <DiagramCard accent={accent} label="📡 Router Topology">
      <svg width="100%" height="300" viewBox="0 0 650 300" style={bd(accent)}>
        <rect x="285" y="130" width="80" height="40" rx="8" fill={accent} /><text x="325" y="155" fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle">Router</text>
        {devices.map((d, i) => (<g key={i}><line x1="325" y1="150" x2={d.x} y2={d.y} stroke={accent} strokeWidth="2" opacity="0.5" /><rect x={d.x - 30} y={d.y - 20} width="60" height="40" rx="6" fill="#f1f5f9" stroke={accent} strokeWidth="2" /><text x={d.x} y={d.y + 5} fontSize="10" fill="#334155" textAnchor="middle" fontWeight="600">Device {i + 1}</text></g>))}
      </svg>
    </DiagramCard>
  );
}

function SwitchVisualization({ accent }) {
  const ports = [0, 1, 2, 3, 4, 5];
  return (
    <DiagramCard accent={accent} label="🔀 Network Switch">
      <svg width="100%" height="200" viewBox="0 0 500 200" style={bd(accent)}>
        <rect x="150" y="80" width="200" height="50" rx="8" fill={accent} /><text x="250" y="110" fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle">Switch</text>
        {ports.map((p, i) => { const x = 170 + i * 30; return (<g key={p}><line x1={x} y1="80" x2={x} y2="30" stroke={accent} strokeWidth="2" opacity="0.6" /><circle cx={x} cy="20" r="8" fill="#f1f5f9" stroke={accent} strokeWidth="1.5" /></g>); })}
      </svg>
    </DiagramCard>
  );
}

function DNSVisualization({ accent }) {
  const steps = ["Client", "Resolver", "Root", "TLD", "Auth"];
  return (
    <DiagramCard accent={accent} label="🌍 DNS Lookup">
      <svg width="100%" height="180" viewBox="0 0 700 180" style={bd(accent)}>
        {steps.map((step, i) => { const x = 30 + i * 135; return (<g key={step}><rect x={x} y="60" width="110" height="50" rx="8" fill={`${accent}15`} stroke={accent} strokeWidth="2" /><text x={x + 55} y="90" fontSize="10.5" fill={accent} textAnchor="middle" fontWeight="700">{step}</text>{i < steps.length - 1 && (<><line x1={x + 110} y1="85" x2={x + 133} y2="85" stroke={accent} strokeWidth="2" /><polygon points={`${x + 133},85 ${x + 125},80 ${x + 125},90`} fill={accent} /></>)}</g>); })}
      </svg>
    </DiagramCard>
  );
}

function HTTPVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="🔗 HTTP Request/Response">
      <svg width="100%" height="200" viewBox="0 0 500 200" style={bd(accent)}>
        <rect x="30" y="70" width="110" height="60" rx="10" fill={`${accent}15`} stroke={accent} strokeWidth="2" /><text x="85" y="105" fontSize="12" fill={accent} textAnchor="middle" fontWeight="700">Client</text>
        <rect x="360" y="70" width="110" height="60" rx="10" fill={`${accent}15`} stroke={accent} strokeWidth="2" /><text x="415" y="105" fontSize="12" fill={accent} textAnchor="middle" fontWeight="700">Server</text>
        <line x1="140" y1="85" x2="358" y2="85" stroke="#3b82f6" strokeWidth="2" /><text x="250" y="75" fontSize="11" fill="#3b82f6" textAnchor="middle" fontWeight="700">GET Request</text>
        <line x1="358" y1="115" x2="140" y2="115" stroke="#22c55e" strokeWidth="2" /><text x="250" y="140" fontSize="11" fill="#22c55e" textAnchor="middle" fontWeight="700">200 OK Response</text>
      </svg>
    </DiagramCard>
  );
}

function CompilerVisualization({ accent }) {
  const stages = ["Source Code", "Lexer", "Parser", "Semantic", "Codegen", "Machine Code"];
  return (
    <DiagramCard accent={accent} label="⚙️ Compiler Pipeline">
      <svg width="100%" height="180" viewBox="0 0 700 180" style={bd(accent)}>
        {stages.map((s, i) => { const x = 20 + i * 115; return (<g key={s}><rect x={x} y="60" width="100" height="50" rx="8" fill={`${accent}15`} stroke={accent} strokeWidth="2" /><text x={x + 50} y="90" fontSize="10" fill={accent} textAnchor="middle" fontWeight="700">{s}</text>{i < stages.length - 1 && (<><line x1={x + 100} y1="85" x2={x + 113} y2="85" stroke={accent} strokeWidth="2" /><polygon points={`${x + 113},85 ${x + 105},80 ${x + 105},90`} fill={accent} /></>)}</g>); })}
      </svg>
    </DiagramCard>
  );
}

function LinkedListVisualization({ accent, data }) {
  const nodes = data?.nodes?.length ? data.nodes : [7, 3, 9, 1];
  return (
    <DiagramCard accent={accent} label="🔗 Linked List">
      <svg width="100%" height="150" viewBox={`0 0 ${nodes.length * 150 + 100} 150`} style={bd(accent)}>
        {nodes.map((val, i) => (
          <g key={i}>
            <rect x={40 + i * 150} y="50" width="90" height="50" fill="none" stroke={accent} strokeWidth="2" rx="6" />
            <line x1={40 + i * 150 + 60} y1="50" x2={40 + i * 150 + 60} y2="100" stroke={accent} strokeWidth="1.5" />
            <text x={40 + i * 150 + 30} y="80" fontSize="14" fontWeight="700" fill={accent} textAnchor="middle">{val}</text>
            <line x1={130 + i * 150} y1="75" x2={185 + i * 150} y2="75" stroke={accent} strokeWidth="2" />
            <polygon points={`${185 + i * 150},75 ${175 + i * 150},70 ${175 + i * 150},80`} fill={accent} />
          </g>
        ))}
        <text x={nodes.length * 150 + 40} y="80" fontSize="13" fontWeight="700" fill="#ef4444">NULL</text>
      </svg>
    </DiagramCard>
  );
}

function StackVisualization({ accent, data }) {
  const items = data?.items?.length ? [...data.items].reverse() : ["D", "C", "B", "A"];
  return (
    <DiagramCard accent={accent} label="📚 Stack (LIFO)">
      <svg width="100%" height={80 + items.length * 45} viewBox={`0 0 300 ${80 + items.length * 45}`} style={bd(accent)}>
        {items.map((v, i) => (<g key={i}><rect x="90" y={40 + i * 45} width="120" height="38" fill={i === 0 ? accent : `${accent}22`} stroke={accent} strokeWidth="2" rx="6" /><text x="150" y={40 + i * 45 + 24} fontSize="14" fontWeight="700" fill={i === 0 ? "#fff" : accent} textAnchor="middle">{v}</text></g>))}
        <text x="270" y="30" fontSize="10" fill="#ef4444" fontWeight="700">Push/Pop (Top)</text>
      </svg>
    </DiagramCard>
  );
}

function QueueVisualization({ accent, data }) {
  const items = data?.items?.length ? data.items : ["A", "B", "C", "D"];
  return (
    <DiagramCard accent={accent} label="🚶 Queue (FIFO)">
      <svg width="100%" height="150" viewBox={`0 0 ${items.length * 110 + 120} 150`} style={bd(accent)}>
        {items.map((v, i) => (<g key={i}><rect x={80 + i * 110} y="50" width="90" height="50" fill={i === 0 ? accent : `${accent}22`} stroke={accent} strokeWidth="2" rx="6" /><text x={125 + i * 110} y="80" fontSize="14" fontWeight="700" fill={i === 0 ? "#fff" : accent} textAnchor="middle">{v}</text></g>))}
        <text x="45" y="105" fontSize="10" fill="#22c55e" fontWeight="700" textAnchor="middle">Enqueue</text>
        <text x={items.length * 110 + 65} y="105" fontSize="10" fill="#ef4444" fontWeight="700" textAnchor="middle">Dequeue</text>
      </svg>
    </DiagramCard>
  );
}

function BinaryTreeVisualization({ accent, data, label }) {
  const values = data?.values?.length ? data.values : [8, 4, 12, 2, 6, 10, 14];
  const positions = [{ x: 350, y: 40 }, { x: 200, y: 120 }, { x: 500, y: 120 }, { x: 120, y: 200 }, { x: 280, y: 200 }, { x: 420, y: 200 }, { x: 580, y: 200 }];
  const nodes = values.slice(0, 7).map((v, i) => ({ ...positions[i], v }));
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].filter(([a, b]) => nodes[a] && nodes[b]);
  return (
    <DiagramCard accent={accent} label={label || "🌳 Binary Tree"}>
      <svg width="100%" height="240" viewBox="0 0 700 240" style={bd(accent)}>
        {edges.map(([a, b], i) => (<line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={accent} strokeWidth="2" opacity="0.5" />))}
        {nodes.map((n, i) => (<g key={i}><circle cx={n.x} cy={n.y} r="22" fill={i === 0 ? accent : `${accent}25`} stroke={accent} strokeWidth="2" /><text x={n.x} y={n.y + 5} fontSize="13" fontWeight="700" fill={i === 0 ? "#fff" : accent} textAnchor="middle">{n.v}</text></g>))}
      </svg>
    </DiagramCard>
  );
}

function HashTableVisualization({ accent }) {
  const buckets = [{ k: "0", v: "apple" }, { k: "1", v: null }, { k: "2", v: "banana → cherry" }, { k: "3", v: null }, { k: "4", v: "date" }];
  return (
    <DiagramCard accent={accent} label="🔑 Hash Table">
      <svg width="100%" height="220" viewBox="0 0 500 220" style={bd(accent)}>
        {buckets.map((b, i) => (<g key={i}><rect x="30" y={20 + i * 38} width="50" height="32" fill={`${accent}20`} stroke={accent} strokeWidth="2" /><text x="55" y={20 + i * 38 + 21} fontSize="12" fontWeight="700" fill={accent} textAnchor="middle">{b.k}</text><rect x="90" y={20 + i * 38} width="350" height="32" fill="none" stroke={accent} strokeWidth="1.5" /><text x="105" y={20 + i * 38 + 21} fontSize="11" fill="#334155">{b.v || "—"}</text></g>))}
      </svg>
    </DiagramCard>
  );
}

// ══════════════════════════ FALLBACK ═══════════════════════════════════════

function DefaultVisualization({ accent }) {
  return (
    <DiagramCard accent={accent} label="📊 Visualization">
      <svg width="100%" height="200" viewBox="0 0 400 200" style={bd(accent)}>
        <rect x="30" y="70" width="80" height="60" fill="none" stroke={accent} strokeWidth="2" /><text x="70" y="105" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">Input</text>
        <rect x="160" y="70" width="80" height="60" fill="none" stroke={accent} strokeWidth="2" /><text x="200" y="105" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">Process</text>
        <rect x="290" y="70" width="80" height="60" fill="none" stroke={accent} strokeWidth="2" /><text x="330" y="105" fontSize="12" fontWeight="bold" fill={accent} textAnchor="middle">Output</text>
        <line x1="110" y1="100" x2="160" y2="100" stroke={accent} strokeWidth="2" /><polygon points="160,100 150,95 150,105" fill={accent} />
        <line x1="240" y1="100" x2="290" y2="100" stroke={accent} strokeWidth="2" /><polygon points="290,100 280,95 280,105" fill={accent} />
      </svg>
    </DiagramCard>
  );
}
