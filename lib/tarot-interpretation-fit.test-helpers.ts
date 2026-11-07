import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import previousEditions from "@/content/three-card-interpretation-fit-20261107/previous-editions.json";
import revision from "@/content/three-card-interpretation-fit-20261107/revisions.json";
import type { JournalTranslation } from "@/lib/journal";
import type { ReportLocale } from "@/lib/report-i18n";

const previous: Record<ReportLocale, JournalTranslation> = previousEditions;
const addedId = "interpretation-fit";
const digest = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

/** Strictly undo the one recorded addition before an older receipt is tested. */
export function beforeInterpretationFit(copy: JournalTranslation, locale: ReportLocale): JournalTranslation {
  const old = previous[locale];
  if (locale !== "en" && locale !== "zh") {
    assert.deepEqual(copy, old, `${locale}: the unedited edition changed`);
    return copy;
  }
  const insertion = old.sections.findIndex(section => section.id === "connect") + 1;
  assert.ok(insertion > 0);
  assert.equal(copy.sections.filter(section => section.id === addedId).length, 1);
  assert.deepEqual(copy.sections.map(section => section.id), [
    ...old.sections.slice(0, insertion).map(section => section.id), addedId,
    ...old.sections.slice(insertion).map(section => section.id),
  ], `${locale}: the new section was moved, duplicated or joined by an unrecorded section`);
  const projected = { ...copy, sections: copy.sections.filter(section => section.id !== addedId) };
  assert.deepEqual(projected, old, `${locale}: the addition changed an earlier field, paragraph, table, link or anchor`);
  return projected;
}

/** Restore exact source bytes; never replace an immutable historical hash. */
export function sourceBeforeInterpretationFit(): string {
  const source = readFileSync(new URL("./journal-three-card-tarot.ts", import.meta.url), "utf8");
  const historicalSource = readFileSync(new URL("../content/three-card-interpretation-fit-20261107/previous-source.ts", import.meta.url), "utf8");
  assert.equal(digest(source), revision.currentSourceSha256, "current source differs from its independent revision receipt");
  assert.equal(revision.newSectionId, addedId);
  const start = source.indexOf("= {", source.indexOf("const editions")) + 2;
  const end = source.indexOf("\n};", start) + 2;
  assert.ok(start > 1 && end > start);
  const editions: Record<"en" | "zh" | "ru", JournalTranslation> = JSON.parse(source.slice(start, end));
  assert.deepEqual(Object.keys(editions), ["en", "zh", "ru"]);
  const projected = Object.fromEntries((Object.keys(editions) as (keyof typeof editions)[]).map(locale => [locale, beforeInterpretationFit(editions[locale], locale)]));
  const restored = source.slice(0, start) + JSON.stringify(projected, null, 2) + source.slice(end);
  assert.equal(restored, historicalSource, "removing only the recorded sections must restore the exact predecessor source bytes");
  assert.equal(digest(restored), revision.previousSourceSha256);
  assert.equal(digest(restored), "440857b6c041a5b0083448770bbc13f3e506870119d6ab04b175a14c2a8df032", "the independently pinned October 30 source changed");
  return restored;
}
