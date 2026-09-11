import { destinySupportHref } from "@/lib/support-contact";
import Link from "next/link";
import { journalHref, type JournalLocale } from "@/lib/journal";
import styles from "@/app/journal/journal.module.css";

export function JournalHeader({ locale, slug }: { locale: JournalLocale; slug?: string }) {
  const zh = locale === "zh";
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href={zh ? "/?locale=zh" : "/"}><span aria-hidden="true" />DestinyPixel</Link>
      <nav className={styles.navigation} aria-label={zh ? "主导航" : "Main navigation"}>
        <Link href={zh ? "/tools?locale=zh" : "/tools"}>{zh ? "玄学工具" : "Tools"}</Link>
        <Link href={journalHref(locale)} aria-current={!slug ? "page" : undefined}>{zh ? "文章" : "Journal"}</Link>
      </nav>
      <nav className={styles.languages} aria-label={zh ? "文章语言" : "Article language"}>
        <Link href={journalHref("en", slug)} hrefLang="en" lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link>
        <Link href={journalHref("zh", slug)} hrefLang="zh-Hans" lang="zh-Hans" aria-current={locale === "zh" ? "page" : undefined}>中文</Link>
      </nav>
    </header>
  );
}

export function JournalFooter({ locale }: { locale: JournalLocale }) {
  const zh = locale === "zh";
  return (
    <footer className={styles.footer}>
      <div><strong>DestinyPixel</strong><p>{zh ? "把象征、计算与个人判断分清楚。" : "Clear distinctions between symbols, calculations and personal judgment."}</p></div>
      <nav aria-label={zh ? "页脚导航" : "Footer navigation"}><Link href={journalHref(locale)}>{zh ? "全部文章" : "All articles"}</Link><Link href={zh ? "/tools?locale=zh" : "/tools"}>{zh ? "工具目录" : "Tool directory"}</Link><a href={destinySupportHref}>{zh ? "联系反馈" : "Contact"}</a></nav>
    </footer>
  );
}
