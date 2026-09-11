import assert from "node:assert/strict";
import test from "node:test";
import { analyticsPage, isMainSitePath, sanitizeAnalyticsUrl, toolForForm, trackToolEvent } from "./analytics";

test("the metaphysics funnel includes bracelets and excludes standalone experiments", () => {
  for (const path of ["/", "/tuteng", "/atelier", "/oracle", "/palm", "/face", "/sticks", "/tools", "/learn", "/report/example"]) {
    assert.equal(isMainSitePath(path), true, path);
  }
  for (const path of ["/prompt", "/prompt/case/example", "/juben", "/daoyan", "/image", "/english", "/danci", "/candy", "/jake"]) {
    assert.equal(isMainSitePath(path), false, path);
  }
});

test("analytics never receives report ids, birth data, questions, or totem fragments", () => {
  const raw = "https://www.destinypixel.com/report/private-id?name=Alice&birthDate=1990-01-01&city=Shanghai&question=private&locale=zh#totem=secret";
  assert.equal(sanitizeAnalyticsUrl(raw), "https://www.destinypixel.com/report/[id]?locale=zh");
  assert.equal(analyticsPage("/report/private-id"), "/report/[id]");
  assert.equal(analyticsPage("/unexpected/private-id"), "other");
});

test("only controlled campaign labels survive URL sanitization", () => {
  assert.equal(sanitizeAnalyticsUrl("https://www.destinypixel.com/tuteng?utm_source=xiaohongshu&utm_medium=social&utm_campaign=totem_demo&email=private#totem=private"),
    "https://www.destinypixel.com/tuteng?utm_source=xiaohongshu&utm_medium=social&utm_campaign=totem_demo");
  assert.equal(sanitizeAnalyticsUrl("https://www.destinypixel.com/?utm_source=private-person&locale=unknown"), "https://www.destinypixel.com/");
  assert.equal(sanitizeAnalyticsUrl("https://www.destinypixel.com/api/private?secret=1"), null);
  assert.equal(sanitizeAnalyticsUrl("invalid"), null);
});

test("account and checkout analytics remove credentials and payment identifiers",()=>{
  assert.equal(sanitizeAnalyticsUrl("https://www.destinypixel.com/account?reset=PRIVATE&returnTo=%2Freport%2FPRIVATE&email=PRIVATE&locale=zh"),"https://www.destinypixel.com/account?locale=zh");
  assert.equal(sanitizeAnalyticsUrl("https://www.destinypixel.com/checkout/paypal/return?order=PRIVATE&token=PRIVATE&PayerID=PRIVATE"),"https://www.destinypixel.com/checkout/paypal/return");
  assert.equal(sanitizeAnalyticsUrl("https://www.destinypixel.com/admin"),null);
});

test("form event names are from the product allowlist", () => {
  assert.equal(toolForForm("totem"), "totem");
  assert.equal(toolForForm("prompt_expand"), "prompt_expand");
  assert.equal(toolForForm("user supplied text"), null);
});

test("events before the SDK mounts are queued after URL redaction is configured", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const fakeWindow = {} as Window;
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  try {
    trackToolEvent("tool_start", "birth_report");
    assert.equal(fakeWindow.vaq?.[0][0], "beforeSend");
    assert.equal(fakeWindow.vaq?.[1][0], "event");
    assert.deepEqual(fakeWindow.vaq?.[1][1], { name: "tool_start", data: { tool: "birth_report", area: "main" }, options: undefined });
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
