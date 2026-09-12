import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_DEEPSEEK_REPORT_MODEL, deepSeekReportModel } from "./deepseek-report-model";

test("report generation defaults to the current DeepSeek flash id", () => {
  assert.equal(DEFAULT_DEEPSEEK_REPORT_MODEL, "deepseek-flash");
  assert.equal(deepSeekReportModel(undefined), "deepseek-flash");
  assert.equal(deepSeekReportModel(""), "deepseek-flash");
  assert.equal(deepSeekReportModel("   "), "deepseek-flash");
  assert.equal(deepSeekReportModel("deepseek-v4-flash"), "deepseek-v4-flash");
  assert.equal(deepSeekReportModel(" deepseek-flash "), "deepseek-flash");
});
