import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../prompt-library.module.css";

export const metadata: Metadata = { title: "Prompt 雷达使用条款", alternates: { canonical: "/prompt/terms" } };

export default function PromptTermsPage() {
  return (
    <main className={styles.libraryPage} data-accent="paper">
      <nav className={styles.libraryNav}><Link href="/prompt/about"><ArrowLeft aria-hidden="true" /> 返回编辑说明</Link></nav>
      <article className={styles.legalPage}>
        <p>TERMS / 2026-07-12</p><h1>使用条款</h1>
        <h2>创作辅助</h2><p>扩写、分析和案例拆解用于创意参考，不保证任何模型生成结果、商业适用性或第三方平台审核结果。</p>
        <h2>来源与权利</h2><p>公开案例的原始作品、文字和媒体权利归各自权利人所有。本站提供索引、中文整理与方法分析；使用者应自行确认复刻、商用和二次发布权限。</p>
        <h2>禁止用途</h2><p>不得利用本站生成违法内容、侵犯隐私、冒充他人、性化未成年人，或绕过模型与平台的安全规则。</p>
        <h2>纠错与下架</h2><p>发现来源、作者或内容归属错误，或需要提出权利请求，请通过 DestinyPixel GitHub 仓库的 Issues 页面提交原始链接和必要说明。</p>
      </article>
    </main>
  );
}
