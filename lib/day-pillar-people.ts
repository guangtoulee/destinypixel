import registry from "@/content/day-pillar-people/verified-people.json";
import type { JournalLocale, JournalTranslation } from "@/lib/journal";

export type DayPillarPerson = {
  id: string;
  name: { en: string; zh: string };
  birthDate: string;
  dayPillar: string;
  field: { en: string; zh: string };
  birthPlace: { city: string; country: string };
  calendar: string;
  birthTime: null;
  sources: { publisher: string; url: string; evidence: string; evidenceType: string; accessedAt: string; locator?: string; pageNumber?: number }[];
  notes: { en: string; zh: string };
  displayNote?: { en: string; zh: string };
};

export function isSafeBirthdaySource(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port;
  } catch { return false; }
}

const records: readonly DayPillarPerson[] = registry.people;
/** Only reviewed records with a direct birthday-source receipt enter the UI. */
export const verifiedDayPillarPeople = records.filter(person =>
  person.calendar === "gregorian" && person.birthTime === null && person.sources.length > 0 &&
  person.sources.every(source => isSafeBirthdaySource(source.url) && source.publisher.trim() && source.evidence.trim() &&
    (source.evidenceType === "paraphrase_of_opened_original_page" || source.evidenceType === "short_quote_of_opened_original_page"))
);

export function peopleForPillar(pillar: string): DayPillarPerson[] {
  return verifiedDayPillarPeople.filter(person => person.dayPillar === pillar);
}

function identityName(value: string) {
  return value.split(" · ")[0].normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s·.'()_-]/g, "");
}

/** Called after the published Traditional Chinese/Russian editions are built. */
export function withDayPillarPeople(copy: JournalTranslation, pillar: string, locale: JournalLocale): JournalTranslation {
  if (locale !== "en" && locale !== "zh") return copy;
  const existing = copy.sections.find(section => section.id === "famous-birthdays");
  const rows = existing?.table?.rows ?? [];
  const people = peopleForPillar(pillar).filter(person =>
    !existing?.people?.some(previous => previous.id === person.id) &&
    !rows.some(([name, date]) => date === person.birthDate && [person.name.en, person.name.zh].some(alias => identityName(name) === identityName(alias)))
  );
  if (!people.length) return copy;
  const sections = existing
    ? copy.sections.map(section => section === existing ? { ...section, people: [...(section.people ?? []), ...people] } : section)
    : [...copy.sections, { id: "famous-birthdays", title: locale === "zh" ? "同日柱人物：公历生日对照" : "People with this Day Pillar: published birthday matches", paragraphs: [], people }];
  return { ...copy, sections };
}
