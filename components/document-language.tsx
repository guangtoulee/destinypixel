"use client";

import { useEffect } from "react";
import { useSearchParams, useSelectedLayoutSegments } from "next/navigation";
import { isMainSitePath } from "@/lib/analytics";
import { legacyDocumentLanguage, queryDocumentLanguage, queryDocumentLocalePolicy, resolvedDocumentPath } from "@/lib/document-locale";

/** Keep browser navigation in sync with SSR and retain existing legacy pages. */
export function DocumentLanguage() {
  const pathname = resolvedDocumentPath(useSelectedLayoutSegments());
  const search = useSearchParams();
  const values = search.getAll("locale");
  const guarded = queryDocumentLocalePolicy(pathname);
  const locale = guarded ? (values.length === 1 ? values[0] : null) : search.get("locale");
  useEffect(() => {
    if (!isMainSitePath(pathname) && pathname !== "/product-facts") return;
    document.documentElement.lang = guarded ? queryDocumentLanguage(pathname, locale) : legacyDocumentLanguage(locale);
  }, [pathname, locale, guarded]);
  return null;
}
