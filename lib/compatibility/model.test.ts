import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateCompatibility, parseCompatibilityInput, combinePortraits, skyAffinity } from "./model";
import { parsePairReading, generatePairReading } from "./ai";
import { compatibilityCopy, compatibilityLocales } from "./copy";
const people = [{ birthDate: "1991-03-21", birthTime: "10:35", cityId: "new-york-us" }, { birthDate: "1993-10-04", birthTime: "17:20", cityId: "shanghai-cn" }];
const input = (list = people) => parseCompatibilityInput({ people: list, locale: "zh", consent: true, mode: "calculate" });
const result = calculateCompatibility(input());
test("scores are stable, bounded and invariant when partners are swapped", () => {
  assert.deepEqual(result, calculateCompatibility(input()));
  const swapped = calculateCompatibility(input([...people].reverse()));
  assert.equal(result.score, swapped.score);
  assert.deepEqual(result.dimensions, swapped.dimensions);
  assert.deepEqual(result.people[0], swapped.people[1]);
  for (let i = 0; i < 15; i++) {
    const varied = calculateCompatibility(input([people[0], { ...people[1], birthDate: `1993-10-${String(i + 1).padStart(2, "0")}` }]));
    assert.ok(varied.score >= 60 && varied.score <= 100);
    assert.ok(varied.dimensions.every(d => d.score >= 60 && d.score <= 100));
  }
});
test("changing either Bazi or planetary data can change the corresponding score", () => {
  const a = structuredClone(result.people[0]);
  const b = structuredClone(a);
  const matched = combinePortraits(a, b);
  b.dayElement = a.dayElement === "Wood" ? "Metal" : "Wood";
  const changedBazi = combinePortraits(a, b);
  assert.notEqual(matched.dimensions[0].score, changedBazi.dimensions[0].score);
  b.planets.find(p => p.body === "Mercury")!.longitude = (a.planets.find(p => p.body === "Mercury")!.longitude + 90) % 360;
  assert.notEqual(combinePortraits(a, b).dimensions[1].score, changedBazi.dimensions[1].score);
});
test("circular aspects handle 359 to 1 degrees and symmetric input", () => {
  const p = result.people[0].planets[0];
  assert.equal(skyAffinity({ ...p, longitude: 359 }, { ...p, longitude: 1 }), skyAffinity({ ...p, longitude: 1 }, { ...p, longitude: 359 }));
  assert.ok(skyAffinity({ ...p, longitude: 359 }, { ...p, longitude: 1 }) > skyAffinity({ ...p, longitude: 359 }, { ...p, longitude: 89 }));
});
test("reject missing consent, future dates, unknown city, unknown time, impossible dates and DST ambiguity", () => {
  assert.throws(() => parseCompatibilityInput({ people, mode: "calculate" }));
  for (const patch of [{ cityId: "" }, { cityId: "fake-city" }, { birthDate: "2099-01-01" }, { birthTime: "" }, { birthDate: "1993-02-30" }, { birthDate: "2024-11-03", birthTime: "01:30", cityId: "new-york-us" }]) {
    assert.throws(() => calculateCompatibility(input([{ ...people[0], ...patch }, people[1]])));
  }
});
test("AI schema rejects missing, oversized and HTML content", () => {
  assert.throws(() => parsePairReading('{}'));
  assert.throws(() => parsePairReading(JSON.stringify({ attraction: '<script>bad()</script>', friction: 'something', practice: 'something', question: 'something' })));
  const valid = { attraction: "A shared point to explore.", friction: "A difference to discuss.", practice: "Try one small habit together.", question: "What makes you feel understood?" };
  assert.deepEqual(parsePairReading(JSON.stringify(valid)), valid);
});
test("AI only receives derived chart data, keeps scores outside its output and fails safely", async () => {
  const old = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = "unit-test-key";
  try {
    const value = { attraction: "A shared point to explore.", friction: "A difference to discuss.", practice: "Try one small habit together.", question: "What makes you feel understood?" };
    const output = await generatePairReading(result, "en", (async (_url, options) => {
      const payload = JSON.parse(String(options?.body));
      assert.equal(payload.model, "deepseek-flash");
      assert.equal(payload.response_format.type, "json_object");
      assert.ok(!payload.messages[1].content.includes("1991-03-21"));
      assert.ok(!payload.messages[1].content.includes("new-york-us"));
      return Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(value) } }] });
    }) as typeof fetch);
    assert.deepEqual(output, value);
    await assert.rejects(generatePairReading(result, "en", (async () => new Response("down", { status: 503 })) as typeof fetch));
    await assert.rejects(generatePairReading(result, "en", (async () => Response.json({ choices: [{ finish_reason: "length", message: { content: JSON.stringify(value) } }] })) as typeof fetch));
  } finally { if (old === undefined) delete process.env.DEEPSEEK_API_KEY; else process.env.DEEPSEEK_API_KEY = old; }
});
test("all four locales have complete comparison copy and explain the score floor", () => {
  for (const locale of compatibilityLocales) {
    const copy = compatibilityCopy(locale);
    assert.equal(copy.dimensions.length, 4);
    assert.ok(copy.scoreNote.includes("60"));
    for (const values of Object.values(copy.traits)) assert.equal(values.length, 4);
  }
});
