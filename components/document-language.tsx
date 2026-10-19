"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isMainSitePath } from "@/lib/analytics";

/** Query-localized pages keep their static SSR main[lang]. Synchronize the
 * browser root too, including client navigation between language variants. */
export function DocumentLanguage() {
  const pathname = usePathname();
  const search = useSearchParams();
  const locale = search.get("locale");
  useEffect(() => {
    if (!isMainSitePath(pathname) && pathname !== "/product-facts") return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale === "zh-TW" ? "zh-TW" : locale === "ru" ? "ru" : "en";
  }, [pathname, locale]);
  return null;
}
