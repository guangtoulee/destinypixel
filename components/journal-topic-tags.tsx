import type { JournalLocale } from "@/lib/journal-locales";
import { journalArticleTopics, journalTopicHref, journalTopicLabels, journalTopicUi, type JournalTopic } from "@/lib/journal-topics";
import styles from "@/app/journal/journal.module.css";

export default function JournalTopicTags({ article, locale, topics = journalArticleTopics(article) }: { article: { slug: string; pillar?: string }; locale: JournalLocale; topics?: readonly JournalTopic[] }) {
  if (!topics.length) return null;
  return <nav className={styles.topicTags} aria-label={journalTopicUi[locale].topics} data-article-topics>{topics.map(topic => <a key={topic} href={journalTopicHref(locale, topic)} data-topic={topic}>{journalTopicLabels[locale][topic]}</a>)}</nav>;
}
