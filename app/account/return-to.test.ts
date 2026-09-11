import assert from "node:assert/strict";
import test from "node:test";
import { safeAccountReturnTo } from "./return-to";

test("authentication returns only to account or a report and drops unrelated query values", () => {
  assert.equal(safeAccountReturnTo("/report/abc-123?locale=zh&paid=true&token=private#full"), "/report/abc-123?locale=zh");
  assert.equal(safeAccountReturnTo("/account?locale=zh&returnTo=https://example.com"), "/account?locale=zh");
  assert.equal(safeAccountReturnTo("/report/abc_123?locale=unsupported"), "/report/abc_123");
});

test("external, protocol-relative, encoded path and unexpected destinations fail closed", () => {
  for (const value of ["https://example.com", "//example.com/report/a", "/\\example.com", "/report/a%2fb", "/report/a\n", "/api/admin/overview", "/admin", "/prompt", "javascript:alert(1)", "/report/a/extra", "/%2fexample.com"]) {
    assert.equal(safeAccountReturnTo(value, "zh"), "/account?locale=zh", value);
  }
  assert.equal(safeAccountReturnTo(undefined), "/account");
});
