import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBaziEngine,
  trueSolarTimeCalibrationFixture,
} from "@/lib/engines/bazi";
import { resolveCity } from "@/lib/geo/cities";
import {
  buildTotemModel,
  mapTenGodToFunction,
} from "@/lib/totem/model";
import { decodeTotemSnapshot, encodeTotemSnapshot } from "@/lib/totem/share";
import type { TotemCalibration, TotemSource } from "@/lib/totem/types";

const simpleSource: TotemSource = {
  pillars: {
    year: "甲子",
    month: "乙卯",
    day: "丙午",
    hour: "丁酉",
  },
};

const complexSource: TotemSource = {
  pillars: {
    year: "戊辰",
    month: "己未",
    day: "庚申",
    hour: "辛丑",
  },
};

const calibration: TotemCalibration = {
  language: 75,
  logic: 50,
  visual: 100,
  kinesthetic: 25,
  musical: 75,
  interpersonal: 50,
  intrapersonal: 25,
  naturalistic: 50,
};

test("the same standardized birth data produces an identical natal model", () => {
  const city = resolveCity("Shijiazhuang");
  assert.ok(city);
  const bazi = calculateBaziEngine({
    name: "Determinism fixture",
    gender: "female",
    locale: "zh",
    birthDate: "1982-03-21",
    birthTime: "01:30",
    city,
  });

  const first = buildTotemModel(bazi);
  const second = buildTotemModel(bazi);
  assert.deepEqual(second, first);
  assert.equal(bazi.pillars.hour, trueSolarTimeCalibrationFixture.expectedHourPillar);
});

test("current-year luck data never participates in the natal fingerprint", () => {
  const city = resolveCity("Shanghai");
  assert.ok(city);
  const bazi = calculateBaziEngine({
    name: "Stable year fixture",
    gender: "male",
    locale: "en",
    birthDate: "1993-09-17",
    birthTime: "21:36",
    city,
  });
  const changedLuck = structuredClone(bazi);
  changedLuck.luck.targetYear += 7;
  changedLuck.luck.currentYearPillar = "甲子";

  assert.deepEqual(buildTotemModel(changedLuck), buildTotemModel(bazi));
});

test("different pillar structures alter silhouette, node count, and fingerprint", () => {
  const simple = buildTotemModel(simpleSource);
  const complex = buildTotemModel(complexSource);
  const simpleBoundary = simple.parts.find((part) => part.id === "boundary:birth-field");
  const complexBoundary = complex.parts.find((part) => part.id === "boundary:birth-field");

  assert.notEqual(simple.fingerprint, complex.fingerprint);
  assert.notDeepEqual(simpleBoundary?.geometry, complexBoundary?.geometry);
  assert.notEqual(simple.parts.length, complex.parts.length);
  assert.ok(complex.metrics.complexity > simple.metrics.complexity);
  assert.notEqual(
    complex.metrics.complexity - simple.metrics.complexity,
    complex.metrics.stability - simple.metrics.stability,
  );
});

test("calibration changes practice state without changing the natal structure", () => {
  const natal = buildTotemModel(complexSource);
  const current = buildTotemModel(complexSource, calibration);
  const structuralKinds = new Set([
    "boundary",
    "core",
    "pillar-stem",
    "pillar-branch",
    "hidden-stem",
    "element-flow",
    "function-port",
  ]);
  const natalGeometry = natal.parts
    .filter((part) => structuralKinds.has(part.kind))
    .map((part) => ({ id: part.id, geometry: part.geometry }));
  const currentGeometry = current.parts
    .filter((part) => structuralKinds.has(part.kind))
    .map((part) => ({ id: part.id, geometry: part.geometry }));

  assert.equal(current.fingerprint, natal.fingerprint);
  assert.equal(current.birthSignature, natal.birthSignature);
  assert.deepEqual(currentGeometry, natalGeometry);
  assert.notDeepEqual(current.resonances, natal.resonances);
});

test("a neutral calibration preserves every natal resonance score", () => {
  const natal = buildTotemModel(simpleSource);
  const neutral = buildTotemModel(simpleSource, {
    language: 50,
    logic: 50,
    visual: 50,
    kinesthetic: 50,
    musical: 50,
    interpersonal: 50,
    intrapersonal: 50,
    naturalistic: 50,
  });

  assert.deepEqual(
    neutral.resonances.map((resonance) => resonance.currentScore),
    natal.resonances.map((resonance) => resonance.natalScore),
  );
});

test("canonical pair matching recognizes combinations and clashes in either character order", () => {
  const combination = buildTotemModel({
    pillars: { year: "甲子", month: "己丑", day: "丙寅", hour: "丁卯" },
  });
  const clash = buildTotemModel({
    pillars: { year: "甲子", month: "乙午", day: "丙寅", hour: "丁卯" },
  });

  assert.equal(
    combination.parts.find((part) => part.id === "flow:year:month")?.relation,
    "support",
  );
  assert.equal(
    clash.parts.find((part) => part.id === "flow:year:month")?.relation,
    "control",
  );
});

