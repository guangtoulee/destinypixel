import type { ReportLocale } from "@/lib/report-i18n";
import type { TrigramId } from "./identity";
export type TrigramArticle = {
  id: TrigramId;
  locale: ReportLocale;
  title: string;
  summary: string;
  introduction: string[];
  sections: { id: string; title: string; paragraphs: string[] }[];
  quote: { text: string; translation: string; locator: string };
  reflections: string[];
  relatedTrigrams: TrigramId[];
  hexagramNumbers: number[];
};
