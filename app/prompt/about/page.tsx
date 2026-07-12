import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { promptCategoryProfiles, promptSnapshotItems } from "@/lib/prompt-library";
import styles from "../prompt-library.module.css";

export const metadata: Metadata = {
  title: "关于 Prompt 雷达：数据来源与编辑原则",
  description: "了解 DestinyPixel Prompt 雷达如何收集公开 AI 视觉案例、保留作者来源、制作中文索引并控制收录质量。",
  alternates: { canonical: "/prompt/about" },
};

export default function PromptAboutPage() {
  const xCount = promptSnapshotItems.filter((item) => item.sourceType === "x").length;
  const caseCount = promptSnapshotItems.length - xCount;
  return (
    <main className={styles.libraryPage} data-accent="mint">
      <nav className={styles.libraryNav}>
        <Link href="/prompt"><ArrowLeft aria-hidden="true" /> 返回 Prompt 雷达</Link>
        <Link href="/prompt/privacy">隐私</Link>
        <Link href="/prompt/terms">使用条款</Link>
      </nav>
      <header className={styles.archiveHero}>
        <p>ABOUT / EDITORIAL STANDARD</p>
        <h1>我们收集方法，<br />不偷走作者。</h1>
        <div><p>Prompt 雷达是面向中文 AI 视觉创作者的公开案例索引与创作工作台。</p><strong>{xCount} 条公开信号 · {caseCount} 个案例 · {promptCategoryProfiles.length} 个主题</strong></div>
      </header>
      <section className={styles.principleGrid}>
        <article><span>01</span><h2>来源可追溯</h2><p>公开社区内容尽量保留作者、原帖链接和发布时间。详情页中的拆解与建议由本站重新组织，不冒充原作者原话。</p></article>
        <article><span>02</span><h2>中文不是直译</h2><p>标题和摘要帮助中文用户快速判断相关性；Prompt 原文优先保留，避免模型名、参数和镜头语言在翻译中失真。</p></article>
        <article><span>03</span><h2>只索引有价值的页面</h2><p>案例可以长期保留，但只有具备来源、完整方法和编辑增量的精选页面进入站点地图，其余页面不会批量争夺搜索排名。</p></article>
        <article><span>04</span><h2>尊重删除请求</h2><p>原作者或权利人可以提供原始链接和身份说明申请下架。确认后会从公开页面和后续数据快照中移除。</p></article>
      </section>
      <section className={styles.contactBand}>
        <div><span>联系 / 纠错 / 下架</span><h2>让档案保持诚实。</h2></div>
        <a href="https://github.com/guangtoulee/destinypixel/issues" rel="noreferrer" target="_blank">提交纠错或下架请求 <ArrowUpRight aria-hidden="true" /></a>
      </section>
    </main>
  );
}
