import assert from "node:assert/strict";
import test from "node:test";
import { analyticsPage, isMainSitePath, sanitizeAnalyticsUrl, toolForForm, trackToolEvent, type AnalyticsTool, type ToolEvent } from "./analytics";

test("the metaphysics funnel includes bracelets and excludes standalone experiments", () => {
  for (const path of ["/", "/tuteng", "/atelier", "/oracle", "/palm", "/face", "/sticks", "/compatibility", "/tools", "/learn", "/learn/what-is-bazi-birth-chart", "/insights/bazi-love-compatibility", "/report/example", "/day-pillar", "/journal", "/journal/prepare-birth-date-time-place"]) {
    assert.equal(isMainSitePath(path), true, path);
  }
  for (const path of ["/prompt", "/prompt/case/example", "/juben", "/daoyan", "/image", "/english", "/danci", "/candy", "/jake", "/journalism", "/day-pillar-extra", "/compatibility-private", "/learning", "/insights-private"]) {
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
  assert.equal(toolForForm("day_pillar"), "day_pillar");
  assert.equal(toolForForm("compatibility"), "compatibility");
  assert.equal(toolForForm("temple_sticks"), "temple_sticks");
  assert.equal(toolForForm("prompt_expand"), "prompt_expand");
  assert.equal(toolForForm("user supplied text"), null);
});

test("day cards keep campaign attribution without birth dates, names or shared archetypes", () => {
  const raw = "https://www.destinypixel.com/day-pillar?locale=zh&utm_source=wechat&utm_medium=social&utm_campaign=day_card&date=1990-01-01&birthDate=1990-01-01&name=Alice&pillar=jia-yin&cardType=tiger#birthday=1990-01-01";
  assert.equal(sanitizeAnalyticsUrl(raw), "https://www.destinypixel.com/day-pillar?locale=zh&utm_source=wechat&utm_medium=social&utm_campaign=day_card");
  assert.equal(analyticsPage("/day-pillar"), "/day-pillar");
  assert.equal(analyticsPage("/journal"), "/journal");
  assert.equal(analyticsPage("/journal/prepare-birth-date-time-place"), "/journal/[slug]");
  assert.equal(analyticsPage("/prompt/case/example"), "/prompt/case/[id]");
});

test("day pillar events contain only the fixed tool and main-site area", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const fakeWindow = {} as Window;
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  try {
    trackToolEvent("tool_success", "day_pillar");
    assert.deepEqual(fakeWindow.vaq?.[1][1], { name: "tool_success", data: { tool: "day_pillar", area: "main" }, options: undefined });
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
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


test("discovery campaigns stay measurable without private birthday fields", () => {
  assert.equal(isMainSitePath("/discover"), true);
  assert.equal(analyticsPage("/discover"), "/discover");
  assert.equal(sanitizeAnalyticsUrl("https://www.destinypixel.com/discover?utm_source=instagram&utm_medium=social&utm_campaign=day_card&birthday=2003-02-20&email=private"), "https://www.destinypixel.com/discover?utm_source=instagram&utm_medium=social&utm_campaign=day_card");
});

test("relationship and oracle campaigns preserve attribution without either person's data or question", () => {
  const privateFields = "&name=Alice&partnerName=Bob&birthDate=1990-01-01&partnerBirthDate=1991-02-02&birthTime=09%3A30&birthCity=Shanghai&question=Will+we+stay+together&topic=love&score=87#result=PRIVATE";
  for (const [path, campaign] of [["/compatibility", "love_compatibility"], ["/sticks", "temple_sticks"]]) {
    for (const source of ["reddit", "quora", "threads", "pinterest", "tiktok"]) {
      const clean = `https://www.destinypixel.com${path}?locale=zh-TW&utm_source=${source}&utm_medium=social&utm_campaign=${campaign}`;
      assert.equal(sanitizeAnalyticsUrl(clean + privateFields), clean);
    }
    assert.equal(analyticsPage(path), path);
  }
  assert.equal(sanitizeAnalyticsUrl("https://www.destinypixel.com/sticks?utm_source=Alice&utm_campaign=Will+we+stay+together&utm_content=1990-01-01&question=PRIVATE"), "https://www.destinypixel.com/sticks");
});

test("public educational pages are grouped separately from tools and private reports", () => {
  assert.equal(analyticsPage("/learn/what-is-bazi-birth-chart"), "/learn/[slug]");
  assert.equal(analyticsPage("/insights/bazi-love-compatibility"), "/insights/[slug]");
  assert.equal(analyticsPage("/insights/guanyin-fortune-sticks"), "/insights/[slug]");
  assert.equal(analyticsPage("/insights-private"), "other");
});

test("relationship and oracle events contain only controlled identifiers, with no runtime escape hatch", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const fakeWindow = {} as Window;
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  try {
    trackToolEvent("tool_start", "compatibility");
    trackToolEvent("tool_success", "temple_sticks");
    trackToolEvent("Alice 1990-01-01" as ToolEvent, "compatibility");
    trackToolEvent("tool_error", "Will we stay together?" as AnalyticsTool);
    assert.equal(fakeWindow.vaq?.length, 3);
    assert.deepEqual(fakeWindow.vaq?.[1][1], { name: "tool_start", data: { tool: "compatibility", area: "main" }, options: undefined });
    assert.deepEqual(fakeWindow.vaq?.[2][1], { name: "tool_success", data: { tool: "temple_sticks", area: "main" }, options: undefined });
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
