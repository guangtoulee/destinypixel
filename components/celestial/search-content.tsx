import type { ReportLocale } from "@/lib/report-i18n";
import { celestialHref } from "@/lib/celestial/copy";
import { celestialSearchContent, type CelestialKind } from "@/lib/celestial/search-content";

export function CelestialSearchContent({ kind, locale }: { kind: CelestialKind; locale: ReportLocale }) {
  const c = celestialSearchContent(kind, locale);
  return (
    <section className="cel-guide" aria-labelledby="cel-guide-title" data-celestial-guide>
      <header className="cel-guide-heading"><span aria-hidden="true">✧</span><h2 id="cel-guide-title">{c.title}</h2><p>{c.intro}</p></header>
      <div className="cel-guide-steps"><h3>{c.stepsTitle}</h3><ol>{c.steps.map(step => <li key={step}>{step}</li>)}</ol></div>
      <div className="cel-guide-grid">{c.sections.map((s, i) => <article key={s.title}><span className="cel-kicker" aria-hidden="true">0{i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></article>)}</div>
      <section className="cel-faq" aria-labelledby="cel-search-faq-title"><h2 id="cel-search-faq-title">{c.faqTitle}</h2>{c.faqs.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
      <nav className="cel-guide-links" aria-label={c.relatedTitle}><h2>{c.relatedTitle}</h2>{c.related.map(link => <a key={link.path} href={celestialHref(link.path, locale)}>{link.label}<span aria-hidden="true">↗</span></a>)}</nav>
    </section>
  );
}
