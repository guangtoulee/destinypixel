/** A paid chapter must contain prose, not only a marker or another chapter's text. */
export function completeReportContent(content: string, markers: readonly string[]) {
  if (content.length < 300 || content.length > 80_000) return false;
  return markers.every(marker => {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = [...content.matchAll(new RegExp(`\\[${escaped}\\]\\s*([\\s\\S]*?)(?=\\[[A-Z0-9_]+\\]|$)`, "g"))];
    return matches.length === 1 && matches[0][1].replace(/\s+/g," ").trim().length >= 30;
  });
}
