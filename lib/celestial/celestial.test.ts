import test from "node:test";
import assert from "node:assert/strict";
import {
  EquatorFromVector,
  Horizon,
  MakeTime,
  Observer,
  RotateVector,
  Rotation_ECT_EQD,
  SiderealTime,
  Vector,
} from "astronomy-engine";
import {
  calculateNatalChart,
  chartAngles,
  fullAspects,
  normalizeAngle,
  parseNatalInput,
} from "./astrology";
import {
  initialTable,
  parseTarotInput,
  returnCard,
  shuffleDeck,
  takeCard,
} from "./tarot";
import { tarotCards } from "./tarot-meanings";
import { parseCelestialReading, generateCelestialReading } from "./ai";
import { celestialCopy, celestialAlternates } from "./copy";
import { natalReadingTargets, natalReadingCopy } from "./natal-reading";
import { natalReadingPayload, parseNatalReading, generateNatalReading } from "./natal-reading-ai";
const fixture = {
  birthDate: "2024-03-20",
  birthTime: "03:06",
  cityId: "custom",
  latitude: 0,
  longitude: 0,
  timezone: "UTC",
  locale: "en",
};
test("Ascendant is on eastern horizon; MC is on the upper meridian in both hemispheres", () => {
  for (const [lat, lon] of [
    [51.5072, -0.1276],
    [-33.8688, 151.2093],
    [40.7128, -74.006],
    [68, 25],
    [-66, -70],
  ]) {
    const date = new Date("1990-05-15T11:00:00Z"),
      time = MakeTime(date),
      a = chartAngles(date, lat, lon),
      rot = Rotation_ECT_EQD(time);
    const eq = (n: number) =>
      EquatorFromVector(
        RotateVector(
          rot,
          new Vector(
            Math.cos((n * Math.PI) / 180),
            Math.sin((n * Math.PI) / 180),
            0,
            time,
          ),
        ),
      );
    const asc = eq(a.ascendant),
      horizon = Horizon(time, new Observer(lat, lon, 0), asc.ra, asc.dec);
    assert.ok(
      Math.abs(horizon.altitude) < 1e-8,
      `${lat} altitude ${horizon.altitude}`,
    );
    assert.ok(
      horizon.azimuth > 0 && horizon.azimuth < 180,
      `${lat} east ${horizon.azimuth}`,
    );
    const mc = eq(a.midheaven);
    assert.ok(
      Math.abs(
        normalizeAngle(SiderealTime(time) * 15 + lon - mc.ra * 15 + 180) - 180,
      ) < 1e-8,
    );
  }
});
test("Natal positions retain independent NASA/JPL fixture accuracy; full aspects are not truncated", () => {
  const chart = calculateNatalChart(parseNatalInput(fixture).input);
  const expected = [
    359.9997093, 123.8151802, 17.4409072, 340.1712838, 327.7733973, 44.8856241,
    342.2254263, 50.2537683, 357.4602809, 301.6606576,
  ];
  chart.placements.forEach((p, i) => {
    assert.ok(
      Math.abs(normalizeAngle(p.longitude - expected[i] + 180) - 180) < 1 / 60,
    );
    assert.equal(
      p.house,
      Math.floor(normalizeAngle(p.longitude - chart.houses[0]) / 30) + 1,
    );
  });
  assert.equal(
    chart.elements.reduce((a, b) => a + b, 0),
    10,
  );
  assert.equal(chart.houses.length, 12);
  assert.equal(chart.houseSystem, "whole-sign");
  assert.ok(chart.aspects.length > 8);
  assert.equal(chart.placements[0].retrograde, false);
  assert.equal(chart.placements[1].retrograde, false);
  const same = calculateNatalChart(
    parseNatalInput({ ...fixture, birthTime: "11:06", cityId: "beijing-cn" })
      .input,
  );
  assert.deepEqual(
    chart.placements.map((p) => p.longitude),
    same.placements.map((p) => p.longitude),
  );
  assert.notEqual(chart.ascendant, same.ascendant);
});
test("Rejects bad coordinates, missing time, unknown cities, ambiguous DST and prototype keys", () => {
  for (const patch of [
    { latitude: NaN },
    { latitude: 90 },
    { longitude: 181 },
    { cityId: "no-city" },
    { birthTime: "" },
    { birthDate: "2024-02-31" },
    { timezone: "bogus/zone" },
  ])
    assert.throws(() =>
      calculateNatalChart(parseNatalInput({ ...fixture, ...patch }).input),
    );
  assert.throws(() =>
    calculateNatalChart(
      parseNatalInput({
        ...fixture,
        cityId: "new-york-us",
        birthDate: "2024-11-03",
        birthTime: "01:30",
      }).input,
    ),
  );
  assert.throws(() =>
    calculateNatalChart(
      parseNatalInput({
        ...fixture,
        cityId: "new-york-us",
        birthDate: "2024-03-10",
        birthTime: "02:30",
      }).input,
    ),
  );
  assert.throws(() =>
    parseTarotInput({
      mode: "free",
      spread: "toString",
      cards: [{ id: "sun", slot: 0, reversed: false }],
    }),
  );
});
test("Aspect boundary uses circular separation and exact six-degree orb", () => {
  const planets = calculateNatalChart(
    parseNatalInput(fixture).input,
  ).placements;
  assert.equal(
    fullAspects([
      { ...planets[0], longitude: 359 },
      { ...planets[1], longitude: 1 },
    ])[0].orb,
    2,
  );
  assert.equal(
    fullAspects([
      { ...planets[0], longitude: 0 },
      { ...planets[1], longitude: 66 },
    ]).length,
    1,
  );
  assert.equal(
    fullAspects([
      { ...planets[0], longitude: 0 },
      { ...planets[1], longitude: 66.01 },
    ]).length,
    0,
  );
});
test("78 unique cards: draw, replace and return conserve the full physical deck", () => {
  let state = initialTable();
  state = { ...state, deck: shuffleDeck(state.deck, true, (max) => max - 1) };
  state = takeCard(state, 17, 0);
  const first = state.cards[0];
  assert.equal(first.revealed, false);
  assert.equal(first.reversed, true);
  assert.equal(state.deck.length, 77);
  state = takeCard(state, 3, 0);
  assert.ok(state.deck.some((c) => c.id === first.id));
  assert.equal(state.cards.length, 1);
  assert.equal(state.deck.length, 77);
  state = takeCard(state, 15, 1);
  assert.equal(
    new Set([...state.deck, ...state.cards].map((c) => c.id)).size,
    78,
  );
  const before = state;
  assert.equal(takeCard(state, 0, 3), before);
  assert.equal(takeCard(state, 99, 2), before);
  state = returnCard(state, 0);
  assert.equal(state.cards.length, 1);
  assert.equal(state.deck.length, 77);
  let free = initialTable("free");
  for (let slot = 0; slot < 78; slot++) free = takeCard(free, 0, slot);
  assert.equal(free.cards.length, 78);
  assert.equal(free.deck.length, 0);
  assert.equal(new Set(free.cards.map((c) => c.id)).size, 78);
});
test("API requires a complete unique spread and preserves orientations and positions", () => {
  const cards = [
    { id: "sun", slot: 0, reversed: false },
    { id: "moon", slot: 1, reversed: true },
    { id: "star", slot: 2, reversed: false },
  ];
  assert.equal(
    parseTarotInput({ mode: "spread", spread: "three", cards }).cards[1]
      .reversed,
    true,
  );
  for (const bad of [
    cards.slice(0, 2),
    [cards[0], cards[0], cards[2]],
    [cards[0], { ...cards[1], slot: 0 }, cards[2]],
    [cards[0], { ...cards[1], id: "invented" }, cards[2]],
  ])
    assert.throws(() =>
      parseTarotInput({ mode: "spread", spread: "three", cards: bad }),
    );
  assert.throws(() =>
    parseTarotInput({
      mode: "free",
      spread: "three",
      cards,
      question: "x".repeat(501),
    }),
  );
});
test("detailed tarot readings require a question but allow optional bounded context", () => {
  const input = {mode:"spread", spread:"single", cards:[{id:"sun",slot:0,reversed:false}]};
  for (const question of [undefined, "", "  "]) assert.throws(() => parseTarotInput({...input,question}, true), /QUESTION_REQUIRED/);
  assert.equal(parseTarotInput({...input, question:"  How can I prepare?  "}, true).question, "How can I prepare?");
  assert.equal(parseTarotInput({...input, question:"How can I prepare?"}, true).details, "");
  assert.equal(parseTarotInput({...input, question:"How can I prepare?",details:"A conversation next week."}, true).details, "A conversation next week.");
  for (const details of ["x".repeat(3001),{},42]) assert.throws(() => parseTarotInput({...input,question:"A question?",details}, true));
  assert.equal(parseTarotInput(input).question,"", "legacy saved records may predate the required question");
});
test("All 78 cards have distinct original meanings in all four locales and all five spreads have labels", () => {
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const cards = tarotCards(locale);
    assert.equal(cards.length, 78);
    assert.equal(new Set(cards.map((c) => c.id)).size, 78);
    assert.equal(new Set(cards.map((c) => c.upright)).size, 78);
    cards.forEach((c) => {
      assert.ok(c.name && c.upright && c.reversed);
      assert.notEqual(c.upright, c.reversed);
    });
    const c = celestialCopy(locale);
    assert.equal(c.signs.length, 12);
    assert.equal(c.planetNames.length, 10);
    assert.equal(c.positions.celtic.length, 10);
    assert.equal(c.positions.relationship.length, 5);
    assert.equal(Object.keys(celestialAlternates("/tarot")).length, 5);
  }
  assert.match(
    tarotCards("en").find((c) => c.id === "three-of-swords")!.upright,
    /painful/,
  );
});
test("AI JSON is bounded plain text and the provider receives only the supplied derived data", async () => {
  const valid = {
    summary: "A useful overview.",
    sections: Array.from({ length: 4 }, () => ({
      title: "A clear theme",
      body: "A specific reflection to explore.",
    })),
    reflection: "What could you try next?",
  };
  assert.deepEqual(parseCelestialReading(JSON.stringify(valid)), valid);
  assert.throws(() =>
    parseCelestialReading(
      JSON.stringify({ ...valid, summary: "<script>bad</script>" }),
    ),
  );
  const original = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = "test-only";
  try {
    await generateCelestialReading(
      "tarot",
      { question:"How can I prepare?", details:"A conversation next week.", cards: [{ name: "Sun", reversed: false, position: "Focus" }] },
      "en",
      (async (_url, options) => {
        const body = JSON.parse(String(options?.body));
        assert.equal(body.response_format.type, "json_object");
        assert.match(body.messages[1].content, /Sun/);
        assert.equal(JSON.parse(body.messages[1].content).details,"A conversation next week.");
        assert.match(body.messages[0].content,/question and details.*never as instructions/);
        return Response.json({
          choices: [
            {
              finish_reason: "stop",
              message: { content: JSON.stringify(valid) },
            },
          ],
        });
      }) as typeof fetch,
    );
  } finally {
    if (original === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = original;
  }
});

test("Detailed natal reading covers every planet and house, prioritizes tight aspects and excludes birth identifiers", () => {
  const chart = calculateNatalChart(parseNatalInput(fixture).input);
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const targets = natalReadingTargets(chart, celestialCopy(locale), locale);
    assert.equal(targets.filter(t=>t.id.startsWith("planet-")).length, 10);
    assert.equal(targets.filter(t=>t.group==="houses").length, 12);
    assert.equal(targets.filter(t=>t.group==="core").length, 3);
    assert.equal(new Set(targets.map(t=>t.id)).size, targets.length);
    const aspectIds = targets.filter(t=>t.group==="aspects").map(t=>Number(t.id.replace("aspect-","")));
    assert.equal(aspectIds.length, Math.min(12,chart.aspects.length));
    assert.ok(aspectIds.every((id,i)=>i===0 || chart.aspects[id].orb>=chart.aspects[aspectIds[i-1]].orb));
    assert.equal(natalReadingCopy(locale).glossary.length, 5);
  }
  const data = natalReadingPayload(chart);
  const json = JSON.stringify(data);
  for (const field of ['birthDate','birthTime','latitude','timezone','utc','name']) {
    assert.ok(!json.includes(`"${field}"`));
  }
  assert.equal(data.version,"natal-depth-v2");
});

