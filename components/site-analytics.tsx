"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { track } from "@vercel/analytics";
import { analyticsPage, isMainSitePath, sanitizeAnalyticsUrl, toolForForm, trackToolEvent } from "@/lib/analytics";

export function SiteAnalytics() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (!isMainSitePath(window.location.pathname) || !isMainSitePath(destination.pathname)) return;
      const target = analyticsPage(destination.pathname);
      if (target === "other" || target === "/report/[id]") return;
      if (destination.pathname === window.location.pathname && destination.hash !== "#report") return;
      try {
        track("tool_open", {
          area: "main",
          target: destination.hash === "#report" ? "birth_report" : target,
          source: analyticsPage(window.location.pathname),
          location: anchor.closest("header") ? "header" : anchor.closest("footer") ? "footer" : "content",
        });
      } catch {
        // Navigation is independent of analytics availability.
      }
    }
    function onSubmit(event: SubmitEvent) {
      if (!(event.target instanceof HTMLFormElement)) return;
      const tool = toolForForm(event.target.dataset.analyticsForm);
      if (tool) trackToolEvent("form_submit", tool);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return <><Analytics beforeSend={(event) => {
    const url = sanitizeAnalyticsUrl(event.url);
    return url ? { ...event, url } : null;
  }} /><SpeedInsights beforeSend={(event) => {
    const url = sanitizeAnalyticsUrl(event.url);
    return url ? { ...event, url } : null;
  }} /></>;
}
