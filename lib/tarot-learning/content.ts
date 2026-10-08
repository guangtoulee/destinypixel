import "server-only";
import { cache } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import { loaders } from "./loaders";
export type TarotLearningArticle = {
 cardId:string; locale:string; title:string; nameLocalized:string; number:string; deckOrder:number; arcana:string;
 quickTake:{upright:string;reversed:string}; hook:string; keywords:string[]; plainLanguageSummary:string|null;
 openingParagraphs?:string[]; publishedAt?:string; updatedAt?:string;
 sections:{id:string;role:string;title:string;bodyMarkdown:string}[];
 sources:{title:string;url:string}[]; relatedCards:{cardId:string;name?:string;reason:string}[];
 articleMarkdown:string;
};
export const loadTarotLearningArticle = cache(async (id:string,locale:ReportLocale):Promise<TarotLearningArticle|undefined> => {
 if (!Object.hasOwn(loaders[locale],id)) return undefined;
 const article=(await loaders[locale][id]()).default as TarotLearningArticle;
 if(article.cardId!==id || article.locale!==(locale==="zh"?"zh-CN":locale)) throw new Error("Tarot article identity mismatch");
 return article;
});