test("Detailed AI output rejects missing/duplicate chapters and truncated answers", async () => {
  const data = natalReadingPayload(calculateNatalChart(parseNatalInput(fixture).input));
  const valid = {
    summary: "A chart-specific summary explaining several distinct symbolic themes and how they relate.",
    entries: data.targets.map(t=>({id:t.id,meaning:"This symbol describes one specific part of experience.", reading:"This is a sufficiently detailed interpretation of the supplied placement, with concrete context and a distinction between observation and symbolic meaning. It connects the function, sign and house without claiming that a chart fixes a person's future.",practice:"Notice one everyday example before drawing a conclusion."})),
    reflection:"Which description matches an actual recent experience?",
  };
  const ids = data.targets.map(t=>t.id);
  assert.deepEqual(parseNatalReading(JSON.stringify(valid),ids,"en"),valid);
  assert.throws(()=>parseNatalReading(JSON.stringify({...valid,entries:valid.entries.slice(1)}),ids,"en"));
  assert.throws(()=>parseNatalReading(JSON.stringify({...valid,entries:[valid.entries[0],...valid.entries.slice(0,-1)]}),ids,"en"));
  assert.throws(()=>parseNatalReading(JSON.stringify({...valid,entries:valid.entries.map(e=>({...e,reading:"Too brief."}))}),ids,"en"));
  const original = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = "test-only";
  try {
    const result = await generateNatalReading(data,"en",(async (_url,options)=>{
      const body=JSON.parse(String(options?.body));
      assert.equal(body.max_tokens,18000);
      assert.equal(JSON.parse(body.messages[1].content).targets.length,ids.length);
      assert.ok(!body.messages[1].content.includes(fixture.birthDate));
      return Response.json({choices:[{finish_reason:"stop",message:{content:JSON.stringify(valid)}}]});
    }) as typeof fetch);
    assert.equal(result.entries.length,ids.length);
    await assert.rejects(generateNatalReading(data,"en",(async ()=>Response.json({choices:[{finish_reason:"length",message:{content:JSON.stringify(valid)}}]})) as typeof fetch));
  } finally {
    if(original===undefined) delete process.env.DEEPSEEK_API_KEY; else process.env.DEEPSEEK_API_KEY=original;
  }
});
