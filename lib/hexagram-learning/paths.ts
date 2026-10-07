import type { ReportLocale } from "@/lib/report-i18n";
export function hexagramHref(number:number|undefined,locale:ReportLocale) {
  if(number!==undefined && (!Number.isInteger(number)||number<1||number>64)) return undefined;
  return `/journal/${number===undefined?"hexagrams":`hexagram-${String(number).padStart(2,"0")}`}${locale==="en"?"":`?locale=${locale}`}`;
}
export function hexagramToolHref(locale:ReportLocale) { return `/oracle${locale==="en"?"":`?locale=${locale}`}`; }
