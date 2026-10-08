import "server-only";
import { cache } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import { hexagramLoaders } from "./loaders";
import type EnglishArticle from "@/content/hexagrams/en/hexagram-01.json";
export type HexagramArticle=Omit<typeof EnglishArticle,"specialStatement"> & {specialStatement:typeof EnglishArticle.specialStatement|null};
export const loadHexagramArticle=cache(async(id:string,locale:ReportLocale):Promise<HexagramArticle|undefined>=>{
 const entries=hexagramLoaders[locale];if(!Object.hasOwn(entries,id))return undefined;
 const article=(await entries[id]()).default as HexagramArticle;
 if(article.id!==id||article.locale!==locale)throw new Error("Hexagram identity or locale mismatch");
 return article;
});
