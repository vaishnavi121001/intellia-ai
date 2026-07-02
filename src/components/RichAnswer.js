"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

export default function RichAnswer({ text, accent }) {

  // ─── KaTeX helpers ────────────────────────────────────────────────────────
  const renderLatexBlock = (src) => {
    try {
      const fixed = src.trim()
        .replace(/⟹/g, "\\Rightarrow")
        .replace(/–/g, "-");
      return katex.renderToString(fixed, { throwOnError: false, displayMode: true, output: "html" });
    } catch (e) {
      return `<code style="color:#dc2626">${src}</code>`;
    }
  };

  const renderLatexInline = (src) => {
    try {
      const fixed = src.trim()
        .replace(/⟹/g, "\\Rightarrow")
        .replace(/–/g, "-");
      return katex.renderToString(fixed, { throwOnError: false, displayMode: false, output: "html" });
    } catch {
      return `<code>${src}</code>`;
    }
  };

  // ─── Inline markdown + math parser ───────────────────────────────────────
  // Handles: \[...\], \(...\), $$...$$, $...$, **bold**, *italic*, `code`
  const renderInline = (raw, keyPrefix = "") => {
    if (!raw) return null;
    const parts = [];
    // Combined regex: display math first, then inline math, then bold, italic, code
    const re = /\\\[(.+?)\\\]|\\\((.+?)\\\)|\$\$(.+?)\$\$|\$(.+?)\$|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/gs;
    let last = 0;
    let i = 0;
    let m;

    while ((m = re.exec(raw)) !== null) {
      if (m.index > last) {
        parts.push(<span key={`${keyPrefix}t${i}`}>{raw.slice(last, m.index)}</span>);
      }

      if (m[1] !== undefined) {
        // \[...\] display math — render inline here (block display handled in paragraph wrapper)
        parts.push(
          <span key={`${keyPrefix}dm${i}`}
            dangerouslySetInnerHTML={{ __html: renderLatexBlock(m[1]) }}
            style={{ margin: "0 2px" }}
          />
        );
      } else if (m[2] !== undefined) {
        // \(...\) inline math
        parts.push(
          <span key={`${keyPrefix}im${i}`}
            dangerouslySetInnerHTML={{ __html: renderLatexInline(m[2]) }}
            style={{ margin: "0 2px" }}
          />
        );
      } else if (m[3] !== undefined) {
        // $$...$$ display math
        parts.push(
          <span key={`${keyPrefix}dd${i}`}
            dangerouslySetInnerHTML={{ __html: renderLatexBlock(m[3]) }}
            style={{ margin: "0 2px" }}
          />
        );
      } else if (m[4] !== undefined) {
        // $...$ inline math
        parts.push(
          <span key={`${keyPrefix}sd${i}`}
            dangerouslySetInnerHTML={{ __html: renderLatexInline(m[4]) }}
            style={{ margin: "0 2px" }}
          />
        );
      } else if (m[5] !== undefined) {
        // **bold**
        parts.push(<strong key={`${keyPrefix}b${i}`} style={{ fontWeight: 700, color: "#f8fafc" }}>{m[5]}</strong>);
      } else if (m[6] !== undefined) {
        // *italic*
        parts.push(<em key={`${keyPrefix}em${i}`}>{m[6]}</em>);
      } else if (m[7] !== undefined) {
        // `code`
        parts.push(
          <code key={`${keyPrefix}c${i}`} style={{
            background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "2px 7px",
            fontSize: "0.87em", fontFamily: "monospace", color: "#fca5a5",
          }}>{m[7]}</code>
        );
      }

      last = re.lastIndex;
      i++;
    }

    if (last < raw.length) {
      parts.push(<span key={`${keyPrefix}end`}>{raw.slice(last)}</span>);
    }

    return parts;
  };

  // ─── Math-only token parser (for paragraph-level math blocks) ────────────
  const parseToElements = (raw) => {
    const elements = [];
    let pos = 0;

    while (pos < raw.length) {
      const candidates = [
        { pos: raw.indexOf("\\[", pos), type: "\\[" },
        { pos: raw.indexOf("\\(", pos), type: "\\(" },
        { pos: raw.indexOf("$$", pos), type: "$$" },
      ];

      // single $ only if not $$
      const sd = raw.indexOf("$", pos);
      if (sd !== -1 && raw[sd + 1] !== "$") {
        candidates.push({ pos: sd, type: "$" });
      }

      const valid = candidates.filter((c) => c.pos !== -1).sort((a, b) => a.pos - b.pos);

      if (!valid.length) {
        const tail = raw.substring(pos);
        if (tail) elements.push({ type: "text", content: tail });
        break;
      }

      const closest = valid[0];

      if (closest.pos > pos) {
        elements.push({ type: "text", content: raw.substring(pos, closest.pos) });
      }

      let endDelim, mathContent, mathType, skip;

      if (closest.type === "\\[") {
        endDelim = raw.indexOf("\\]", closest.pos + 2);
        if (endDelim === -1) { elements.push({ type: "text", content: "\\[" }); pos = closest.pos + 2; continue; }
        mathContent = raw.substring(closest.pos + 2, endDelim);
        mathType = "display"; skip = endDelim + 2;
      } else if (closest.type === "\\(") {
        endDelim = raw.indexOf("\\)", closest.pos + 2);
        if (endDelim === -1) { elements.push({ type: "text", content: "\\(" }); pos = closest.pos + 2; continue; }
        mathContent = raw.substring(closest.pos + 2, endDelim);
        mathType = "inline"; skip = endDelim + 2;
      } else if (closest.type === "$$") {
        endDelim = raw.indexOf("$$", closest.pos + 2);
        if (endDelim === -1) { elements.push({ type: "text", content: "$$" }); pos = closest.pos + 2; continue; }
        mathContent = raw.substring(closest.pos + 2, endDelim);
        mathType = "display"; skip = endDelim + 2;
      } else {
        endDelim = raw.indexOf("$", closest.pos + 1);
        if (endDelim === -1) { elements.push({ type: "text", content: "$" }); pos = closest.pos + 1; continue; }
        mathContent = raw.substring(closest.pos + 1, endDelim);
        mathType = "inline"; skip = endDelim + 1;
      }

      if (mathContent.trim()) elements.push({ type: "math", mathType, content: mathContent });
      pos = skip;
    }

    return elements;
  };

  // ─── Document structure parser ────────────────────────────────────────────
  const parseDocument = (raw) => {
    const lines = raw.split("\n");
    const nodes = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) { nodes.push({ type: "space" }); i++; continue; }

      // Heading
      const hm = line.match(/^(#{1,6})\s+(.+)$/);
      if (hm) { nodes.push({ type: "heading", level: hm[1].length, content: hm[2] }); i++; continue; }

      // HR
      if (line.match(/^-{3,}$/)) { nodes.push({ type: "hr" }); i++; continue; }

      // List
      if (/^[\s]*[-*+]\s/.test(line) || /^[\s]*\d+\.\s/.test(line)) {
        const items = [];
        while (i < lines.length && (/^[\s]*[-*+]\s/.test(lines[i]) || /^[\s]*\d+\.\s/.test(lines[i]))) {
          const depth = lines[i].match(/^([\s]*)/)[1].length;
          const content = lines[i].replace(/^[\s]*[-*+\d.]+\s+/, "");
          items.push({ depth, content });
          i++;
        }
        if (items.length) nodes.push({ type: "list", items });
        continue;
      }

      // Code block
      if (line.includes("```")) {
        const lang = line.replace(/`/g, "").trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].includes("```")) { codeLines.push(lines[i]); i++; }
        if (codeLines.length) nodes.push({ type: "code", lang, content: codeLines.join("\n") });
        i++; continue;
      }

      // Table
      if (line.includes("|")) {
        const tableLines = [line]; i++;
        while (i < lines.length && lines[i].includes("|")) { tableLines.push(lines[i]); i++; }
        nodes.push({ type: "table", lines: tableLines });
        continue;
      }

      // Paragraph
      const paraLines = [];
      while (i < lines.length) {
        const l = lines[i];
        if (!l.trim() || l.match(/^#{1,6}\s/) || l.match(/^-{3,}$/) ||
            /^[\s]*[-*+\d.]\s/.test(l) || l.includes("```") || l.includes("|")) break;
        paraLines.push(l);
        i++;
      }
      if (paraLines.length) {
        const paraContent = paraLines.join("\n");
        const elements = parseToElements(paraContent);
        nodes.push({ type: "paragraph", elements });
      }
    }

    return nodes;
  };

  // ─── Render paragraph elements (math blocks + inline text) ───────────────
  const renderParagraphElements = (elements) => {
    return elements.map((elem, idx) => {
      if (elem.type === "text") {
        // Parse inline markdown (bold, italic, code, inline math) inside text segments
        return (
          <span key={idx} style={{ whiteSpace: "pre-wrap" }}>
            {renderInline(elem.content, `p${idx}`)}
          </span>
        );
      }
      if (elem.type === "math") {
        if (elem.mathType === "display") {
          return (
            <div key={idx} style={{
              background: "rgba(255,255,255,0.05)",
              border: `1.5px solid ${accent}30`,
              borderLeft: `4px solid ${accent}`,
              borderRadius: 14,
              padding: "24px 28px",
              margin: "24px 0",
              overflowX: "auto",
            }}>
              <div style={{ textAlign: "center", fontSize: 18, lineHeight: 2.2, color: "#f1f5f9" }}
                dangerouslySetInnerHTML={{ __html: renderLatexBlock(elem.content) }}
              />
            </div>
          );
        }
        return (
          <span key={idx}
            dangerouslySetInnerHTML={{ __html: renderLatexInline(elem.content) }}
            style={{ margin: "0 2px" }}
          />
        );
      }
      return null;
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const nodes = parseDocument(text);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: 1.85, color: "#e5e7eb", fontSize: 16.5 }}>
      {nodes.map((node, idx) => {
        if (node.type === "space") return <div key={idx} style={{ height: 14 }} />;

        if (node.type === "hr") return (
          <hr key={idx} style={{ border: "none", borderTop: `1px solid ${accent}22`, margin: "30px 0" }} />
        );

        if (node.type === "heading") {
          // ✅ Bigger, more premium heading scale (ChatGPT/Claude-style hierarchy)
          const sizes = { 1: 34, 2: 27, 3: 22, 4: 19, 5: 17, 6: 15 };
          return (
            <div key={idx} style={{
              fontSize: sizes[node.level] || 18,
              fontWeight: 750,
              color: "#f8fafc",
              margin: `${34 - node.level * 2}px 0 14px`,
              background: "rgba(255,255,255,0.05)",
              border: `1.5px solid ${accent}40`,
              borderLeft: `5px solid ${accent}`,
              borderRadius: 14,
              padding: node.level === 1 ? "18px 22px" : "14px 20px",
              letterSpacing: node.level === 1 ? "-0.5px" : "-0.2px",
            }}>
              {/* Headings can also have bold/italic/math */}
              {renderInline(node.content, `h${idx}`)}
            </div>
          );
        }

        if (node.type === "list") return (
          <ul key={idx} style={{ margin: "16px 0", paddingLeft: 0, listStyle: "none" }}>
            {node.items.map((item, ii) => (
              <li key={ii} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                marginBottom: 10, paddingLeft: item.depth * 18,
              }}>
                <span style={{
                  marginTop: 9, width: 7, height: 7, borderRadius: "50%",
                  background: accent, flexShrink: 0,
                }} />
                <span style={{ lineHeight: 1.8, color: "#cbd5e1", fontSize: 16 }}>
                  {/* List items get full inline rendering too */}
                  {renderInline(item.content, `li${idx}-${ii}`)}
                </span>
              </li>
            ))}
          </ul>
        );

        if (node.type === "code") return (
          <div key={idx} style={{ margin: "20px 0", borderRadius: 14, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <div style={{
              background: "#1f2937", padding: "12px 18px",
              display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>
                {node.lang || "code"}
              </span>
            </div>
            <pre style={{
              background: "#111827", color: "#f3f4f6", padding: "20px 24px",
              overflowX: "auto", fontSize: 14, lineHeight: 1.75, margin: 0, fontFamily: "monospace",
            }}>
              <code>{node.content}</code>
            </pre>
          </div>
        );

        if (node.type === "table") return (
          // ✅ More spacious, premium table treatment
          <div key={idx} style={{ margin: "22px 0", overflowX: "auto", borderRadius: 16, border: `1.5px solid ${accent}30`, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5, minWidth: 480 }}>
              <tbody>
                {node.lines.map((line, li) => (
                  <tr key={li}>
                    {line.split("|").filter((c) => c.trim()).map((cell, ci) => (
                      <td key={ci} style={{
                        padding: "16px 22px",
                        borderBottom: `1px solid ${accent}25`,
                        borderRight: ci === 0 ? `1px solid ${accent}25` : "none",
                        background: li === 0 ? `${accent}22` : "rgba(255,255,255,0.03)",
                        fontWeight: li === 0 ? 700 : 400,
                        color: li === 0 ? "#f8fafc" : "#cbd5e1",
                      }}>
                        {renderInline(cell.trim(), `td${li}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

        if (node.type === "paragraph") return (
          <div key={idx} style={{ margin: "14px 0", fontSize: 16.5, lineHeight: 1.85, color: "#cbd5e1" }}>
            {renderParagraphElements(node.elements)}
          </div>
        );

        return null;
      })}
    </div>
  );
}
