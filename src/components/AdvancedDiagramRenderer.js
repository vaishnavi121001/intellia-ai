"use client";

import { useVisualization } from "./VisualizationEngine";

export default function AdvancedDiagramRenderer({ topic, subject, accent }) {
  const visualizations = useVisualization(topic, subject, accent);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
      {visualizations.map((viz, idx) => (
        <DiagramContainer key={idx} type={viz.type} title={viz.title} accent={accent} />
      ))}
    </div>
  );
}

function DiagramContainer({ type, title, accent }) {
  const getContent = () => {
    switch (type) {
      // MATHEMATICS
      case "parabola":
        return <ParabolaDiagram accent={accent} />;
      case "line_graph":
        return <LineGraphDiagram accent={accent} />;
      case "line_intersection":
        return <LineIntersectionDiagram accent={accent} />;
      case "sine_wave":
        return <SineWaveDiagram accent={accent} />;
      case "trig_circle":
        return <TrigCircleDiagram accent={accent} />;
      case "bell_curve":
        return <BellCurveDiagram accent={accent} />;

      // CHEMISTRY
      case "bohr_model":
        return <BohrModelDiagram accent={accent} />;
      case "ionic_bond":
        return <IonicBondDiagram accent={accent} />;
      case "covalent_bond":
        return <CovalentBondDiagram accent={accent} />;
      case "vsepr_theory":
        return <VSEPRDiagram accent={accent} />;
      case "ph_scale":
        return <PHScaleDiagram accent={accent} />;
      case "benzene_structure":
        return <BenzeneDiagram accent={accent} />;

      // BIOLOGY
      case "animal_cell":
        return <AnimalCellDiagram accent={accent} />;
      case "plant_cell":
        return <PlantCellDiagram accent={accent} />;
      case "mitosis":
        return <MitosisDiagram accent={accent} />;
      case "meiosis":
        return <MeiosisDiagram accent={accent} />;
      case "dna_structure":
        return <DNAStructureDiagram accent={accent} />;
      case "photosynthesis":
        return <PhotosynthesisDiagram accent={accent} />;
      case "food_chain":
        return <FoodChainDiagram accent={accent} />;
      case "punnett_square":
        return <PunnettSquareDiagram accent={accent} />;

      // PHYSICS
      case "motion_graph":
        return <MotionGraphDiagram accent={accent} />;
      case "force_diagram":
        return <ForceDiagramDiagram accent={accent} />;
      case "collision":
        return <CollisionDiagram accent={accent} />;
      case "energy_transfer":
        return <EnergyTransferDiagram accent={accent} />;
      case "wave_propagation":
        return <WavePropagationDiagram accent={accent} />;
      case "electric_field":
        return <ElectricFieldDiagram accent={accent} />;
      case "circuit_diagram":
        return <CircuitDiagramDiagram accent={accent} />;

      // AI
      case "network_architecture":
        return <NetworkArchitectureDiagram accent={accent} />;
      case "attention":
        return <AttentionDiagram accent={accent} />;
      case "gradient_descent":
        return <GradientDescentDiagram accent={accent} />;

      default:
        return <GenericDiagram accent={accent} />;
    }
  };

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
          fontSize: 12,
          fontWeight: 700,
          color: accent,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        📊 {title}
      </div>
      <div style={{ minHeight: 250 }}>{getContent()}</div>
    </div>
  );
}

// ✅ MATHEMATICS DIAGRAMS
function ParabolaDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Grid */}
      {[...Array(11)].map((_, i) => (
        <g key={`grid-${i}`}>
          <line x1={i * 40} y1="0" x2={i * 40} y2="250" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="0" y1={i * 25} x2="400" y2={i * 25} stroke="#e5e7eb" strokeWidth="1" />
        </g>
      ))}
      {/* Axes */}
      <line x1="40" y1="200" x2="360" y2="200" stroke={accent} strokeWidth="2" />
      <line x1="200" y1="230" x2="200" y2="20" stroke={accent} strokeWidth="2" />
      {/* Parabola */}
      <path
        d="M 100 150 Q 200 50 300 150"
        stroke={accent}
        strokeWidth="3"
        fill="none"
      />
      {/* Vertex */}
      <circle cx="200" cy="50" r="5" fill={accent} />
      <text x="200" y="35" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Vertex
      </text>
    </svg>
  );
}

function LineGraphDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Grid */}
      {[...Array(11)].map((_, i) => (
        <g key={`grid-${i}`}>
          <line x1={i * 40} y1="0" x2={i * 40} y2="250" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="0" y1={i * 25} x2="400" y2={i * 25} stroke="#e5e7eb" strokeWidth="1" />
        </g>
      ))}
      {/* Axes */}
      <line x1="40" y1="200" x2="360" y2="200" stroke={accent} strokeWidth="2" />
      <line x1="200" y1="230" x2="200" y2="20" stroke={accent} strokeWidth="2" />
      {/* Line */}
      <line x1="80" y1="160" x2="320" y2="80" stroke={accent} strokeWidth="3" />
      {/* Points */}
      <circle cx="80" cy="160" r="4" fill={accent} />
      <circle cx="320" cy="80" r="4" fill={accent} />
      <text x="80" y="175" fontSize="11" fill={accent} textAnchor="middle">
        (1,4)
      </text>
      <text x="320" y="95" fontSize="11" fill={accent} textAnchor="middle">
        (8,1)
      </text>
    </svg>
  );
}

function LineIntersectionDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Grid */}
      {[...Array(11)].map((_, i) => (
        <g key={`grid-${i}`}>
          <line x1={i * 40} y1="0" x2={i * 40} y2="250" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="0" y1={i * 25} x2="400" y2={i * 25} stroke="#e5e7eb" strokeWidth="1" />
        </g>
      ))}
      {/* Axes */}
      <line x1="40" y1="200" x2="360" y2="200" stroke={accent} strokeWidth="2" />
      <line x1="200" y1="230" x2="200" y2="20" stroke={accent} strokeWidth="2" />
      {/* Line 1 */}
      <line x1="80" y1="140" x2="320" y2="100" stroke="#4F46E5" strokeWidth="3" />
      {/* Line 2 */}
      <line x1="80" y1="160" x2="320" y2="80" stroke="#059669" strokeWidth="3" />
      {/* Intersection */}
      <circle cx="200" cy="120" r="6" fill="#ef4444" />
      <text x="200" y="135" fontSize="11" fill="#ef4444" fontWeight="700" textAnchor="middle">
        Solution
      </text>
    </svg>
  );
}

function SineWaveDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Axis */}
      <line x1="20" y1="125" x2="380" y2="125" stroke={accent} strokeWidth="2" />
      {/* Sine Wave */}
      <path
        d="M 20 125 Q 60 75 100 125 T 180 125 T 260 125 T 340 125 T 380 125"
        stroke={accent}
        strokeWidth="3"
        fill="none"
      />
      {/* Points */}
      {[20, 100, 180, 260, 340].map((x) => (
        <circle key={x} cx={x} cy="125" r="3" fill={accent} />
      ))}
      <text x="200" y="220" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        y = sin(x)
      </text>
    </svg>
  );
}

function TrigCircleDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 250 250">
      {/* Circle */}
      <circle cx="125" cy="125" r="80" fill="none" stroke={accent} strokeWidth="2" />
      {/* Axes */}
      <line x1="125" y1="45" x2="125" y2="205" stroke={accent} strokeWidth="1" />
      <line x1="45" y1="125" x2="205" y2="125" stroke={accent} strokeWidth="1" />
      {/* Points at 0°, 90°, 180°, 270° */}
      {[
        { x: 205, y: 125, label: "0°" },
        { x: 125, y: 45, label: "90°" },
        { x: 45, y: 125, label: "180°" },
        { x: 125, y: 205, label: "270°" },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={accent} />
          <text x={p.x} y={p.y - 15} fontSize="11" fill={accent} textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}
      <text x="125" y="230" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Unit Circle
      </text>
    </svg>
  );
}

function BellCurveDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Bell curve */}
      <path
        d="M 50 180 Q 100 80 200 50 Q 300 80 350 180"
        stroke={accent}
        strokeWidth="3"
        fill="none"
      />
      {/* Mean line */}
      <line x1="200" y1="50" x2="200" y2="180" stroke={accent} strokeWidth="2" strokeDasharray="5,5" />
      {/* Labels */}
      <text x="200" y="30" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        μ
      </text>
      <text x="200" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Normal Distribution
      </text>
    </svg>
  );
}

