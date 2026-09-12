// Provider upgrades may translate headings despite the ASCII-marker instruction.
// Only exact, standalone headings are mapped; prose is never rewritten.
const chapterAliases: Record<string, string> = {
  日主: "DAY_MASTER", 内在核心: "DAY_MASTER", 內在核心: "DAY_MASTER", 核心模式: "DAY_MASTER",
  外在形象: "OUTER_PERSONA", 社会面具: "OUTER_PERSONA", 社會面具: "OUTER_PERSONA",
  深层自我: "DEEP_SELF", 深層自我: "DEEP_SELF", 内核心理: "DEEP_SELF", 內核心理: "DEEP_SELF",
  事业: "CAREER", 事業: "CAREER", 爱情: "LOVE", 愛情: "LOVE", 感情: "LOVE",
  成长: "GROWTH", 成長: "GROWTH", 健康: "HEALTH",
  年度概览: "OVERVIEW", 年度概覽: "OVERVIEW", 总览: "OVERVIEW", 總覽: "OVERVIEW",
};

/** Normalize known headings and redundant end labels, retaining completeness checks. */
export function normalizeReportContent(content: string, markers: readonly string[]) {
  const allowed = new Set(markers);
  let activeMarker: string | null = null;
  let chapterCharacters = 0;
  return content.split(/\r?\n/).map(line => {
    const heading = /^\s*\[([^\[\]]+)\]\s*$/.exec(line);
    const canonical = heading && chapterAliases[heading[1]];
    return canonical && allowed.has(canonical) ? `[${canonical}]` : line;
  }).filter(line => {
    const ending = /^\s*\[([A-Z0-9_]+)\]\s*(?:结束[。.!]?|[Ee][Nn][Dd][.!]?)\s*$/.exec(line);
    if (ending && ending[1] === activeMarker && chapterCharacters >= 30) return false;
    const heading = /^\s*\[([A-Z0-9_]+)\](.*)$/.exec(line);
    if (heading) {
      activeMarker = allowed.has(heading[1]) ? heading[1] : null;
      chapterCharacters = heading[2].trim().length;
    } else {
      chapterCharacters += line.trim().length;
    }
    return true;
  }).join("\n").trim();
}

/** A paid chapter must contain prose, not only a marker or another chapter's text. */
export function completeReportContent(content: string, markers: readonly string[]) {
  if (content.length < 300 || content.length > 80_000) return false;
  return markers.every(marker => {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = [...content.matchAll(new RegExp(`\\[${escaped}\\]\\s*([\\s\\S]*?)(?=\\[[A-Z0-9_]+\\]|$)`, "g"))];
    return matches.length === 1 && matches[0][1].replace(/\s+/g," ").trim().length >= 30;
  });
}
