import type { ReportLocale } from "@/lib/report-i18n";
import { sectionHref } from "@/lib/section-journeys";
import type { TopicKey } from "@/lib/topic-journeys";
import { getV2ChromeCopy, getV2RealmItems, type V2RealmKey } from "./v2/site-chrome";
import chromeStyles from "./v2/site-chrome.module.css";

export default function SectionNavigation({
  locale,
  current,
}: {
  locale: ReportLocale;
  current?: TopicKey | V2RealmKey;
}) {
  const copy = getV2ChromeCopy(locale);
  const items = getV2RealmItems(locale);

  return (
    <div className={chromeStyles.dockWrap}>
      <nav className={chromeStyles.dockNav} aria-label={copy.navAria} data-section-navigation>
        {items.map(item => (
          <a
            key={item.key}
            className={chromeStyles.dockPill}
            href={sectionHref(item.path, locale)}
            aria-current={current === item.key ? "page" : undefined}
          >
            <span className={chromeStyles.realmGlyph} aria-hidden="true">
              {item.glyph}
            </span>
            <span>{item.label}</span>
          </a>
        ))}
        <a
          className={chromeStyles.dockMore}
          href={sectionHref("/tools", locale)}
          aria-current={current === "tools" ? "page" : undefined}
        >
          <span>{copy.more}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </div>
  );
}