// ✅ CHEMISTRY DIAGRAMS
function BohrModelDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 250 250">
      {/* Nucleus */}
      <circle cx="125" cy="125" r="15" fill={accent} />
      {/* Electron orbits */}
      <circle cx="125" cy="125" r="50" fill="none" stroke={accent} strokeWidth="1" opacity="0.5" />
      <circle cx="125" cy="125" r="80" fill="none" stroke={accent} strokeWidth="1" opacity="0.5" />
      {/* Electrons */}
      <circle cx="175" cy="125" r="4" fill={accent} />
      <circle cx="125" cy="75" r="4" fill={accent} />
      <text x="125" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Bohr Model
      </text>
    </svg>
  );
}

function IonicBondDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Na atom */}
      <circle cx="80" cy="125" r="30" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="80" cy="125" r="5" fill={accent} />
      <text x="80" y="130" fontSize="14" fill="#fff" fontWeight="700" textAnchor="middle">
        Na
      </text>
      {/* Cl atom */}
      <circle cx="320" cy="125" r="30" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="320" cy="125" r="5" fill={accent} />
      <text x="320" y="130" fontSize="14" fill="#fff" fontWeight="700" textAnchor="middle">
        Cl
      </text>
      {/* Arrow */}
      <line x1="115" y1="125" x2="285" y2="125" stroke={accent} strokeWidth="2" />
      <polygon points="285,125 275,120 275,130" fill={accent} />
      {/* Electron */}
      <circle cx="150" cy="110" r="3" fill="#ef4444" />
      <text x="200" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Ionic Bond Formation
      </text>
    </svg>
  );
}

function CovalentBondDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Atoms */}
      <circle cx="100" cy="125" r="25" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="100" cy="125" r="5" fill={accent} />
      <circle cx="300" cy="125" r="25" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="300" cy="125" r="5" fill={accent} />
      {/* Shared electrons */}
      <circle cx="165" cy="115" r="3" fill="#ef4444" />
      <circle cx="165" cy="135" r="3" fill="#ef4444" />
      {/* Bond */}
      <line x1="130" y1="125" x2="270" y2="125" stroke={accent} strokeWidth="3" />
      <text x="200" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Covalent Bond
      </text>
    </svg>
  );
}

function VSEPRDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 250 250">
      {/* Central atom */}
      <circle cx="125" cy="125" r="15" fill={accent} />
      {/* Bonding pairs */}
      {[0, 90, 180, 270].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 125 + 60 * Math.cos(rad);
        const y = 125 + 60 * Math.sin(rad);
        return (
          <g key={angle}>
            <line x1="125" y1="125" x2={x} y2={y} stroke={accent} strokeWidth="2" />
            <circle cx={x} cy={y} r="8" fill="none" stroke={accent} strokeWidth="2" />
          </g>
        );
      })}
      <text x="125" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Tetrahedral
      </text>
    </svg>
  );
}

function PHScaleDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* pH Scale bar */}
      {[...Array(15)].map((_, i) => (
        <rect
          key={i}
          x={30 + i * 22}
          y="80"
          width="20"
          height="80"
          fill={
            i < 7
              ? `rgba(255, ${100 + i * 22}, 0, 0.8)`
              : i === 7
              ? "rgba(100, 100, 100, 0.8)"
              : `rgba(0, ${100 + (i - 7) * 22}, 255, 0.8)`
          }
        />
      ))}
      {/* Labels */}
      <text x="40" y="30" fontSize="11" fill={accent} fontWeight="600">
        Acidic
      </text>
      <text x="190" y="30" fontSize="11" fill={accent} fontWeight="600">
        Neutral (7)
      </text>
      <text x="340" y="30" fontSize="11" fill={accent} fontWeight="600">
        Basic
      </text>
      <text x="200" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        pH Scale (0-14)
      </text>
    </svg>
  );
}

function BenzeneDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 250 250">
      {/* Hexagon */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 125 + 50 * Math.cos(rad);
        const y1 = 125 + 50 * Math.sin(rad);
        const nextAngle = ((angle + 60) * Math.PI) / 180;
        const x2 = 125 + 50 * Math.cos(nextAngle);
        const y2 = 125 + 50 * Math.sin(nextAngle);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="3" />
        );
      })}
      {/* Inner circle */}
      <circle cx="125" cy="125" r="30" fill="none" stroke={accent} strokeWidth="2" opacity="0.5" />
      <text x="125" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Benzene (C₆H₆)
      </text>
    </svg>
  );
}

// ✅ BIOLOGY DIAGRAMS
function AnimalCellDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 300 250">
      {/* Cell membrane */}
      <ellipse cx="150" cy="125" rx="100" ry="80" fill="none" stroke={accent} strokeWidth="2" />
      {/* Nucleus */}
      <circle cx="150" cy="125" r="40" fill={`${accent}20`} stroke={accent} strokeWidth="2" />
      <circle cx="150" cy="125" r="8" fill={accent} />
      <text x="150" y="165" fontSize="10" fill={accent} textAnchor="middle">
        Nucleus
      </text>
      {/* Mitochondria */}
      <ellipse cx="80" cy="80" rx="15" ry="25" fill={`${accent}30`} stroke={accent} strokeWidth="1" />
      <text x="80" y="115" fontSize="9" fill={accent} textAnchor="middle">
        Mito
      </text>
      {/* Ribosome */}
      <circle cx="220" cy="80" r="10" fill={`${accent}30`} stroke={accent} strokeWidth="1" />
      <text x="220" y="105" fontSize="9" fill={accent} textAnchor="middle">
        Ribo
      </text>
    </svg>
  );
}

function PlantCellDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 300 250">
      {/* Cell wall */}
      <rect x="50" y="50" width="200" height="150" fill="none" stroke={accent} strokeWidth="3" />
      {/* Cell membrane */}
      <ellipse cx="150" cy="125" rx="90" ry="70" fill="none" stroke={accent} strokeWidth="2" />
      {/* Nucleus */}
      <circle cx="150" cy="125" r="30" fill={`${accent}20`} stroke={accent} strokeWidth="2" />
      {/* Chloroplast */}
      <ellipse cx="100" cy="80" rx="20" ry="25" fill="#22c55e" opacity="0.6" stroke="#16a34a" strokeWidth="2" />
      <text x="100" y="115" fontSize="9" fill={accent} textAnchor="middle">
        Chloro
      </text>
      <text x="150" y="220" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Plant Cell
      </text>
    </svg>
  );
}

function MitosisDiagram({ accent }) {
  const stages = ["Prophase", "Metaphase", "Anaphase", "Telophase"];
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {stages.map((stage, i) => (
        <g key={i}>
          {/* Cell */}
          <ellipse cx={60 + i * 90} cy="100" rx="30" ry="40" fill="none" stroke={accent} strokeWidth="2" />
          {/* Chromosomes - representation */}
          <line x1={50 + i * 90} y1="80" x2={70 + i * 90} y2="120" stroke={accent} strokeWidth="2" />
          {/* Label */}
          <text x={60 + i * 90} y="160" fontSize="10" fill={accent} textAnchor="middle">
            {stage}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MeiosisDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Parent cell */}
      <ellipse cx="100" cy="100" rx="40" ry="50" fill="none" stroke={accent} strokeWidth="2" />
      {/* Daughter cells */}
      <ellipse cx="250" cy="70" rx="30" ry="40" fill="none" stroke={accent} strokeWidth="2" />
      <ellipse cx="250" cy="150" rx="30" ry="40" fill="none" stroke={accent} strokeWidth="2" />
      {/* Arrows */}
      <line x1="145" y1="80" x2="215" y2="70" stroke={accent} strokeWidth="2" />
      <line x1="145" y1="120" x2="215" y2="150" stroke={accent} strokeWidth="2" />
      <polygon points="215,70 205,65 208,75" fill={accent} />
      <polygon points="215,150 205,145 208,155" fill={accent} />
      <text x="200" y="220" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Meiosis
      </text>
    </svg>
  );
}

function DNAStructureDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 250 250">
      {/* Double helix */}
      <path
        d="M 50 50 Q 80 100 50 150"
        stroke={accent}
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M 200 50 Q 170 100 200 150"
        stroke={accent}
        strokeWidth="3"
        fill="none"
      />
      {/* Base pairs */}
      {[50, 100, 150].map((y) => (
        <line key={y} x1="50" y1={y} x2="200" y2={y} stroke={accent} strokeWidth="2" opacity="0.6" />
      ))}
      <text x="125" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        DNA Double Helix
      </text>
    </svg>
  );
}

function PhotosynthesisDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Sun */}
      <circle cx="350" cy="30" r="20" fill="#fbbf24" />
      {/* Plant */}
      <ellipse cx="80" cy="150" rx="40" ry="60" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
      {/* Inputs */}
      <text x="200" y="60" fontSize="11" fill={accent} fontWeight="600">
        Light + CO₂ + H₂O
      </text>
      {/* Arrow */}
      <line x1="250" y1="80" x2="120" y2="130" stroke={accent} strokeWidth="2" />
      {/* Outputs */}
      <text x="200" y="210" fontSize="11" fill={accent} fontWeight="600">
        Glucose + O₂
      </text>
    </svg>
  );
}

function FoodChainDiagram({ accent }) {
  const organisms = ["Sun", "Plant", "Herbivore", "Carnivore"];
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {organisms.map((org, i) => (
        <g key={i}>
          {/* Box */}
          <rect x={30 + i * 90} y="80" width="70" height="60" fill="none" stroke={accent} strokeWidth="2" borderRadius="5" />
          {/* Text */}
          <text x={65 + i * 90} y="115" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">
            {org}
          </text>
          {/* Arrow */}
          {i < organisms.length - 1 && (
            <line x1={105 + i * 90} y1="110" x2={120 + i * 90} y2="110" stroke={accent} strokeWidth="2" />
          )}
          {i < organisms.length - 1 && (
            <polygon points={`${120 + i * 90},110 ${110 + i * 90},105 ${110 + i * 90},115`} fill={accent} />
          )}
        </g>
      ))}
    </svg>
  );
}

function PunnettSquareDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 300 250">
      {/* Grid */}
      <line x1="80" y1="40" x2="80" y2="160" stroke={accent} strokeWidth="2" />
      <line x1="160" y1="40" x2="160" y2="160" stroke={accent} strokeWidth="2" />
      <line x1="40" y1="80" x2="200" y2="80" stroke={accent} strokeWidth="2" />
      <line x1="40" y1="120" x2="200" y2="120" stroke={accent} strokeWidth="2" />
      {/* Alleles */}
      <text x="100" y="60" fontSize="12" fill={accent} textAnchor="middle" fontWeight="700">
        A
      </text>
      <text x="140" y="60" fontSize="12" fill={accent} textAnchor="middle" fontWeight="700">
        a
      </text>
      <text x="50" y="100" fontSize="12" fill={accent} textAnchor="middle" fontWeight="700">
        A
      </text>
      <text x="50" y="140" fontSize="12" fill={accent} textAnchor="middle" fontWeight="700">
        a
      </text>
      {/* Results */}
      <text x="100" y="100" fontSize="11" fill={accent} textAnchor="middle">
        AA
      </text>
      <text x="140" y="100" fontSize="11" fill={accent} textAnchor="middle">
        Aa
      </text>
      <text x="100" y="140" fontSize="11" fill={accent} textAnchor="middle">
        Aa
      </text>
      <text x="140" y="140" fontSize="11" fill={accent} textAnchor="middle">
        aa
      </text>
    </svg>
  );
}

// ✅ PHYSICS DIAGRAMS
function MotionGraphDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Axes */}
      <line x1="40" y1="200" x2="360" y2="200" stroke={accent} strokeWidth="2" />
      <line x1="40" y1="200" x2="40" y2="40" stroke={accent} strokeWidth="2" />
      {/* Curve */}
      <path
        d="M 60 180 Q 150 80 250 40 L 340 35"
        stroke={accent}
        strokeWidth="3"
        fill="none"
      />
      {/* Labels */}
      <text x="380" y="205" fontSize="11" fill={accent}>
        t
      </text>
      <text x="35" y="30" fontSize="11" fill={accent}>
        x
      </text>
    </svg>
  );
}

function ForceDiagramDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 300 250">
      {/* Object */}
      <rect x="130" y="100" width="40" height="40" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
      {/* Forces */}
      <line x1="150" y1="100" x2="150" y2="30" stroke="#4F46E5" strokeWidth="3" />
      <polygon points="150,30 145,40 155,40" fill="#4F46E5" />
      <text x="165" y="65" fontSize="11" fill="#4F46E5" fontWeight="600">
        F↑
      </text>

      <line x1="170" y1="120" x2="240" y2="120" stroke="#059669" strokeWidth="3" />
      <polygon points="240,120 230,115 230,125" fill="#059669" />
      <text x="200" y="140" fontSize="11" fill="#059669" fontWeight="600">
        F→
      </text>
    </svg>
  );
}

function CollisionDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Before */}
      <text x="100" y="30" fontSize="12" fill={accent} fontWeight="600">
        Before
      </text>
      <rect x="40" y="60" width="30" height="30" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
      <polygon points="90,75 110,70 110,80" fill={accent} />

      <rect x="230" y="60" width="30" height="30" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
      <polygon points="180,75 160,70 160,80" fill={accent} />

      {/* Arrow */}
      <line x1="100" y1="120" x2="280" y2="120" stroke={accent} strokeWidth="2" strokeDasharray="5,5" />

      {/* After */}
      <text x="100" y="160" fontSize="12" fill={accent} fontWeight="600">
        After
      </text>
      <rect x="110" y="190" width="30" height="30" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
      <rect x="170" y="190" width="30" height="30" fill={`${accent}30`} stroke={accent} strokeWidth="2" />
    </svg>
  );
}

function EnergyTransferDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* PE box */}
      <rect x="50" y="60" width="80" height="80" fill="none" stroke="#4F46E5" strokeWidth="2" />
      <text x="90" y="105" fontSize="12" fill="#4F46E5" fontWeight="600">
        PE
      </text>

      {/* Arrow */}
      <line x1="140" y1="100" x2="200" y2="100" stroke={accent} strokeWidth="2" />
      <polygon points="200,100 190,95 190,105" fill={accent} />

      {/* KE box */}
      <rect x="270" y="60" width="80" height="80" fill="none" stroke="#059669" strokeWidth="2" />
      <text x="310" y="105" fontSize="12" fill="#059669" fontWeight="600">
        KE
      </text>

      <text x="200" y="200" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Energy Conservation
      </text>
    </svg>
  );
}

function WavePropagationDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Wave */}
      <path
        d="M 20 100 Q 40 60 60 100 T 100 100 T 140 100 T 180 100 T 220 100 T 260 100 T 300 100 T 340 100"
        stroke={accent}
        strokeWidth="3"
        fill="none"
      />
      {/* Arrow */}
      <line x1="360" y1="100" x2="380" y2="100" stroke={accent} strokeWidth="2" />
      <polygon points="380,100 370,95 370,105" fill={accent} />
      <text x="200" y="200" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Wave Motion
      </text>
    </svg>
  );
}

function ElectricFieldDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 300 250">
      {/* Charge */}
      <circle cx="150" cy="100" r="15" fill={accent} />
      <text x="150" y="105" fontSize="16" fill="#fff" fontWeight="700" textAnchor="middle">
        +
      </text>
      {/* Field lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 150 + 20 * Math.cos(rad);
        const y1 = 100 + 20 * Math.sin(rad);
        const x2 = 150 + 80 * Math.cos(rad);
        const y2 = 100 + 80 * Math.sin(rad);
        return (
          <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="1" />
        );
      })}
      <text x="150" y="210" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Electric Field
      </text>
    </svg>
  );
}

function CircuitDiagramDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Battery */}
      <line x1="50" y1="100" x2="50" y2="150" stroke={accent} strokeWidth="3" />
      <line x1="70" y1="100" x2="70" y2="150" stroke={accent} strokeWidth="3" />
      {/* Wire */}
      <line x1="70" y1="125" x2="200" y2="125" stroke={accent} strokeWidth="2" />
      {/* Resistor */}
      <rect x="200" y="115" width="40" height="20" fill="none" stroke={accent} strokeWidth="2" />
      {/* Wire back */}
      <line x1="240" y1="125" x2="350" y2="125" stroke={accent} strokeWidth="2" />
      <line x1="350" y1="125" x2="350" y2="150" stroke={accent} strokeWidth="2" />
      <line x1="350" y1="150" x2="50" y2="150" stroke={accent} strokeWidth="2" />
      <text x="200" y="200" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Simple Circuit
      </text>
    </svg>
  );
}