test("all semantic IDs and contributor references are valid", () => {
  const model = buildTotemModel(complexSource, calibration);
  const ids = model.parts.map((part) => part.id);
  const idSet = new Set(ids);

  assert.equal(idSet.size, ids.length);
  model.parts.forEach((part) => {
    assert.ok(Number.isFinite(part.intensity));
    assert.ok(part.intensity >= 0 && part.intensity <= 100);
    assert.doesNotMatch(JSON.stringify(part.geometry), /NaN|Infinity/);
    part.relatedIds.forEach((id) => assert.ok(idSet.has(id), `${part.id} -> ${id}`));
  });
  model.resonances.forEach((resonance) => {
    resonance.contributorPartIds.forEach((id) =>
      assert.ok(idSet.has(id), `${resonance.key} -> ${id}`),
    );
    resonance.functionModules.forEach((moduleKey) => {
      const module = model.functions.find((candidate) => candidate.key === moduleKey);
      assert.ok(module);
      assert.ok(resonance.contributorPartIds.includes(`function:${moduleKey}`));
      module.partIds.forEach((id) =>
        assert.ok(resonance.contributorPartIds.includes(id), `${resonance.key} misses ${id}`),
      );
    });
  });
});

test("invalid calibration is rejected instead of leaking NaN into SVG geometry", () => {
  assert.throws(() =>
    buildTotemModel(simpleSource, {
      ...calibration,
      language: Number.NaN,
    }),
  );
  assert.throws(() =>
    buildTotemModel(simpleSource, {
      ...calibration,
      logic: 101,
    }),
  );
});

test("privacy-safe share snapshots reproduce natal and calibrated results", () => {
  const city = resolveCity("Shijiazhuang");
  assert.ok(city);
  const bazi = calculateBaziEngine({
    name: "Must not enter link",
    gender: "female",
    locale: "zh",
    birthDate: "1982-03-21",
    birthTime: "01:30",
    city,
  });
  const snapshot = {
    version: 1 as const,
    pillars: bazi.pillars,
    calibration,
  };
  const encoded = encodeTotemSnapshot(snapshot);
  const decoded = decodeTotemSnapshot(encoded);
  assert.deepEqual(decoded, snapshot);
  assert.doesNotMatch(encoded, /1982|03-21|01:30|Shijiazhuang|Must/);
  assert.ok(decoded);
  assert.deepEqual(Object.keys(decoded).sort(), ["calibration", "pillars", "version"]);

  const originalNatal = buildTotemModel(bazi);
  const sharedNatal = buildTotemModel({ pillars: decoded.pillars });
  const originalCurrent = buildTotemModel(bazi, calibration);
  const sharedCurrent = buildTotemModel(
    { pillars: decoded.pillars },
    decoded.calibration,
  );
  assert.deepEqual(sharedNatal, originalNatal);
  assert.deepEqual(sharedCurrent, originalCurrent);
});

test("malformed or overlong share payloads fail closed", () => {
  assert.equal(decodeTotemSnapshot("not-json"), null);
  assert.equal(decodeTotemSnapshot("a".repeat(2049)), null);
  assert.throws(() =>
    encodeTotemSnapshot({
      version: 1,
      pillars: { year: "甲丑", month: "乙寅", day: "丙卯", hour: "丁辰" },
    }),
  );
  assert.throws(() =>
    encodeTotemSnapshot({
      version: 1,
      pillars: simpleSource.pillars,
      birthDate: "1982-03-21",
    } as never),
  );
  const invalidVersion = Buffer.from(
    JSON.stringify({ version: 2, pillars: simpleSource.pillars }),
    "utf8",
  ).toString("base64url");
  assert.equal(decodeTotemSnapshot(invalidVersion), null);
});

test("geometry construction does not call Math.random", () => {
  const originalRandom = Math.random;
  Math.random = () => {
    throw new Error("Math.random must not be used by buildTotemModel");
  };
  try {
    assert.doesNotThrow(() => buildTotemModel(simpleSource));
  } finally {
    Math.random = originalRandom;
  }
});

test("Ten Gods are translated into the five public function modules", () => {
  assert.equal(mapTenGodToFunction("比肩"), "agency");
  assert.equal(mapTenGodToFunction("伤官"), "expression");
  assert.equal(mapTenGodToFunction("偏财"), "exchange");
  assert.equal(mapTenGodToFunction("七杀"), "structure");
  assert.equal(mapTenGodToFunction("正印"), "insight");
});
