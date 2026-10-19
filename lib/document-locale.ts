type QueryLocalePolicy = "report" | "journal" | "english-chinese";
export type DocumentLanguageTag = "en" | "zh-CN" | "zh-TW" | "ru";

// Only pages that already render from searchParams belong here. Static pages
// must not acquire a request-time dependency just to set the document language.
const reportPaths = new Set([
  "/", "/white", "/tuteng", "/palm", "/face", "/oracle", "/sticks",
  "/astrology", "/tarot", "/compatibility", "/atelier", "/insights",
  "/discover", "/iching", "/product-facts",
]);

/** Use the resolved route tree, including when a host rewrites / to another site. */
export function resolvedDocumentPath(segments: readonly string[]): string {
  return `/${segments.filter(segment => !segment.startsWith("(")).join("/")}`;
}

export function queryDocumentLocalePolicy(pathname: string): QueryLocalePolicy | null {
  if (pathname === "/journal" || pathname.startsWith("/journal/")) return "journal";
  if (pathname === "/tools" || pathname === "/day-pillar") return "english-chinese";
  return reportPaths.has(pathname) ? "report" : null;
}

/** Match the page's locale rules without importing article or translation data. */
export function queryDocumentLanguage(pathname: string, locale: string | null | undefined): DocumentLanguageTag {
  const policy = queryDocumentLocalePolicy(pathname);
  if (policy === "english-chinese") return locale === "zh" ? "zh-CN" : "en";
  if (!policy) return "en";
  if (locale === "zh" || locale === "cn" || (policy === "journal" && locale === "zh-Hans")) return "zh-CN";
  if (locale === "zh-TW" || locale === "zh-Hant" || (policy === "report" && locale === "tw")) return "zh-TW";
  return locale === "ru" ? "ru" : "en";
}

/** Preserve existing browser-only synchronization outside the SSR locale guard. */
export function legacyDocumentLanguage(locale: string | null): DocumentLanguageTag {
  return locale === "zh" ? "zh-CN" : locale === "zh-TW" ? "zh-TW" : locale === "ru" ? "ru" : "en";
}