// ✅ AI DIAGRAMS
function NetworkArchitectureDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Input layer */}
      {[1, 2, 3].map((i) => (
        <circle key={`input-${i}`} cx="50" cy={50 + i * 50} r="8" fill={accent} />
      ))}
      {/* Hidden layer */}
      {[1, 2, 3, 4].map((i) => (
        <circle key={`hidden-${i}`} cx="200" cy={40 + i * 40} r="8" fill={accent} />
      ))}
      {/* Output layer */}
      {[1, 2].map((i) => (
        <circle key={`output-${i}`} cx="350" cy={75 + i * 50} r="8" fill={accent} />
      ))}
      {/* Connections */}
      {[1, 2, 3].map((i) =>
        [1, 2, 3, 4].map((j) => (
          <line
            key={`line-${i}-${j}`}
            x1="58"
            y1={50 + i * 50}
            x2="192"
            y2={40 + j * 40}
            stroke={accent}
            strokeWidth="1"
            opacity="0.3"
          />
        ))
      )}
      <text x="200" y="230" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Neural Network
      </text>
    </svg>
  );
}

function AttentionDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Query, Key, Value boxes */}
      {["Query", "Key", "Value"].map((label, i) => (
        <g key={label}>
          <rect x={50 + i * 110} y="40" width="80" height="40" fill={`${accent}20`} stroke={accent} strokeWidth="2" borderRadius="5" />
          <text x={90 + i * 110} y="65" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">
            {label}
          </text>
        </g>
      ))}
      {/* Attention weights */}
      <text x="200" y="140" fontSize="12" fill={accent} fontWeight="600" textAnchor="middle">
        Similarity Computation
      </text>
      {/* Output */}
      <rect x="150" y="170" width="100" height="40" fill={`${accent}20`} stroke={accent} strokeWidth="2" borderRadius="5" />
      <text x="200" y="195" fontSize="11" fill={accent} textAnchor="middle" fontWeight="600">
        Attention Output
      </text>
    </svg>
  );
}

function GradientDescentDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      {/* Loss landscape */}
      <path
        d="M 50 80 Q 150 40 250 100 Q 300 130 350 180"
        stroke={accent}
        strokeWidth="3"
        fill="none"
      />
      {/* Gradient arrows */}
      <line x1="100" y1="60" x2="90" y2="75" stroke="#ef4444" strokeWidth="2" />
      <polygon points="90,75 94,65 86,68" fill="#ef4444" />

      <line x1="200" y1="50" x2="190" y2="65" stroke="#ef4444" strokeWidth="2" />
      <polygon points="190,65 194,55 186,58" fill="#ef4444" />

      {/* Minimum */}
      <circle cx="280" cy="110" r="8" fill="#22c55e" />
      <text x="200" y="230" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Gradient Descent
      </text>
    </svg>
  );
}

// ✅ GENERIC FALLBACK
function GenericDiagram({ accent }) {
  return (
    <svg width="100%" height="250" viewBox="0 0 400 250">
      <rect x="50" y="50" width="100" height="80" fill="none" stroke={accent} strokeWidth="2" />
      <rect x="250" y="50" width="100" height="80" fill="none" stroke={accent} strokeWidth="2" />
      <line x1="150" y1="90" x2="250" y2="90" stroke={accent} strokeWidth="2" />
      <polygon points="250,90 240,85 240,95" fill={accent} />
      <text x="100" y="110" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Input
      </text>
      <text x="300" y="110" fontSize="12" fill={accent} textAnchor="middle" fontWeight="600">
        Output
      </text>
    </svg>
  );
}