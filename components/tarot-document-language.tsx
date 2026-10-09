"use client";

import { useEffect } from "react";

/** The complete localized main already has a server-rendered lang attribute.
 * Sync the browser document without making the shared root layout dynamic. */
export function TarotDocumentLanguage({ language }: { language: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.lang;
    root.lang = language;
    return () => {
      if (root.lang === language) root.lang = previous;
    };
  }, [language]);
  return null;
}
