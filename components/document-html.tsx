"use client";

import { Suspense, type ReactNode } from "react";
import { useSearchParams, useSelectedLayoutSegments } from "next/navigation";
import { queryDocumentLanguage, queryDocumentLocalePolicy, resolvedDocumentPath } from "@/lib/document-locale";

function QueryHtml({ children, pathname }: { children: ReactNode; pathname: string }) {
  const values = useSearchParams().getAll("locale");
  // Repeated query keys are arrays in the server Page props; those normalize to en.
  const locale = values.length === 1 ? values[0] : null;
  return <html lang={queryDocumentLanguage(pathname, locale)} data-scroll-behavior="smooth">{children}</html>;
}

export function DocumentHtml({ children }: { children: ReactNode }) {
  const pathname = resolvedDocumentPath(useSelectedLayoutSegments());
  const fallback = <html lang="en" data-scroll-behavior="smooth">{children}</html>;
  if (!queryDocumentLocalePolicy(pathname)) return fallback;
  // Prerender attempts retain the complete document. Existing query-localized
  // pages remain dynamic, so their initial request renders QueryHtml on the server.
  return <Suspense fallback={fallback}><QueryHtml pathname={pathname}>{children}</QueryHtml></Suspense>;
}
