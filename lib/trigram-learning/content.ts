import "server-only";
import type { ReportLocale } from "@/lib/report-i18n";
import type { TrigramArticle } from "./types";
import { isTrigramId } from "./identity";
import en from "@/content/trigrams/en.json";
import zh from "@/content/trigrams/zh.json";
import traditional from "@/content/trigrams/zh-TW.json";
import ru from "@/content/trigrams/ru.json";
const editions = { en, zh, "zh-TW": traditional, ru };
export function getTrigramArticle(id: string, locale: ReportLocale): TrigramArticle | undefined {
  if (!isTrigramId(id)) return undefined;
  const article = editions[locale][id] as TrigramArticle;
  if (article.id !== id || article.locale !== locale) throw new Error("Trigram identity or locale mismatch");
  return article;
}
