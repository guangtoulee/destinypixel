import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Eye, Sparkles, Zap } from "lucide-react";
import type { PromptFeedItem } from "@/lib/ai/prompt";
import {
  buildPromptEditorial,
  getPromptCategoryProfileByName,
  promptCategoryHref,
  promptItemHref,
  relatedPromptItems,
} from "@/lib/prompt-library";
import PromptCopyButton from "@/components/prompt-copy-button";
import styles from "@/app/prompt/prompt-library.module.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)} 万`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value || 0);
}

function fullPromptPackage(item: PromptFeedItem) {
  return [
    item.prompt,
    "",
    `【风格】${item.style}`,
    `【光线】${item.lighting}`,
    `【镜头】${item.camera}`,
    `【色调】${item.palette}`,
    `【氛围】${item.mood}`,
    `【构图】${item.composition}`,
    `【画幅】${item.aspectRatio}`,
    `【负向约束】${item.negativePrompt}`,
    `【适合模型】${item.modelHints.join(" / ") || "按目标模型调整"}`,
  ].join("\n");
}

export default function PromptDetailPage({
  item,
  translatedTitle,
  translatedDescription,
}: {
  item: PromptFeedItem;
  translatedTitle?: string;
  translatedDescription?: string;
}) {
  const profile = getPromptCategoryProfileByName(item.category);
  const editorial = buildPromptEditorial(item);
  const related = relatedPromptItems(item);
  const title = translatedTitle || item.title;
  const description = translatedDescription || item.description;

  return (
    <main className={styles.libraryPage} data-accent={profile?.accent || "paper"}>
      <nav className={styles.libraryNav} aria-label="Prompt 雷达导航">
        <Link href="/prompt"><ArrowLeft aria-hidden="true" /> 返回工作台</Link>
        <Link href={promptCategoryHref(item.category)}>{item.category}专题</Link>
        <Link href="/prompt/articles">文章档案</Link>
        <Link href="/prompt/about">编辑说明</Link>
      </nav>

      <header className={styles.detailHero}>
        <div className={styles.detailIndex}>
          <span>PROMPT RADAR / {item.contentType.toUpperCase()}</span>
          <b>{item.category}</b>
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className={styles.heroFacts}>
          <span>{item.authorHandle || item.authorName || "公开社区案例"}</span>
          <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          <span><Zap aria-hidden="true" /> {formatNumber(item.metrics.score)} 热度</span>
          <span><Eye aria-hidden="true" /> {formatNumber(item.metrics.views)} 浏览</span>
        </div>
      </header>

      {item.imageUrl || item.videoUrl ? (
        <section className={styles.detailMedia} aria-label="案例媒体">
          {item.videoUrl && !item.imageUrl ? (
            <video controls playsInline poster={item.imageUrl} src={item.videoUrl} />
          ) : (
            <img alt={title} src={item.imageUrl} />
          )}
          <span>ORIGINAL VISUAL / 来源见文末</span>
        </section>
      ) : null}

      <section className={styles.editorialLead}>
        <div>
          <span>编辑先看</span>
          <h2>它为什么值得进入灵感库</h2>
        </div>
        <p>{editorial.summary}</p>
      </section>

      <section className={styles.promptBody}>
        <div className={styles.promptMain}>
          <div className={styles.sectionLabel}>01 / 原始方法</div>
          <h2>{item.contentType === "video" ? "动作与镜头 Prompt" : "完整视觉 Prompt"}</h2>
          <div className={styles.promptText}>{item.prompt}</div>
          <div className={styles.copyRow}>
            <PromptCopyButton text={fullPromptPackage(item)} />
            {item.sourceUrl ? (
              <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                查看原作者内容 <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>

        <aside className={styles.promptSpec}>
          <div><span>风格</span><p>{item.style}</p></div>
          <div><span>光线</span><p>{item.lighting}</p></div>
          <div><span>镜头</span><p>{item.camera}</p></div>
          <div><span>色调</span><p>{item.palette}</p></div>
          <div><span>构图</span><p>{item.composition}</p></div>
          <div><span>画幅</span><p>{item.aspectRatio}</p></div>
        </aside>
      </section>

      <section className={styles.executionBand}>
        <div className={styles.sectionLabel}>02 / 复刻路径</div>
        <div className={styles.executionGrid}>
          <div>
            <Sparkles aria-hidden="true" />
            <h2>不要一次改完所有变量</h2>
            <p>{editorial.execution}</p>
          </div>
          <ol>
            {editorial.checks.map((check) => <li key={check}>{check}</li>)}
          </ol>
        </div>
      </section>

      <section className={styles.constraintBand}>
        <div>
          <span>负向约束</span>
          <p>{item.negativePrompt}</p>
        </div>
        <div>
          <span>模型建议</span>
          <p>{editorial.modelAdvice}</p>
        </div>
      </section>

      <section className={styles.sourceBand}>
        <div>
          <span>来源与编辑原则</span>
          <h2>保留作者，也保留判断。</h2>
        </div>
        <div>
          <p>本页收录公开案例并提供中文索引、结构化拆解和复刻建议，不冒充原作者作品，也不替代原帖上下文。</p>
          <p>作者：{item.authorName || item.authorHandle || "公开社区创作者"} · 收录于 {formatDate(item.importedAt)}</p>
          {item.sourceUrl ? <a href={item.sourceUrl} rel="noreferrer" target="_blank">访问原始来源 <ArrowUpRight aria-hidden="true" /></a> : null}
        </div>
      </section>

      <section className={styles.relatedSection}>
        <div className={styles.sectionLabel}>03 / 同类延伸</div>
        <h2>沿着这条线继续看</h2>
        <div className={styles.relatedGrid}>
          {related.map((relatedItem, index) => (
            <Link href={promptItemHref(relatedItem)} key={relatedItem.id}>
              <span>{String(index + 1).padStart(2, "0")} / {relatedItem.category}</span>
              <h3>{relatedItem.title}</h3>
              <p>{relatedItem.modelHints.slice(0, 3).join(" / ")}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className={styles.libraryFooter}>
        <Link href="/prompt">DestinyPixel Prompt 雷达</Link>
        <span>为中文 AI 视觉创作者整理公开方法与可复刻案例</span>
      </footer>
    </main>
  );
}
