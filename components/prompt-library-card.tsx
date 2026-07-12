import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PromptFeedItem } from "@/lib/ai/prompt";
import { promptItemHref } from "@/lib/prompt-library";
import styles from "@/app/prompt/prompt-library.module.css";

export default function PromptLibraryCard({ item, index }: { item: PromptFeedItem; index: number }) {
  return (
    <article className={styles.archiveCard} data-tone={index % 4}>
      {item.imageUrl ? <img alt="" loading="lazy" src={item.imageUrl} /> : null}
      <div className={styles.archiveCardMeta}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{item.category}</span>
        <span>{new Date(item.createdAt).toLocaleDateString("zh-CN")}</span>
      </div>
      <p>{item.authorHandle || item.authorName || "公开社区"}</p>
      <h2><Link href={promptItemHref(item)}>{item.title}</Link></h2>
      <div className={styles.archiveCardTags}>
        {[...item.modelHints, ...item.tags].slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <Link className={styles.archiveCardLink} href={promptItemHref(item)} aria-label={`查看 ${item.title}`}>
        查看拆解 <ArrowUpRight aria-hidden="true" />
      </Link>
    </article>
  );
}
