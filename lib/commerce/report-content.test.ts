import assert from "node:assert/strict";
import test from "node:test";
import { completeReportContent, normalizeReportContent } from "./report-content";
test("paid reports require content in every unique chapter",()=>{
  const markers=["DAY_MASTER","CAREER","LOVE"];
  const full=markers.map(m=>`[${m}] ${"A complete, readable section. ".repeat(5)}`).join("\n");
  assert.equal(completeReportContent(full,markers),true);
  assert.equal(completeReportContent(`[DAY_MASTER] ${"long text ".repeat(50)}[CAREER]\n[LOVE]`,markers),false);
  assert.equal(completeReportContent(full+"\n[LOVE] Duplicate chapter",markers),false);
  assert.equal(completeReportContent(full.replace("[LOVE]","[UNKNOWN]"),markers),false);
});

test("provider end labels are removed without accepting duplicate or incomplete chapters", () => {
  const markers = ["DAY_MASTER", "CAREER", "LOVE"];
  const body = "A complete, readable section with meaningful interpretation. ".repeat(4);
  const raw = markers.map(marker => `[${marker}]\n${body}\n[${marker}] 结束。`).join("\n\n");
  assert.equal(completeReportContent(raw, markers), false);
  const normalized = normalizeReportContent(raw, markers);
  assert.equal(completeReportContent(normalized, markers), true);
  assert.equal(normalized.includes("结束。"), false);
  assert.equal(normalizeReportContent(normalized, markers), normalized);
  assert.equal(completeReportContent(normalizeReportContent(raw.replaceAll("结束。", "End."), markers), markers), true);
  for (const invalid of [
    normalized + `\n[LOVE]\n${body}`,
    normalized + "\n[LOVE] End. Additional chapter text.",
    normalized + "\n[CAREER] 结束。",
    raw.replace(`[CAREER]\n${body}`, "[CAREER]\n"),
    raw.replaceAll("[LOVE]", "[UNKNOWN]"),
  ]) assert.equal(completeReportContent(normalizeReportContent(invalid, markers), markers), false);
});
