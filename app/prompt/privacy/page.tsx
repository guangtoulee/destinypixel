import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../prompt-library.module.css";

export const metadata: Metadata = { title: "Prompt 雷达隐私说明", alternates: { canonical: "/prompt/privacy" } };

export default function PromptPrivacyPage() {
  return (
    <main className={styles.libraryPage} data-accent="paper">
      <nav className={styles.libraryNav}><Link href="/prompt/about"><ArrowLeft aria-hidden="true" /> 返回编辑说明</Link></nav>
      <article className={styles.legalPage}>
        <p>PRIVACY / 2026-07-12</p><h1>隐私说明</h1>
        <h2>你提交的内容</h2><p>描述扩写和图片反推仅用于完成当次请求。请不要上传身份证件、联系方式、未授权私密照片或其他敏感信息。</p>
        <h2>公开案例</h2><p>雷达收录公开网页中可访问的作者名、链接、发布时间、公开互动指标和视觉方法。管理员可以对收录内容执行置顶或删除。</p>
        <h2>必要日志</h2><p>托管平台和服务提供商可能处理完成请求所必需的网络日志、错误信息与安全记录。本站不会出售用户上传的图片或 Prompt。</p>
        <h2>联系</h2><p>隐私、纠错和删除请求可通过 DestinyPixel GitHub 仓库的 Issues 页面提交。</p>
      </article>
    </main>
  );
}
