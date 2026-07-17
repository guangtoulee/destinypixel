import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import PromptLibraryCard from "@/components/prompt-library-card";
import {
  getPromptCategoryProfile,
  promptCategoryProfiles,
  promptSnapshotItems,
} from "@/lib/prompt-library";
import { isHighQualityPromptArticle } from "@/lib/prompt-quality";
import { absoluteUrl, siteName } from "@/lib/seo";
import styles from "../../prompt-library.module.css";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 21600;

export function generateStaticParams() {
  return promptCategoryProfiles.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = getPromptCategoryProfile((await params).slug);
  if (!profile) return {};
  const path = `/prompt/category/${profile.slug}`;
  return {
    title: `${profile.name} AI Prompt 案例库`,
    description: profile.description,
    keywords: [profile.name, `${profile.name} Prompt`, "AI 提示词", "中文 Prompt", "提示词案例"],
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title: `${profile.name} AI Prompt 案例库`, description: profile.description, siteName },
  };
}

export default async function PromptCategoryPage({ params }: PageProps) {
  const profile = getPromptCategoryProfile((await params).slug);
  if (!profile) notFound();
  const items = promptSnapshotItems
    .filter(
      (item) =>
        item.category === profile.name &&
        (!(item.sourceType === "x" && !item.imageUrl && !item.videoUrl) || isHighQualityPromptArticle(item)),
    )
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${profile.name} AI Prompt 案例库`,
    description: profile.description,
    url: absoluteUrl(`/prompt/category/${profile.slug}`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 24).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: absoluteUrl(`/prompt/${item.sourceType === "x" && !item.imageUrl && !item.videoUrl ? "article" : "case"}/${encodeURIComponent(item.id)}`),
      })),
    },
  };

  return (
    <main className={styles.libraryPage} data-accent={profile.accent}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <nav className={styles.libraryNav}>
        <Link href="/prompt"><ArrowLeft aria-hidden="true" /> 返回 Prompt 雷达</Link>
        <Link href="/prompt/articles">文章档案</Link>
        <Link href="/prompt/about">编辑说明</Link>
      </nav>
      <header className={styles.archiveHero}>
        <p>{profile.eyebrow} / {items.length} ENTRIES</p>
        <h1>{profile.name}<br />Prompt 案例库</h1>
        <div><p>{profile.description}</p><strong>{profile.focus}</strong></div>
      </header>
      <nav className={styles.topicNav} aria-label="Prompt 分类">
        {promptCategoryProfiles.map((candidate) => (
          <Link aria-current={candidate.slug === profile.slug ? "page" : undefined} href={`/prompt/category/${candidate.slug}`} key={candidate.slug}>
            {candidate.name}
          </Link>
        ))}
      </nav>
      <section className={styles.archiveGrid}>
        {items.map((item, index) => <PromptLibraryCard item={item} index={index} key={item.id} />)}
      </section>
      <Link className={styles.archiveCta} href="/prompt">
        回到工作台扩写自己的 Prompt <ArrowRight aria-hidden="true" />
      </Link>
    </main>
  );
}
