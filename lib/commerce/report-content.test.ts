import assert from "node:assert/strict";
import test from "node:test";
import { completeReportContent } from "./report-content";
test("paid reports require content in every unique chapter",()=>{
  const markers=["DAY_MASTER","CAREER","LOVE"];
  const full=markers.map(m=>`[${m}] ${"A complete, readable section. ".repeat(5)}`).join("\n");
  assert.equal(completeReportContent(full,markers),true);
  assert.equal(completeReportContent(`[DAY_MASTER] ${"long text ".repeat(50)}[CAREER]\n[LOVE]`,markers),false);
  assert.equal(completeReportContent(full+"\n[LOVE] Duplicate chapter",markers),false);
  assert.equal(completeReportContent(full.replace("[LOVE]","[UNKNOWN]"),markers),false);
});
