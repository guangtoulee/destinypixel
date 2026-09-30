import { test } from "node:test";
import assert from "node:assert/strict";
import { civilDateWindow, dateOnlyChart } from "./date-window";
import { calculateCompatibility, parseCompatibilityInput } from "./model";
import { generatePairReading } from "./ai";
import { requestCompatibilityCalculation } from "./request";

const a = { birthDate: "1991-03-21", birthTime: "10:35", cityId: "new-york-us" };
const b = { birthDate: "1993-10-04", birthTime: "17:20", cityId: "shanghai-cn" };
const input = (people: unknown[]) => parseCompatibilityInput({ people, consent: true, locale: "en", mode: "calculate" });
test("client accepts the actual date-mode response without retrying a valid calculation", async () => {
  const payload = input([{...a,timeKnown:false},b]);
  const result = calculateCompatibility(payload);
  let calls = 0;
  const response = await requestCompatibilityCalculation(payload, new AbortController().signal, { fetch: (async () => { calls++; return Response.json({result}); }) as typeof fetch, retryDelayMs:0 });
  assert.deepEqual(response,result);
  assert.equal(calls,1);
});
test("unknown is explicit, ignores hidden time, and supports either or both partners", () => {
  assert.throws(() => input([{ ...a, birthTime: "" }, b]));
  assert.throws(() => input([{ ...a, timeKnown: "false" }, b]));
  const unknownA = { ...a, timeKnown: false, birthTime: undefined };
  const result = calculateCompatibility(input([unknownA, b]));
  assert.equal(result.mode, "date-only");
  assert.equal(result.dimensions.length, 2);
  assert.equal(result.people[0].pillars.hour, null);
  assert.equal(result.people[0].planets.length, 0);
  assert.ok(result.people[1].pillars.hour);
  assert.deepEqual(result, calculateCompatibility(input([{ ...unknownA, birthTime: "12:00" }, b])));
  const reversed = calculateCompatibility(input([b, unknownA]));
  assert.equal(result.score, reversed.score);
  assert.deepEqual(result.dimensions, reversed.dimensions);
  const both = calculateCompatibility(input([unknownA, { ...b, timeKnown: false }]));
  assert.ok(both.people.every(p => !p.pillars.hour && !p.planets.length));
  assert.ok(both.dimensions.every(d => d.sky === 0 && d.score >= 60 && d.score <= 100));
  // Uncertain planet signs cannot change the BaZi-only index.
  assert.equal(both.mode, "date-only");
});
test("civil windows respect spring/autumn DST and reject impossible dates/cities", () => {
  for (const [date, hours] of [["2024-03-10", 23], ["2024-11-03", 25], ["2024-05-10", 24]] as const) {
    const w = civilDateWindow(date, "new-york-us", "en");
    assert.equal((w.end - w.start) / 3600000, hours);
  }
  for (const date of ["1993-02-30", "1799-01-01", "2101-01-01"]) assert.throws(() => civilDateWindow(date, "new-york-us", "en"));
  assert.throws(() => civilDateWindow("1993-10-04", "missing", "en"));
});
test("solar-term transitions omit uncertain pillars instead of choosing a reference hour", () => {
  const ordinary = dateOnlyChart("2024-02-05", "beijing-cn", "en");
  assert.ok(ordinary.pillars.year && ordinary.pillars.month);
  assert.equal(Object.values(ordinary.elements).reduce((a,b) => a+b), 6);
  const lichun = dateOnlyChart("2024-02-04", "beijing-cn", "en");
  assert.equal(lichun.pillars.year, null);
  assert.equal(lichun.pillars.month, null);
  assert.equal(lichun.pillars.hour, null);
  assert.equal(Object.values(lichun.elements).reduce((a,b) => a+b), 2);
  assert.ok(lichun.dateSky.every(p => p.signs.length >= 1 && !("longitude" in p)));
  assert.deepEqual(lichun.dateSky.find(p => p.body === "Moon")!.signs.map(p => p.sign), ["Scorpio", "Sagittarius"]);
});
test("date-only AI payload contains uncertainty but no raw birth inputs", async () => {
  const result = calculateCompatibility(input([{ ...a, timeKnown: false }, { ...b, timeKnown: false }]));
  const old = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = "unit-test";
  const reading = {animalStory:"A conversation between two animal metaphors.",elementStory:"A symbolic element link to discuss.",attraction:"A strength to explore together.",friction:"A difference worth discussing.",practice:"Try one small shared habit.",question:"How do you ask for space?"};
  try {
    await generatePairReading(result, "en", (async (_url, options) => {
      const body = JSON.parse(String(options?.body)), text = body.messages[1].content;
      assert.ok(text.includes("date-only") && text.includes('"hour":null'));
      assert.ok(body.messages[0].content.includes("Never reconstruct missing pillars"));
      assert.ok(!text.includes(a.birthDate) && !text.includes(a.cityId) && !text.includes(a.birthTime));
      return Response.json({choices:[{finish_reason:"stop",message:{content:JSON.stringify(reading)}}]});
    }) as typeof fetch);
  } finally { if (old === undefined) delete process.env.DEEPSEEK_API_KEY; else process.env.DEEPSEEK_API_KEY = old; }
});
