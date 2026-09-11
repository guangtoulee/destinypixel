/** Remove only a provider's standalone, redundant end label after a real chapter. */
export function normalizeReportContent(content: string, markers: readonly string[]) {
  const allowed = new Set(markers);
  let activeMarker: string | null = null;
  let chapterCharacters = 0;
  return content.split(/\r?\n/).filter(line => {
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
