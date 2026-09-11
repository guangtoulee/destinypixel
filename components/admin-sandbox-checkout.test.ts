import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("the sandbox form renders only for an enabled administrator and only lists supplied owned reports", () => {
  const require = createRequire(import.meta.url);
  const runtime = require("node:module") as { _load: (name: string, parent: unknown, isMain: boolean) => unknown };
  const originalLoad = runtime._load;
  runtime._load = (name, parent, isMain) => name.endsWith(".module.css") ? {} : name === "next/navigation" ? { useRouter: () => ({ push: () => undefined }) } : originalLoad(name, parent, isMain);
  try {
    const Checkout = (require("./admin-sandbox-checkout") as typeof import("./admin-sandbox-checkout")).default;
    const reports = [{ id: "11111111-1111-4111-8111-111111111111", title: "Owned synthetic report" }];
    const base = { locale: "zh" as const, isAdmin: true, reports, offer: { available: true, mode: "sandbox", price: "6.99", currency: "USD" } };
    for (const props of [
      { ...base, isAdmin: false },
      { ...base, offer: { ...base.offer, available: false } },
      { ...base, offer: { ...base.offer, mode: "live" } },
      { ...base, offer: { ...base.offer, mode: "disabled" } },
    ]) assert.equal(renderToStaticMarkup(createElement(Checkout, props)), "");
    const html = renderToStaticMarkup(createElement(Checkout, base));
    assert.match(html, /PayPal 沙盒测试（不扣真钱）/);
    assert.match(html, /Owned synthetic report/);
    assert.equal((html.match(/<option /g) || []).length, 1);
    assert.match(html, /6\.99/);
    const empty = renderToStaticMarkup(createElement(Checkout, { ...base, reports: [] }));
    assert.doesNotMatch(empty, /<form/);
    assert.match(empty, /创建报告/);
  } finally {
    runtime._load = originalLoad;
  }
});
