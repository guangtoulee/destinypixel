import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PromptLibraryCard from "@/components/prompt-library-card";
import { isPromptArticle, promptSnapshotItems } from "@/lib/prompt-library";
import { siteName } from "@/lib/seo";
import styles from "../prompt-library.module.css";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "AI 视觉趋势与 Prompt 文章档案",
  description: "按时间整理公开社区中的 AI 图片、视频、模型与 Prompt 工作流讨论，并提供中文索引和编辑拆解。",
  alternates: { canonical: "/prompt/articles" },
  openGraph: {
    type: "website",
    url: "/prompt/articles",
    title: "AI 视觉趋势与 Prompt 文章档案",
    description: "公开 AI 视觉方法的中文索引、来源与复刻建议。",
    siteName,
  },
};

export default function PromptArticlesPage() {
  const articles = promptSnapshotItems
    .filter(isPromptArticle)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return (
    <main className={styles.libraryPage} data-accent="acid">
      <nav className={styles.libraryNav}>
        <Link href="/prompt"><ArrowLeft aria-hidden="true" /> 返回 Prompt 雷达</Link>
        <Link href="/prompt/about">编辑说明</Link>
      </nav>
      <header className={styles.archiveHero}>
        <p>PUBLIC SIGNALS / CHRONOLOGICAL</p>
        <h1>AI 视觉<br />文章档案</h1>
        <div>
          <p>按发布时间从新到旧整理，不把热度误当结论。</p>
          <strong>每篇保留原作者链接，并补充适用模型、复刻路径和中文编辑判断。</strong>
        </div>
      </header>
      <div className={styles.archiveTicker}>
        <span>{articles.length} 篇当前收录</span>
        <span>每日三次更新</span>
        <span>公开来源可追溯</span>
      </div>
      <section className={styles.archiveGrid}>
        {articles.map((item, index) => <PromptLibraryCard item={item} index={index} key={item.id} />)}
      </section>
    </main>
  );
}
